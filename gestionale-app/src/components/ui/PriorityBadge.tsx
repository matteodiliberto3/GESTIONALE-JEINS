interface PriorityBadgeProps {
    priority: 'Bassa' | 'Media' | 'Alta';
    label?: string;
    showIcon?: boolean;
}

const tone = {
    Bassa: {
        dot: 'bg-emerald-400',
        text: 'text-emerald-300',
        bg: 'bg-emerald-500/10 border border-emerald-500/20',
        label: 'Low Priority',
    },
    Media: {
        dot: 'bg-amber-400',
        text: 'text-amber-300',
        bg: 'bg-amber-500/10 border border-amber-500/20',
        label: 'Medium Priority',
    },
    Alta: {
        dot: 'bg-rose-400',
        text: 'text-rose-300',
        bg: 'bg-rose-500/10 border border-rose-500/20',
        label: 'High Priority',
    },
};

export function PriorityBadge({ priority, label, showIcon = false }: PriorityBadgeProps) {
    const t = tone[priority];
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full
                        text-[10px] font-semibold ${t.bg} ${t.text}`}
        >
            {!showIcon && <span className={`w-1.5 h-1.5 rounded-full ${t.dot}`} />}
            <span>{label || t.label}</span>
        </span>
    );
}
