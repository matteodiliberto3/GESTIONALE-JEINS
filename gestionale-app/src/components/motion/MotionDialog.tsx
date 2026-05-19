import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { fade, scaleIn } from '../../motion/variants';
import { useReducedMotion } from '../../motion/useReducedMotion';

interface MotionDialogProps {
    open: boolean;
    onClose: () => void;
    children: ReactNode;
    className?: string;
    labelledBy?: string;
}

/** Modal shell — backdrop dims, panel scales in (context: overlay action). */
export function MotionDialog({ open, onClose, children, className = '', labelledBy }: MotionDialogProps) {
    const reduced = useReducedMotion();

    return (
        <AnimatePresence>
            {open && (
                <div
                    className="fixed inset-0 z-[70] flex items-center justify-center px-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby={labelledBy}
                >
                    <motion.button
                        type="button"
                        className="absolute inset-0 bg-black/55 backdrop-blur-sm"
                        variants={fade}
                        initial="hidden"
                        animate="show"
                        exit="exit"
                        transition={reduced ? { duration: 0 } : undefined}
                        onClick={onClose}
                        aria-label="Chiudi"
                    />
                    <motion.div
                        className={className}
                        variants={scaleIn}
                        initial="hidden"
                        animate="show"
                        exit="exit"
                        transition={reduced ? { duration: 0 } : undefined}
                    >
                        {children}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
