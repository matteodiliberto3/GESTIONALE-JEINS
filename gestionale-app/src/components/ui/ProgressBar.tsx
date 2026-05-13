interface ProgressBarProps {
    value: number;
    max?: number;
    tone?: 'violet' | 'cyan' | 'pink' | 'emerald' | 'amber';
    showLabel?: boolean;
    height?: 'thin' | 'normal' | 'thick';
}

const toneClass = {
    violet:  'bg-grad-violet',
    cyan:    'bg-grad-cyan',
    pink:    'bg-grad-pink',
    emerald: 'bg-grad-emerald',
    amber:   'bg-amber-500',
};

const heights = { thin: 'h-1', normal: 'h-1.5', thick: 'h-2.5' };

export function ProgressBar({
    value, max = 100, tone = 'violet', showLabel = false, height = 'normal',
}: ProgressBarProps) {
    const pct = Math.max(0, Math.min(100, (value / max) * 100));
    return (
        <div className="w-full">
            {showLabel && (
                <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-ink-subtle">Progress</span>
                    <span className="text-[11px] font-medium text-ink">{Math.round(pct)}%</span>
                </div>
            )}
            <div className={`w-full ${heights[height]} bg-surface-inset rounded-full overflow-hidden`}>
                <div
                    className={`${heights[height]} ${toneClass[tone]} rounded-full transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}
