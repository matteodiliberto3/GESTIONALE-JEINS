import { useEffect, useCallback } from 'react';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/ui/Toast';
import type { NoticeDetail } from '../utils/notice';

export function NoticeProvider({ children }: { children: React.ReactNode }) {
    const { toasts, info, success, error, warning, removeToast } = useToast();

    const onNotice = useCallback(
        (e: Event) => {
            const { title, message, variant = 'info' } = (e as CustomEvent<NoticeDetail>).detail;
            const text = message ? `${title} — ${message}` : title;
            const duration = variant === 'error' ? 5200 : 4200;
            if (variant === 'success') success(text, duration);
            else if (variant === 'error') error(text, duration);
            else if (variant === 'warning') warning(text, duration);
            else info(text, duration);
        },
        [info, success, error, warning],
    );

    useEffect(() => {
        window.addEventListener('app:notice', onNotice);
        return () => window.removeEventListener('app:notice', onNotice);
    }, [onNotice]);

    return (
        <>
            {children}
            <ToastContainer toasts={toasts} onClose={removeToast} />
        </>
    );
}
