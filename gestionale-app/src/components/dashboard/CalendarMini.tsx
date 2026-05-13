import { useMemo } from 'react';
import { Card } from '../ui/Card';
import { Clock } from 'lucide-react';

interface MiniEvent {
    id: string;
    title: string;
    startTime: string;
    endTime?: string;
}

interface CalendarMiniProps {
    events: MiniEvent[];
    selectedDate?: Date;
    onSelectDate?: (d: Date) => void;
}

const DAY_LABELS = ['Lu', 'Ma', 'Me', 'Gi', 'Ve', 'Sa', 'Do'];

function startOfWeek(d: Date) {
    const date = new Date(d);
    const day = (date.getDay() + 6) % 7;
    date.setDate(date.getDate() - day);
    date.setHours(0, 0, 0, 0);
    return date;
}

function fmtTime(iso: string) {
    return new Date(iso).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
}

function isSameDay(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function CalendarMini({ events, selectedDate = new Date(), onSelectDate }: CalendarMiniProps) {
    const weekStart = useMemo(() => startOfWeek(selectedDate), [selectedDate]);

    const days = useMemo(() => {
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(weekStart);
            d.setDate(weekStart.getDate() + i);
            return d;
        });
    }, [weekStart]);

    const todayEvents = useMemo(() => {
        return events
            .filter(e => isSameDay(new Date(e.startTime), selectedDate))
            .sort((a, b) => a.startTime.localeCompare(b.startTime));
    }, [events, selectedDate]);

    return (
        <Card title="Calendar">
            <div className="grid grid-cols-7 gap-1.5 mb-4">
                {days.map(d => {
                    const isSelected = isSameDay(d, selectedDate);
                    return (
                        <button
                            key={d.toISOString()}
                            onClick={() => onSelectDate?.(d)}
                            className={`flex flex-col items-center justify-center rounded-lg py-2 transition
                                        ${isSelected
                                            ? 'bg-grad-violet text-white shadow-glow-violet'
                                            : 'bg-surface-inset/60 text-ink-muted hover:bg-surface-inset hover:text-ink'}`}
                        >
                            <span className="text-base font-semibold leading-none">{d.getDate()}</span>
                            <span className="text-[10px] uppercase mt-1 opacity-80">
                                {DAY_LABELS[(d.getDay() + 6) % 7]}
                            </span>
                        </button>
                    );
                })}
            </div>

            <p className="text-[11px] uppercase tracking-wider text-ink-subtle font-medium mb-2">
                Schedule Today
            </p>
            <div className="space-y-2 max-h-44 overflow-y-auto pr-1 scrollbar-thin">
                {todayEvents.length === 0 && (
                    <div className="text-xs text-ink-subtle italic py-2">Nessun evento in programma.</div>
                )}
                {todayEvents.map(e => (
                    <button
                        key={e.id}
                        type="button"
                        onClick={() => window.dispatchEvent(new CustomEvent('app:notice', {
                            detail: {
                                title: e.title,
                                message: `${fmtTime(e.startTime)}${e.endTime ? ` - ${fmtTime(e.endTime)}` : ''}`,
                            },
                        }))}
                        className="w-full text-left card-inset px-3 py-2 flex items-center gap-3 hover:border-line-strong hover:bg-surface-inset/80 transition-colors active:scale-[0.99]"
                    >
                        <div className="w-1 h-8 rounded-full bg-grad-violet" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-ink truncate">{e.title}</p>
                            <p className="text-[11px] text-ink-subtle flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {fmtTime(e.startTime)}{e.endTime ? ` – ${fmtTime(e.endTime)}` : ''}
                            </p>
                        </div>
                    </button>
                ))}
            </div>
        </Card>
    );
}
