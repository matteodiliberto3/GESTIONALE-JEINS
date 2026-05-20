/** Notifiche in-app — sostituisce il dispatch diretto di `app:notice`. */

export interface NoticeDetail {
    title: string;
    message?: string;
}

export function openNotice(title: string, message?: string) {
    window.dispatchEvent(
        new CustomEvent<NoticeDetail>('app:notice', {
            detail: { title, message: message ?? '' },
        }),
    );
}
