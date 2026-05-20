import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ContabilitaView } from '../views/ContabilitaView';
import { AppModal } from '../components/AppModal';
import { AddContractForm, EditContractForm } from '../features/forms/modals';
import { useClients, useContractMutations, useContracts, useProjects } from '../features/data/hooks';
import { useConflictUpdate } from '../hooks/useConflictUpdate';
import { contractsAPI } from '../services/api';
import { queryKeys } from '../lib/query/keys';
import type { Contract } from '../types/models';

export function BillingPage() {
    const qc = useQueryClient();
    const { data: clients = [] } = useClients();
    const { data: projects = [] } = useProjects();
    const { data: contracts = [], isLoading, error } = useContracts();
    const mutations = useContractMutations();
    const [addOpen, setAddOpen] = useState(false);
    const [editContract, setEditContract] = useState<Contract | null>(null);

    const refresh = () => qc.invalidateQueries({ queryKey: queryKeys.contracts });

    const conflict = useConflictUpdate<Record<string, unknown>>({
        entityType: 'contratto',
        entityId: editContract?.id || '',
        currentVersion: editContract?.version,
        updateFn: payload => contractsAPI.update(editContract!.id, payload),
        onSuccess: () => {
            refresh();
            setEditContract(null);
        },
    });

    const getClientName = (id: string) => clients.find(c => c.id === id)?.name || 'N/A';
    const getProjectName = (id: string) => projects.find(p => p.id === id)?.name || 'N/A';

    if (isLoading) return <p className="text-ink-muted">Caricamento documenti…</p>;
    if (error) return <p className="text-rose-400">{(error as Error).message}</p>;

    return (
        <>
            <ContabilitaView
                contracts={contracts}
                onUpdateStatus={(id, status) => mutations.updateStatus.mutate({ id, status })}
                onEdit={setEditContract}
                onDelete={id => {
                    if (window.confirm('Eliminare il documento?')) mutations.remove.mutate(id);
                }}
                onOpenAdd={() => setAddOpen(true)}
                getClientName={getClientName}
                getProjectName={getProjectName}
            />
            <AppModal isOpen={addOpen} onClose={() => setAddOpen(false)}>
                <AddContractForm
                    clients={clients}
                    projects={projects}
                    onSubmit={async data => {
                        await mutations.create.mutateAsync(data);
                        setAddOpen(false);
                    }}
                />
            </AppModal>
            <AppModal isOpen={!!editContract} onClose={() => setEditContract(null)}>
                {editContract && (
                    <EditContractForm
                        contract={editContract}
                        clients={clients}
                        projects={projects}
                        onSubmit={data => conflict.executeUpdate(data, editContract.version)}
                    />
                )}
            </AppModal>
            {conflict.ConflictModal}
        </>
    );
}
