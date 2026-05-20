import { X } from 'lucide-react';
import type { ReactNode } from 'react';

export function AppModal({
    isOpen, onClose, children,
}: { isOpen: boolean; onClose: () => void; children: ReactNode }) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative card max-w-lg w-full max-h-[90vh] overflow-y-auto animate-fade-in">
                <button onClick={onClose} className="absolute top-3 right-3 icon-btn z-10" aria-label="Chiudi">
                    <X className="w-4 h-4" />
                </button>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
}
