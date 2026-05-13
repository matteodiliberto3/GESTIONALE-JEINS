import type { ReactNode, HTMLAttributes } from 'react';
import { ExternalLink, MoreHorizontal } from 'lucide-react';

interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
    title?: ReactNode;
    subtitle?: ReactNode;
    actions?: ReactNode;
    headerAction?: ReactNode;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    bodyClassName?: string;
}

const paddingMap = { none: 'p-0', sm: 'p-3', md: 'p-4', lg: 'p-6' };

export function Card({
    title, subtitle, actions, headerAction, padding = 'md',
    bodyClassName = '', className = '', children, ...rest
}: CardProps) {
    const notify = (action: string) => {
        window.dispatchEvent(new CustomEvent('app:notice', {
            detail: { title: action, message: 'Azione collegata. La vista completa arriverà in questa sezione.' },
        }));
    };

    return (
        <div className={`card ${className}`} {...rest}>
            {(title || actions) && (
                <div className="flex items-start justify-between px-4 pt-4">
                    <div>
                        {title && <h3 className="text-sm font-semibold text-ink">{title}</h3>}
                        {subtitle && <p className="text-xs text-ink-subtle mt-0.5">{subtitle}</p>}
                    </div>
                    <div className="flex items-center gap-1">
                        {actions}
                        {headerAction === undefined ? (
                            <>
                                <button
                                    className="icon-btn"
                                    type="button"
                                    aria-label="Apri dettaglio"
                                    onClick={() => notify('Dettaglio')}
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </button>
                                <button
                                    className="icon-btn"
                                    type="button"
                                    aria-label="Altre opzioni"
                                    onClick={() => notify('Altre opzioni')}
                                >
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
