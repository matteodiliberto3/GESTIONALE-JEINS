import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { ProgressBar } from '../ui/ProgressBar';
import { StaggerItem, StaggerList } from '../motion/StaggerList';
import { FileUp, MessageCircle, AtSign, CheckCircle2, FilePlus2 } from 'lucide-react';
import type { Activity } from '../../types/models';

interface ActivityFeedProps {
    activities: Activity[];
}

const typeMeta: Record<string, { icon: typeof MessageCircle; label: string; tone: string }> = {
    'task.created':   { icon: FilePlus2,    label: 'ha creato un task',     tone: 'text-brand-300' },
    'task.moved':     { icon: CheckCircle2, label: 'ha spostato un task',   tone: 'text-cyan-300' },
    'file.uploaded':  { icon: FileUp,       label: 'ha caricato un file',   tone: 'text-pink-300' },
    'comment.added':  { icon: MessageCircle, label: 'ha commentato',        tone: 'text-emerald-300' },
    'mention':        { icon: AtSign,       label: 'ti ha menzionato',      tone: 'text-amber-300' },
};

function timeAgo(iso: string) {
    const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (s < 60) return `${s}s fa`;
    if (s < 3600) return `${Math.floor(s / 60)}m fa`;
    if (s < 86400) return `${Math.floor(s / 3600)}h fa`;
    return `${Math.floor(s / 86400)}g fa`;
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
    return (
        <Card variant="panel" title="Activity" subtitle="Today" headerAction={null} className="flex flex-col">
            <StaggerList className="space-y-3 flex-1 max-h-80 lg:max-h-[min(72vh,42rem)] overflow-y-auto pr-1 scrollbar-thin">
                {activities.length === 0 && (
                    <div className="text-xs text-ink-subtle italic py-2">
                        Nessuna attività recente.
                    </div>
                )}
                {activities.map(a => {
                    const meta = typeMeta[a.type] || { icon: MessageCircle, label: a.type, tone: 'text-ink-muted' };
                    const fileName = a.payload?.fileName as string | undefined;
                    const progress = a.payload?.progress as number | undefined;
                    const target = a.payload?.target as string | undefined;

                    return (
                        <StaggerItem key={a.id}>
                            <div className="flex items-start gap-3">
                                <Avatar
                                    name={a.actorName || '?'}
                                    src={a.actorAvatar}
                                    color={a.actorColor}
                                    size="sm"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-ink-muted leading-snug">
                                        <span className="font-medium text-ink">{a.actorName || 'Qualcuno'}</span>{' '}
                                        <span className={meta.tone}>{meta.label}</span>
                                        {target && <> su <span className="text-ink">{target}</span></>}
                                    </p>

                                    {fileName && (
                                        <div className="mt-2 card-inset p-2.5">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <div className="w-7 h-7 rounded-md bg-grad-violet flex items-center justify-center flex-shrink-0">
                                                    <FileUp className="w-3.5 h-3.5 text-white" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-medium text-ink truncate">{fileName}</p>
                                                    <p className="text-[10px] text-ink-subtle">{a.payload?.size || ''}</p>
                                                </div>
                                                {typeof progress === 'number' && (
                                                    <span className="text-[11px] text-ink-muted font-medium">{progress}%</span>
                                                )}
                                            </div>
                                            {typeof progress === 'number' && (
                                                <ProgressBar value={progress} tone="violet" height="thin" />
                                            )}
                                        </div>
                                    )}

                                    {a.payload?.body && (
                                        <p className="mt-1 text-xs text-ink-muted bg-surface-inset/60 rounded-lg px-2.5 py-1.5">
                                            {a.payload.body as string}
                                        </p>
                                    )}

                                    <p className="mt-1 text-[10px] text-ink-subtle">{timeAgo(a.createdAt)}</p>
                                </div>
                            </div>
                        </StaggerItem>
                    );
                })}
            </StaggerList>
        </Card>
    );
}
