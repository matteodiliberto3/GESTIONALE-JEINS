/** Motion tokens — single source for timing (tactile, minimal, consistent). */

export const EASE_OUT = [0.23, 1, 0.32, 1] as const;
export const EASE_IN = [0.4, 0, 1, 1] as const;

export const DURATION = {
    instant: 0.12,
    fast: 0.18,
    normal: 0.28,
    slow: 0.42,
} as const;

export const STAGGER = {
    tight: 0.04,
    normal: 0.06,
    relaxed: 0.08,
} as const;

export const SPRING = {
    /** Buttons, toggles, small UI */
    snap: { type: 'spring' as const, stiffness: 480, damping: 34, mass: 0.8 },
    /** Panels, cards entering view */
    panel: { type: 'spring' as const, stiffness: 320, damping: 30, mass: 0.9 },
    /** Drag overlay, emphasis */
    soft: { type: 'spring' as const, stiffness: 260, damping: 28, mass: 1 },
};

export const TRANSITION = {
    fast: { duration: DURATION.fast, ease: EASE_OUT },
    normal: { duration: DURATION.normal, ease: EASE_OUT },
    slow: { duration: DURATION.slow, ease: EASE_OUT },
};
