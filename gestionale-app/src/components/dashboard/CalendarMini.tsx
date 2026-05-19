import { useMemo } from 'react';
import { LayoutGroup, motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { Clock } from 'lucide-react';
import { SPRING } from '../../motion/presets';
import { useReducedMotion } from '../../motion/useReducedMotion';

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

function isToday(d: Date) {
    return isSameDay(d, new Date());
}

export function CalendarMini({ events, selectedDate = new Date(), onSelectDate }: CalendarMiniProps) {
    const reduced = useReducedMotion();
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
        <Card variant="panel" title="Calendar" bodyClassName="pt-0">
            <LayoutGroup id="cal-week">
                <div className="grid grid-cols-7 gap-1.5 mb-5">
                    {days.map(d => {
                        const selected = isSameDay(d, selectedDate);
                        const today = isToday(d);
                        return (
                            <button
                                key={d.toISOString()}
                                type="button"
                                onClick={() => onSelectDate?.(d)}
                                className={`relative flex flex-col items-center justify-center rounded-xl py-2.5 overflow-hidden
                                    ${selected ? 'text-white' : `bento-panel--task border border-line/40 hover:border-brand-500/25
                                       ${today ? 'ring-1 ring-brand-500/40' : ''}`}`}
                            >
                                {selected && !reduced && (
                                    <motion.span
                                        layoutId="cal-day-pill"
                                        className="absolute inset-0 rounded-xl bg-grad-violet shadow-glow-violet border border-brand-500/30"
                                        transition={SPRING.snap}
                                    />
                                )}
                                {selected && reduced && (
                                    <span className="absolute inset-0 rounded-xl bg-grad-violet shadow-glow-violet border border-brand-500/30" />
                                )}
                                <span className={`relative z-10 text-base font-semibold leading-none tabular-nums
                                    ${selected ? 'text-white' : 'text-ink'}`}>
                                    {d.getDate()}
                                </span>
                                <span className={`relative z-10 text-[10px] uppercase mt-1 font-medium tracking-wide
                                    ${selected ? 'text-white/85' : 'text-ink-muted'}`}>
                                    {DAY_LABELS[(d.getDay() + 6) % 7]}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </LayoutGroup>

            <p className="text-[11px] uppercase tracking-[0.18em] text-brand-300/90 font-semibold mb-3">
                Schedule Today
            </p>
            <div className="space-y-2 max-h-44 overflow-y-auto pr-1 scrollbar-thin">
                {todayEvents.length === 0 && (
                    <p className="text-xs text-ink-muted italic py-2">Nessun evento in programma.</p>
                )}
                {todayEvents.map(e => (
                    <motion.button
                        key={e.id}
                        type="button"
                        whileTap={reduced ? undefined : { scale: 0.99 }}
                        transition={SPRING.snap}
                        onClick={() => window.dispatchEvent(new CustomEvent('app:notice', {
                            detail: {
                                title: e.title,
                                message: `${fmtTime(e.startTime)}${e.endTime ? ` - ${fmtTime(e.endTime)}` : ''}`,
                            },
                        }))}
                        className="w-full text-left bento-panel--task px-3 py-2.5 flex items-center gap-3
                                   border border-line/40 hover:border-brand-500/30
                                   hover:bg-surface-inset/80 transition-colors"
                    >
                        <div className="w-1 h-9 rounded-full bg-grad-violet shrink-0 shadow-glow-violet" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-ink truncate">{e.title}</p>
                            <p className="text-[11px] text-ink-muted flex items-center gap-1 mt-0.5">
                                <Clock className="w-3 h-3 text-ink-subtle shrink-0" />
                                {fmtTime(e.startTime)}{e.endTime ? ` – ${fmtTime(e.endTime)}` : ''}
                            </p>
                        </div>
                    </motion.button>
                ))}
            </div>
        </Card>
    );
}
