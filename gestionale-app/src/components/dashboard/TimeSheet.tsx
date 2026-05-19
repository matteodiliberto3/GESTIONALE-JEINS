import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { ProgressBar } from '../ui/ProgressBar';
import { StaggerItem, StaggerList } from '../motion/StaggerList';
import type { TimeEntrySummary } from '../../types/models';

interface TimeSheetProps {
    summary: TimeEntrySummary[];
    period?: 'week' | 'month' | 'year';
}

export function TimeSheet({ summary, period = 'month' }: TimeSheetProps) {
    const max = Math.max(1, ...summary.map(s => Number(s.totalHours)));
    const periodLabel = period === 'week' ? '7 gg' : period === 'year' ? '1 anno' : '30 gg';

    return (
        <Card variant="panel" title="Time Sheet" subtitle={`Ore registrate negli ultimi ${periodLabel}`}>
            <StaggerList className="space-y-3">
                {summary.length === 0 && (
                    <div className="text-xs text-ink-subtle italic py-2">
                        Nessuna ora registrata. Aggiungine una per popolare il widget.
                    </div>
                )}
                {summary.slice(0, 5).map(s => (
                    <StaggerItem key={s.id}>
                        <div className="flex items-center gap-3">
                            <Avatar name={s.name} src={s.avatarUrl} color={s.color} size="sm" />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <p className="text-sm font-medium text-ink truncate">{s.name}</p>
                                    <p className="text-xs text-ink-muted whitespace-nowrap">
                                        {Number(s.totalHours).toFixed(1)} h · {s.entryCount} entries
                                    </p>
                                </div>
                                <ProgressBar value={Number(s.totalHours)} max={max} tone="violet" height="thin" />
                            </div>
                        </div>
                    </StaggerItem>
                ))}
            </StaggerList>
        </Card>
    );
}
