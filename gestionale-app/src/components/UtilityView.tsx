import { ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export function UtilityView({
    icon: Icon, title, subtitle, primaryLabel, onPrimary, cards,
}: {
    icon: LucideIcon;
    title: string;
    subtitle: string;
    primaryLabel: string;
    onPrimary: () => void;
    cards: [string, string][];
}) {
    return (
        <div className="card p-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-grad-brand shadow-glow-brand flex items-center justify-center text-white">
                        <Icon className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-ink">{title}</h2>
                        <p className="text-sm text-ink-muted">{subtitle}</p>
                    </div>
                </div>
                <button className="btn-primary" onClick={onPrimary}>
                    {primaryLabel}
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
                {cards.map(([heading, body]) => (
                    <div key={heading} className="card-inset p-4">
                        <h3 className="text-sm font-semibold text-ink">{heading}</h3>
                        <p className="text-xs text-ink-subtle mt-1 leading-relaxed">{body}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
