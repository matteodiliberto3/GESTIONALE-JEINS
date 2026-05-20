import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ClientiView } from '../views/ClientiView';
import { AppModal } from '../components/AppModal';
import { AddClientForm, EditClientForm } from '../features/forms/modals';
import { useClientMutations, useClients } from '../features/data/hooks';
import { useConflictUpdate } from '../hooks/useConflictUpdate';
import { clientsAPI } from '../services/api';
import { queryKeys } from '../lib/query/keys';
import type { Client } from '../types/models';

export function ClientsPage() {
    const qc = useQueryClient();
    const { data: clients = [], isLoading, error } = useClients();
    const { create, updateStatus, remove } = useClientMutations();
    const [addOpen, setAddOpen] = useState(false);
    const [editClient, setEditClient] = useState<Client | null>(null);

    const refresh = () => qc.invalidateQueries({ queryKey: queryKeys.clients });

    const conflict = useConflictUpdate<Record<string, unknown>>({
        entityType: 'cliente',
        entityId: editClient?.id || '',
        currentVersion: editClient?.version,
        updateFn: payload => clientsAPI.update(editClient!.id, payload),
        onSuccess: () => {
            refresh();
            setEditClient(null);
        },
    });

    if (isLoading) return <p className="text-ink-muted">Caricamento clienti…</p>;
    if (error) return <p className="text-rose-400">{(error as Error).message}</p>;

    return (
        <>
            <ClientiView
                clients={clients}
                onUpdateStatus={(id, status) => updateStatus.mutate({ id, status })}
                onEdit={setEditClient}
                onDelete={id => {
                    if (window.confirm('Eliminare il cliente? Progetti e contratti collegati verranno rimossi.')) {
                        remove.mutate(id);
                    }
                }}
                onOpenAdd={() => setAddOpen(true)}
            />
            <AppModal isOpen={addOpen} onClose={() => setAddOpen(false)}>
                <AddClientForm
                    onSubmit={async data => {
                        await create.mutateAsync(data);
                        setAddOpen(false);
                    }}
                />
            </AppModal>
            <AppModal isOpen={!!editClient} onClose={() => setEditClient(null)}>
                {editClient && (
                    <EditClientForm
                        client={editClient}
                        onSubmit={data => conflict.executeUpdate(data, editClient.version)}
                    />
                )}
            </AppModal>
            {conflict.ConflictModal}
        </>
    );
}
