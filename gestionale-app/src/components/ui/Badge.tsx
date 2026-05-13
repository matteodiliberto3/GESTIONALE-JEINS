import type { ReactNode } from 'react';

type Tone = 'violet' | 'cyan' | 'pink' | 'emerald' | 'amber' | 'rose' | 'neutral';

interface BadgeProps {
    children: ReactNode;
    tone?: Tone;
    dot?: boolean;
    className?: string;
}

const toneClasses: Record<Tone, string> = {
    violet:  'bg-brand-500/15 text-brand-300 border-brand-500/30',
    cyan:    'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    pink:    'bg-pink-500/15 text-pink-300 border-pink-500/30',
    emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    amber:   'bg-amber-500/15 text-amber-300 border-amber-500/30',
    rose:    'bg-rose-500/15 text-rose-300 border-rose-500/30',
    neutral: 'bg-surface-inset text-ink-muted border-line/70',
};

const dotColor: Record<Tone, string> = {
    violet:  'bg-brand-400',
    cyan:    'bg-cyan-400',
    pink:    'bg-pink-400',
    emerald: 'bg-emerald-400',
    amber:   'bg-amber-400',
    rose:    'bg-rose-400',
    neutral: 'bg-ink-subtle',
};

export function Badge({ children, tone = 'neutral', dot = false, className = '' }: BadgeProps) {
    return (
        <span className={`chip border ${toneClasses[tone]} ${className}`}>
            {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColor[tone]}`} />}
            {children}
        </span>
    );
}
