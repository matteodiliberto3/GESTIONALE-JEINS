import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { motion } from 'framer-motion';
import { StaggerItem, StaggerList } from '../motion/StaggerList';
import { FileText, ChevronDown } from 'lucide-react';
import { TRANSITION } from '../../motion/presets';
import { useReducedMotion } from '../../motion/useReducedMotion';
import type { Activity } from '../../types/models';

interface ActivityFeedProps {
    activities: Activity[];
}

function timeAgo(iso: string) {
    const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (s < 60) return `${s}s`;
    if (s < 3600) return `${Math.floor(s / 60)}m`;
    if (s < 86400) return `${Math.floor(s / 3600)}h`;
    return `${Math.floor(s / 86400)}g`;
}

type ActivityType = 'file.uploaded' | 'comment.added' | 'mention' | 'task.created' | 'task.moved';

const verbByType: Record<ActivityType, string> = {
    'file.uploaded': 'ha caricato un file su',
    'comment.added': 'ha commentato',
    'mention': 'ha menzionato',
    'task.created': 'ha creato',
    'task.moved': 'ha spostato',
};

export function ActivityFeed({ activities }: ActivityFeedProps) {
    const reduced = useReducedMotion();

    return (
        <Card
            variant="panel"
            title="Attività"
            headerAction={
                <button
                    type="button"
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md
                               text-xs text-ink-muted hover:text-ink hover:bg-surface-inset/60
                               transition-colors"
                >
                    Oggi <ChevronDown className="w-3 h-3" />
                </button>
            }
            bodyClassName="pt-1"
        >
            {activities.length === 0 ? (
                <div className="text-xs text-ink-subtle italic py-2">
                    Nessuna attività recente.
                </div>
            ) : (
                <StaggerList className="space-y-4 max-h-[min(64vh,40rem)] overflow-y-auto pr-1 scrollbar-thin">
                    {activities.map(a => {
                        const type = (a.type as ActivityType) || 'comment.added';
                        const verb = verbByType[type] || a.type;
                        const fileName = a.payload?.fileName as string | undefined;
                        const size = a.payload?.size as string | undefined;
                        const progress = a.payload?.progress as number | undefined;
                        const target = a.payload?.target as string | undefined;
                        const body = a.payload?.body as string | undefined;
                        const reply = a.payload?.reply as { author?: string; text?: string } | undefined;

                        return (
                            <StaggerItem key={a.id}>
                                <div className="flex items-start gap-2.5">
                                    <Avatar
                                        name={a.actorName || '?'}
                                        src={a.actorAvatar}
                                        color={a.actorColor}
                                        size="sm"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-ink-muted leading-snug">
                                            <span className="font-semibold text-ink">{a.actorName || 'Qualcuno'}</span>{' '}
                                            <span>{verb}</span>
                                            {target && (
                                                <> <span className="font-semibold text-ink">{target}</span></>
                                            )}
                                        </p>

                                        {fileName && (
                                            <div className="mt-2 rounded-xl bg-surface-inset/70 border border-line/40 p-2.5">
                                                <div className="flex items-center gap-2.5 mb-2">
                                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-grad-brand">
                                                        <FileText className="w-4 h-4 text-white" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-semibold text-ink truncate">{fileName}</p>
                                                        {size && (
                                                            <p className="text-[10px] text-ink-subtle">{size}</p>
                                                        )}
                                                    </div>
                                                    {typeof progress === 'number' && (
                                                        <span className="text-xs text-ink font-semibold tabular-nums">
                                                            {progress}%
                                                        </span>
                                                    )}
                                                </div>
                                                {typeof progress === 'number' && (
                                                    <div className="h-1 rounded-full bg-surface-inset overflow-hidden">
                                                        <motion.div
                                                            className="h-full rounded-full progress-glass-fill"
                                                            initial={reduced ? false : { width: 0 }}
                                                            animate={{ width: `${progress}%` }}
                                                            transition={reduced ? { duration: 0 } : TRANSITION.slow}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {body && (
                                            <div className="mt-2 rounded-xl bg-surface-inset/60 border border-line/30 px-3 py-2">
                                                <p className="text-xs text-ink-muted leading-relaxed">{body}</p>
                                            </div>
                                        )}

                                        {reply && reply.text && (
                                            <div className="mt-2 pl-3 border-l-2 border-brand-600/40">
                                                <p className="text-[11px] text-ink-muted leading-relaxed">
                                                    {reply.author && (
                                                        <span className="text-brand-400 font-medium">
                                                            @{reply.author}{' '}
                                                        </span>
                                                    )}
                                                    {reply.text}
                                                </p>
                                            </div>
                                        )}

                                        <p className="mt-1.5 text-[10px] text-ink-subtle">
                                            {timeAgo(a.createdAt)} fa
                                        </p>
                                    </div>
                                </div>
                            </StaggerItem>
                        );
                    })}
                </StaggerList>
            )}
        </Card>
    );
}
