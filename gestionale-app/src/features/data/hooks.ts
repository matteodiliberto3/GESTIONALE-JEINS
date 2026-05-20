import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { clientsAPI, contractsAPI, projectsAPI } from '../../services/api';
import { queryKeys } from '../../lib/query/keys';
import type { Client, Contract, Project } from '../../types/models';

export function useClients() {
    return useQuery({
        queryKey: queryKeys.clients,
        queryFn: () => clientsAPI.getAll() as Promise<Client[]>,
    });
}

export function useProjects(options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: queryKeys.projects,
        queryFn: () => projectsAPI.getAll() as Promise<Project[]>,
        enabled: options?.enabled !== false,
    });
}

export function useContracts() {
    return useQuery({
        queryKey: queryKeys.contracts,
        queryFn: () => contractsAPI.getAll() as Promise<Contract[]>,
    });
}

export function useClientMutations() {
    const qc = useQueryClient();
    const invalidate = () => {
        qc.invalidateQueries({ queryKey: queryKeys.clients });
        qc.invalidateQueries({ queryKey: queryKeys.projects });
        qc.invalidateQueries({ queryKey: queryKeys.contracts });
    };

    const create = useMutation({
        mutationFn: (data: Partial<Client>) => clientsAPI.create(data),
        onSuccess: invalidate,
    });

    const updateStatus = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) =>
            clientsAPI.updateStatus(id, status),
        onSuccess: invalidate,
    });

    const update = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
            clientsAPI.update(id, data),
        onSuccess: invalidate,
    });

    const remove = useMutation({
        mutationFn: (id: string) => clientsAPI.delete(id),
        onSuccess: invalidate,
    });

    return { create, update, updateStatus, remove };
}

export function useProjectMutations() {
    const qc = useQueryClient();
    const invalidate = () => {
        qc.invalidateQueries({ queryKey: queryKeys.projects });
        qc.invalidateQueries({ queryKey: queryKeys.clients });
        qc.invalidateQueries({ queryKey: queryKeys.contracts });
    };

    const create = useMutation({
        mutationFn: (data: unknown) => projectsAPI.create(data),
        onSuccess: invalidate,
    });

    const update = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
            projectsAPI.update(id, data),
        onSuccess: invalidate,
    });

    const updateStatus = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) =>
            projectsAPI.updateStatus(id, status),
        onSuccess: invalidate,
    });

    const remove = useMutation({
        mutationFn: (id: string) => projectsAPI.delete(id),
        onSuccess: invalidate,
    });

    const addTodo = useMutation({
        mutationFn: ({
            projectId,
            text,
            priority,
        }: {
            projectId: string;
            text: string;
            priority: string;
        }) => projectsAPI.addTodo(projectId, { text, priority }),
        onSuccess: invalidate,
    });

    const toggleTodo = useMutation({
        mutationFn: ({ projectId, todoId }: { projectId: string; todoId: string }) =>
            projectsAPI.toggleTodo(projectId, todoId),
        onSuccess: invalidate,
    });

    const deleteTodo = useMutation({
        mutationFn: ({ projectId, todoId }: { projectId: string; todoId: string }) =>
            projectsAPI.deleteTodo(projectId, todoId),
        onSuccess: invalidate,
    });

    return { create, update, updateStatus, remove, addTodo, toggleTodo, deleteTodo };
}

export function useContractMutations() {
    const qc = useQueryClient();
    const invalidate = () => qc.invalidateQueries({ queryKey: queryKeys.contracts });

    const create = useMutation({
        mutationFn: (data: unknown) => contractsAPI.create(data),
        onSuccess: invalidate,
    });

    const update = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
            contractsAPI.update(id, data),
        onSuccess: invalidate,
    });

    const updateStatus = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) =>
            contractsAPI.updateStatus(id, status),
        onSuccess: invalidate,
    });

    const remove = useMutation({
        mutationFn: (id: string) => contractsAPI.delete(id),
        onSuccess: invalidate,
    });

    return { create, update, updateStatus, remove };
}
