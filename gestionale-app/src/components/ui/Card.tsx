import type { ReactNode, HTMLAttributes, FC } from 'react';
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
            <div className={`${shell} h-full ${className}`} {...rest}>
                {(title || actions) && (
                    <div className="flex items-start justify-between px-5 pt-5">
                        <div>
                            {title && <h3 className="text-sm font-semibold text-ink tracking-tight">{title}</h3>}
                            {subtitle && <p className="text-xs text-ink-subtle mt-0.5">{subtitle}</p>}
                        </div>
                        <div className="flex items-center gap-1">
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
                        </div>
                    </div>
                )}
                <div className={`${paddingMap[padding]} ${bodyClassName}`}>{children}</div>
            </div>
        );
    }

    return (
        <div
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
        </div>
    );
};

export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
    return <div className={cn('mb-4', className)} {...props}>{children}</div>;
}

export function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
    return <h3 className={cn('text-xl font-semibold text-ink', className)} {...props}>{children}</h3>;
}

export function CardContent({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
    return <div className={cn('text-ink-muted', className)} {...props}>{children}</div>;
}

export function CardFooter({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
    return <div className={cn('mt-4 pt-4 border-t border-line/50', className)} {...props}>{children}</div>;
}
