import { useEffect, useCallback } from 'react';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/ui/Toast';
import type { NoticeDetail } from '../utils/notice';

export function NoticeProvider({ children }: { children: React.ReactNode }) {
    const { toasts, info, removeToast } = useToast();

    const onNotice = useCallback(
        (e: Event) => {
            const { title, message } = (e as CustomEvent<NoticeDetail>).detail;
            const text = message ? `${title} — ${message}` : title;
            info(text, 4200);
        },
        [info],
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
