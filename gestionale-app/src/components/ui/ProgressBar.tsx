import { motion } from 'framer-motion';
import { TRANSITION } from '../../motion/presets';
import { useReducedMotion } from '../../motion/useReducedMotion';

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
    const reduced = useReducedMotion();
    const pct = Math.max(0, Math.min(100, (value / max) * 100));

    return (
        <div className="w-full">
            {showLabel && (
                <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-ink-subtle">Progress</span>
                    <span className="text-[11px] font-medium text-ink">{Math.round(pct)}%</span>
                </div>
            )}
            <div className={`progress-glass w-full ${heights[height]}`}>
                <motion.div
                    className={`${heights[height]} ${toneClass[tone]} progress-glass-fill rounded-full`}
                    initial={false}
                    animate={{ width: `${pct}%` }}
                    transition={reduced ? { duration: 0 } : TRANSITION.slow}
                />
            </div>
        </div>
    );
}
