import { useCallback, useState } from 'react';
import ConflictDialog from '../components/ConflictDialog';
import { updateWithConflictHandling } from '../utils/updateWithConflictHandling';
import type { ConflictData } from '../utils/conflictResolver';

export type ConflictEntityType = 'cliente' | 'progetto' | 'contratto' | 'task';

interface UseConflictUpdateOptions<T extends Record<string, unknown>> {
    entityType: ConflictEntityType;
    entityId: string;
    currentVersion?: number;
    updateFn: (payload: T & { expectedVersion?: number }) => Promise<unknown>;
    onSuccess?: () => void;
}

export function useConflictUpdate<T extends Record<string, unknown>>({
    entityType,
    entityId,
    currentVersion,
    updateFn,
    onSuccess,
}: UseConflictUpdateOptions<T>) {
    const [conflictOpen, setConflictOpen] = useState(false);
    const [conflictData, setConflictData] = useState<ConflictData | null>(null);
    const [pendingPayload, setPendingPayload] = useState<T | null>(null);

    const executeUpdate = useCallback(
        async (payload: T, version?: number) => {
            try {
                await updateWithConflictHandling({
                    entityId,
                    entityType,
                    currentVersion: version ?? currentVersion,
                    updateData: payload,
                    updateFunction: (data) => updateFn(data as T & { expectedVersion?: number }),
                    onConflict: (data) => {
                        setPendingPayload(payload);
                        setConflictData(data);
                        setConflictOpen(true);
                    },
                });
                onSuccess?.();
            } catch (e: unknown) {
                if ((e as Error).name !== 'ConcurrentModificationError') throw e;
            }
        },
        [entityId, entityType, currentVersion, updateFn, onSuccess],
    );

    const handleResolve = async (
        resolution: 'yours' | 'server' | 'merged',
        mergedData?: Record<string, unknown>,
    ) => {
        if (!pendingPayload || !conflictData) return;

        let finalPayload: T & { expectedVersion?: number };
        const serverVersion = (conflictData.serverData as { version?: number }).version;

        if (resolution === 'yours') {
            finalPayload = { ...pendingPayload, expectedVersion: serverVersion };
        } else if (resolution === 'server') {
            setConflictOpen(false);
            setPendingPayload(null);
            onSuccess?.();
            return;
        } else {
            finalPayload = { ...(mergedData || pendingPayload), expectedVersion: serverVersion } as T & {
                expectedVersion?: number;
            };
        }

        setConflictOpen(false);
        try {
            await updateFn(finalPayload);
            onSuccess?.();
        } catch {
            /* conflict dialog may reopen via onConflict */
        }
        setPendingPayload(null);
    };

    const ConflictModal = conflictData ? (
        <ConflictDialog
            isOpen={conflictOpen}
            onClose={() => setConflictOpen(false)}
            conflictData={conflictData}
            entityType={entityType}
            onResolve={handleResolve}
            onReload={() => {
                setConflictOpen(false);
                onSuccess?.();
            }}
        />
    ) : null;

    return { executeUpdate, ConflictModal };
}
