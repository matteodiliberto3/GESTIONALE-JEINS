import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { motion } from 'framer-motion';
import { StaggerItem, StaggerList } from '../motion/StaggerList';
import { TRANSITION } from '../../motion/presets';
import { useReducedMotion } from '../../motion/useReducedMotion';
import type { TimeEntrySummary } from '../../types/models';

interface TimeSheetProps {
    summary: TimeEntrySummary[];
    period?: 'week' | 'month' | 'year';
}

function formatHM(totalHours: number) {
    const total = Math.max(0, totalHours);
    const h = Math.floor(total);
    const m = Math.round((total - h) * 60);
    const s = Math.round((((total - h) * 60) - m) * 60);
    if (h === 0 && m === 0) return `${s}sec`;
    if (h === 0) return `${m}m ${s}sec`;
    return `${h}h ${m}m`;
}

export function TimeSheet({ summary }: TimeSheetProps) {
    const reduced = useReducedMotion();
    const max = Math.max(1, ...summary.map(s => Number(s.totalHours)));

    return (
        <Card variant="panel" title="Ore registrate" bodyClassName="pt-1">
            {summary.length === 0 ? (
                <div className="text-xs text-ink-subtle italic py-3">
                    Nessuna ora registrata. Aggiungine una per popolare il widget.
                </div>
            ) : (
                <StaggerList className="space-y-2.5">
                    {summary.slice(0, 4).map(s => {
                        const hours = Number(s.totalHours);
                        const pct = Math.max(6, (hours / max) * 100);
                        const label = formatHM(hours);
                        return (
                            <StaggerItem key={s.id}>
                                <div
                                    className="flex items-center gap-3 px-2 py-2 rounded-xl
                                               bg-surface-inset/40 border border-line/30
                                               hover:border-line/50 transition-colors"
                                >
                                    <Avatar name={s.name} src={s.avatarUrl} color={s.color} size="sm" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[13px] font-semibold text-ink truncate leading-tight">
                                            {s.name}
                                        </p>
                                        <p className="text-[10px] text-ink-subtle mt-0.5">
                                            Totale {label}
                                        </p>
                                    </div>
                                    <div className="w-24 h-1.5 rounded-full bg-surface-inset/80 overflow-hidden">
                                        <motion.div
                                            className="h-full rounded-full progress-glass-fill"
                                            initial={reduced ? false : { width: 0 }}
                                            animate={{ width: `${pct}%` }}
                                            transition={reduced ? { duration: 0 } : TRANSITION.slow}
                                        />
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
