import { Card } from '../ui/Card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { Sprint } from '../../types/models';

interface SprintVelocityProps {
    sprint?: Sprint | null;
    avgPoints?: number;
    deltaPct?: number;
    history?: { label: string; value: number }[];
}

export function SprintVelocity({
    sprint, avgPoints = 0, deltaPct = 0, history = [],
}: SprintVelocityProps) {
    const target = sprint?.targetPoints || 0;
    const completed = sprint?.completedPoints || 0;
    const pct = target > 0 ? Math.min(100, (completed / target) * 100) : 0;
    const radius = 70;
    const circ = Math.PI * radius;
    const offset = circ - (pct / 100) * circ;

    const isUp = deltaPct >= 0;
    const maxHistory = Math.max(1, ...history.map(h => h.value));

    return (
        <Card title="Sprint Velocity" subtitle={sprint?.name || 'Nessuno sprint attivo'}>
            <div className="flex items-center justify-between gap-4">
                <div className="relative flex-shrink-0">
                    <svg width={170} height={100} viewBox="0 0 170 100">
                        <defs>
                            <linearGradient id="velocity-grad" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%"   stopColor="#22D3EE" />
                                <stop offset="50%"  stopColor="#8B5CF6" />
                                <stop offset="100%" stopColor="#D946EF" />
                            </linearGradient>
                        </defs>
                        <path
                            d={`M 15 90 A ${radius} ${radius} 0 0 1 155 90`}
                            stroke="rgb(var(--line))"
                            strokeWidth={12}
                            fill="none"
                            strokeLinecap="round"
                        />
                        <path
                            d={`M 15 90 A ${radius} ${radius} 0 0 1 155 90`}
                            stroke="url(#velocity-grad)"
                            strokeWidth={12}
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={circ}
                            strokeDashoffset={offset}
                            style={{ transition: 'stroke-dashoffset 800ms ease-out' }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
                        <span className="text-2xl font-bold text-ink">{avgPoints.toFixed(2)}</span>
                        <span className="text-[10px] uppercase tracking-wider text-ink-subtle">Avg story points</span>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold
                                      ${isUp ? 'bg-emerald-500/10 text-emerald-300' : 'bg-rose-500/10 text-rose-300'}`}>
                        {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {Math.abs(deltaPct).toFixed(0)}%
                    </span>
                    <span className="text-[11px] text-ink-subtle">vs sprint precedente</span>
                </div>
            </div>

            {history.length > 0 && (
                <div className="mt-4 flex items-end gap-1.5 h-16">
                    {history.map((h, i) => {
                        const barH = (h.value / maxHistory) * 100;
                        return (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                <div className="w-full rounded-t-md bg-grad-violet/80" style={{ height: `${barH}%` }} />
                                <span className="text-[9px] text-ink-subtle uppercase">{h.label}</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </Card>
    );
}
