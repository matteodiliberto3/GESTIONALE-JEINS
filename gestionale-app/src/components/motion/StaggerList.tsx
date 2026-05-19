import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { listItem, listStagger } from '../../motion/variants';
import { useReducedMotion } from '../../motion/useReducedMotion';

interface StaggerListProps {
    children: ReactNode;
    className?: string;
}

export function StaggerList({ children, className = '' }: StaggerListProps) {
    const reduced = useReducedMotion();

    if (reduced) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div
            className={className}
            variants={listStagger}
            initial="hidden"
            animate="show"
        >
            {children}
        </motion.div>
    );
}

interface StaggerItemProps {
    children: ReactNode;
    className?: string;
}

export function StaggerItem({ children, className = '' }: StaggerItemProps) {
    const reduced = useReducedMotion();

    if (reduced) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div className={className} variants={listItem}>
            {children}
        </motion.div>
    );
}
