import { motion } from 'framer-motion';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { SPRING } from '../../motion/presets';
import { useReducedMotion } from '../../motion/useReducedMotion';

type PressableProps = Omit<
    ComponentPropsWithoutRef<'button'>,
    'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'
> & {
    children: ReactNode;
    className?: string;
};

/** Tactile press — subtle scale, no bounce circus. */
export function Pressable({ children, className = '', disabled, ...rest }: PressableProps) {
    const reduced = useReducedMotion();

    if (reduced) {
        return (
            <button type="button" className={className} disabled={disabled} {...rest}>
                {children}
            </button>
        );
    }

    return (
        <motion.button
            type="button"
            className={className}
            disabled={disabled}
            whileHover={disabled ? undefined : { scale: 1.01 }}
            whileTap={disabled ? undefined : { scale: 0.98 }}
            transition={SPRING.snap}
            {...rest}
        >
            {children}
        </motion.button>
    );
}
