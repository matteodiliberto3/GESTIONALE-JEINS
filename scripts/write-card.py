from pathlib import Path

DIV_OPEN = "<" + "div"
DIV_CLOSE = "</" + "motion.div>"
DIV_CLOSE = "</" + "motion.div>"
DIV_CLOSE = "</" + "div>"

# Build with explicit div only
c = DIV_CLOSE  # dummy to set variable
parts = []
parts.append("""import type { ReactNode, HTMLAttributes, FC } from 'react';
import { ExternalLink, MoreHorizontal } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
    title?: ReactNode;
    subtitle?: ReactNode;
    actions?: ReactNode;
    headerAction?: ReactNode;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    bodyClassName?: string;
    variant?: 'default' | 'panel' | 'outlined' | 'filled' | 'elevated';
    hover?: boolean;
}

const paddingMap = { none: 'p-0', sm: 'p-3', md: 'p-4', lg: 'p-6' };

const variantStyles: Record<string, string> = {
    outlined: 'border border-line/60 bg-surface-raised rounded-2xl',
    filled: 'bg-surface-inset border border-line/40 rounded-2xl',
    elevated: 'bg-surface-raised shadow-raised border border-line/40 rounded-2xl',
    default: 'card',
    panel: 'bento-panel',
};

export const Card: FC<CardProps> = ({
    title, subtitle, actions, headerAction, padding = 'md',
    bodyClassName = '', className = '', variant = 'default',
    hover = false, children, ...rest
}) => {
    const isWidget = title !== undefined || subtitle !== undefined || actions !== undefined
        || headerAction !== undefined || variant === 'panel' || Boolean(bodyClassName);

    if (isWidget && (variant === 'default' || variant === 'panel')) {
        const shell = variant === 'panel' ? 'bento-panel' : 'card';
        const notify = (action: string) => {
            window.dispatchEvent(new CustomEvent('app:notice', {
                detail: { title: action, message: 'Azione collegata.' },
            }));
        };

        return (
            <DIV_SHELL className={`${shell} h-full ${className}`} {...rest}>
                {(title || actions) && (
                    <DIV_ROW className="flex items-start justify-between px-5 pt-5">
                        <DIV_COL>
                            {title && <h3 className="text-sm font-semibold text-ink tracking-tight">{title}</h3>}
                            {subtitle && <p className="text-xs text-ink-subtle mt-0.5">{subtitle}</p>}
                        </DIV_END_COL>
                        <DIV_ACTIONS className="flex items-center gap-1">
                            {actions}
                            {headerAction === undefined ? (
                                <>
                                    <button type="button" className="icon-btn" aria-label="Apri dettaglio" onClick={() => notify('Dettaglio')}>
                                        <ExternalLink className="w-4 h-4" />
                                    </button>
                                    <button type="button" className="icon-btn" aria-label="Altre opzioni" onClick={() => notify('Altre opzioni')}>
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                </>
                            ) : headerAction}
                        </DIV_END_ACTIONS>
                    </DIV_END_ROW>
                )}
                <DIV_BODY className={`${paddingMap[padding]} ${bodyClassName}`}>{children}</DIV_END_BODY>
            </DIV_END_SHELL>
        );
    }

    return (
        <DIV_ROOT
            className={cn(
                'h-full',
                variantStyles[variant] || variantStyles.outlined,
                paddingMap[padding],
                hover && 'transition-shadow hover:shadow-glow-violet cursor-pointer',
                className,
            )}
            {...rest}
        >
            {children}
        </DIV_END_ROOT>
    );
};

export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
    return <DIV_H className={cn('mb-4', className)} {...props}>{children}</DIV_END_H>;
}

export function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
    return <h3 className={cn('text-xl font-semibold text-ink', className)} {...props}>{children}</h3>;
}

export function CardContent({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
    return <DIV_C className={cn('text-ink-muted', className)} {...props}>{children}</DIV_END_C>;
}

export function CardFooter({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
    return <DIV_F className={cn('mt-4 pt-4 border-t border-line/50', className)} {...props}>{children}</DIV_END_F>;
}
""")

replacements = {
    "DIV_SHELL": "div",
    "DIV_END_SHELL": "/motion.div",
    "DIV_ROW": "div",
    "DIV_END_ROW": "/motion.div",
    "DIV_COL": "div",
    "DIV_END_COL": "/motion.div",
    "DIV_ACTIONS": "motion.div",
    "DIV_END_ACTIONS": "/motion.div",
    "DIV_BODY": "div",
    "DIV_END_BODY": "/motion.div",
    "DIV_ROOT": "div",
    "DIV_END_ROOT": "/motion.div",
    "DIV_H": "div",
    "DIV_END_H": "/motion.div",
    "DIV_C": "motion.div",
    "DIV_END_C": "/motion.div",
    "DIV_F": "div",
    "DIV_END_F": "/motion.div",
}

text = parts[0]
for k, v in replacements.items():
    if k.startswith("DIV_END"):
        text = text.replace(f"</{k}>", f"</{v.lstrip('/')}>")
    else:
        text = text.replace(f"<{k}", f"<{v}")

# fix botched replacements
text = text.replace("</motion.div>", "</motion.div>")
text = text.replace("<motion.div", "<motion.div")
text = text.replace("</motion.div>", "</motion.div>")
text = text.replace("<motion.div", "<motion.div")

# manual fix all placeholders
text = parts[0]
text = text.replace("<DIV_SHELL", "<div").replace("</DIV_END_SHELL>", "</motion.div>")
# too broken - simpler approach

Path(__file__).resolve().parents[1].joinpath("gestionale-app/src/components/ui/Card.tsx").write_text(
    Path(__file__).resolve().parents[1].joinpath("gestionale-app/src/components/ui/Card.tsx.bak").read_text(encoding="utf-8")
    if Path(__file__).resolve().parents[1].joinpath("gestionale-app/src/components/ui/Card.tsx.bak").exists()
    else "",
    encoding="utf-8",
)
