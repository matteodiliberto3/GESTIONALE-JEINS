import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ProgettiView } from '../views/ProgettiView';
import { AppModal } from '../components/AppModal';
import { AddProjectForm, EditProjectForm } from '../features/forms/modals';
import { useClientMutations, useClients, useProjectMutations, useProjects } from '../features/data/hooks';
import { useConflictUpdate } from '../hooks/useConflictUpdate';
import { projectsAPI } from '../services/api';
import { queryKeys } from '../lib/query/keys';
import type { Project } from '../types/models';

export function ProjectsPage() {
    const qc = useQueryClient();
    const { data: clients = [] } = useClients();
    const { data: projects = [], isLoading, error } = useProjects();
    const projectMutations = useProjectMutations();
    const clientMutations = useClientMutations();
    const [addOpen, setAddOpen] = useState(false);
    const [editProject, setEditProject] = useState<Project | null>(null);

    const refresh = () => qc.invalidateQueries({ queryKey: queryKeys.projects });

    const conflict = useConflictUpdate<Record<string, unknown>>({
        entityType: 'progetto',
        entityId: editProject?.id || '',
        currentVersion: editProject?.version,
        updateFn: payload => projectsAPI.update(editProject!.id, payload),
        onSuccess: () => {
            refresh();
            setEditProject(null);
        },
    });

    const getClientName = (id: string) => clients.find(c => c.id === id)?.name || 'N/A';

    const addProject = async (data: Record<string, unknown>) => {
        let clientId = data.clientId as string | undefined;
        const typedName = String(data.clientName || '').trim();
        if (!clientId && typedName) {
            const match = clients.find(c => c.name.trim().toLowerCase() === typedName.toLowerCase());
            if (match) clientId = match.id;
            else {
                const newClient = await clientMutations.create.mutateAsync({ name: typedName });
                clientId = newClient.id;
            }
        }
        await projectMutations.create.mutateAsync({
            name: data.name,
            clientId,
            area: data.area,
            status: data.status,
        });
        setAddOpen(false);
    };

    if (isLoading) return <p className="text-ink-muted">Caricamento progetti…</p>;
    if (error) return <p className="text-rose-400">{(error as Error).message}</p>;

    return (
        <>
            <ProgettiView
                projects={projects}
                onUpdateStatus={(id, status) => projectMutations.updateStatus.mutate({ id, status })}
                onEdit={setEditProject}
                onAddTodo={(projectId, text, priority) =>
                    projectMutations.addTodo.mutate({ projectId, text, priority })}
                onToggleTodo={(projectId, todoId) =>
                    projectMutations.toggleTodo.mutate({ projectId, todoId })}
                onDeleteTodo={(projectId, todoId) =>
                    projectMutations.deleteTodo.mutate({ projectId, todoId })}
                onDelete={id => {
                    if (window.confirm('Eliminare il progetto?')) projectMutations.remove.mutate(id);
                }}
                onOpenAdd={() => setAddOpen(true)}
                getClientName={getClientName}
            />
            <AppModal isOpen={addOpen} onClose={() => setAddOpen(false)}>
                <AddProjectForm clients={clients} onSubmit={addProject} />
            </AppModal>
            <AppModal isOpen={!!editProject} onClose={() => setEditProject(null)}>
                {editProject && (
                    <EditProjectForm
                        project={editProject}
                        clients={clients}
                        onSubmit={data => conflict.executeUpdate(data, editProject.version)}
                    />
                )}
            </AppModal>
            {conflict.ConflictModal}
        </>
    );
}
