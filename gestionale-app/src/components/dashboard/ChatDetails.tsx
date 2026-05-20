import { Maximize2 } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import type { User } from '../../types/models';

interface ChatDetailsProps {
    members?: User[];
    onOpen?: () => void;
}

export function ChatDetails({ members, onOpen }: ChatDetailsProps) {
    const peers = members && members.length >= 1 ? members.slice(0, 4) : [];

    return (
        <section className="bento-panel p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
                {peers.length > 0 ? (
                    <div className="flex -space-x-2">
                        {peers.slice(0, 2).map(p => (
                            <Avatar key={p.id} name={p.name} color={p.color} size="sm" ring />
                        ))}
                    </div>
                ) : (
                    <div className="w-8 h-8 rounded-full bg-surface-inset border border-line/50" />
                )}
                <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink truncate">Chat di progetto</p>
                    <p className="text-xs text-ink-subtle truncate">
                        {peers.length > 0
                            ? `${peers.length} membri`
                            : 'Nessun membro collegato'}
                    </p>
                </div>
            </div>

            <button
                type="button"
                onClick={onOpen}
                className="icon-btn flex-shrink-0"
                aria-label="Apri chat"
            >
                <Maximize2 className="w-3.5 h-3.5" />
            </button>
        </section>
    );
}
