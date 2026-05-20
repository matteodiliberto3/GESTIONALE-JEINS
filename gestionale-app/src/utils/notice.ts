/** Notifiche in-app (toast) — evento globale `app:notice`. */

import type { ToastType } from '../components/ui/Toast';

export interface NoticeDetail {
    title: string;
    message?: string;
    variant?: ToastType;
}

export function showNotice(variant: ToastType, title: string, message?: string) {
    window.dispatchEvent(
        new CustomEvent<NoticeDetail>('app:notice', {
            detail: { variant, title, message: message ?? '' },
        }),
    );
}

/** Informativo (comportamento legacy). */
export function openNotice(title: string, message?: string) {
    showNotice('info', title, message);
}
