import { Flag } from 'lucide-react';

interface PriorityBadgeProps {
    priority: 'Bassa' | 'Media' | 'Alta';
    label?: string;
    showIcon?: boolean;
}

const tone = {
    Bassa: { dot: 'bg-emerald-400', text: 'text-emerald-300', bg: 'bg-emerald-500/10', label: 'Low Priority' },
    Media: { dot: 'bg-amber-400',   text: 'text-amber-300',   bg: 'bg-amber-500/10',   label: 'Medium Priority' },
    Alta:  { dot: 'bg-rose-400',    text: 'text-rose-300',    bg: 'bg-rose-500/10',    label: 'High Priority' },
};

export function PriorityBadge({ priority, label, showIcon = true }: PriorityBadgeProps) {
    const t = tone[priority];
    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium ${t.bg} ${t.text}`}>
            {showIcon ? (
                <Flag className="w-3 h-3" />
            ) : (
                <span className={`w-1.5 h-1.5 rounded-full ${t.dot}`} />
            )}
            <span>{label || t.label}</span>
        </span>
    );
}
