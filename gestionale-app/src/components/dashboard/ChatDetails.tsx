import { useState } from 'react';
import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Send, Smile, Paperclip } from 'lucide-react';
import type { Message, User } from '../../types/models';

interface ChatDetailsProps {
    chatName: string;
    members: User[];
    messages: Message[];
    currentUserId?: string;
    onSend?: (body: string) => void;
}

export function ChatDetails({ chatName, members, messages, currentUserId, onSend }: ChatDetailsProps) {
    const [text, setText] = useState('');

    const notice = (title: string, message: string) => {
        window.dispatchEvent(new CustomEvent('app:notice', { detail: { title, message } }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = text.trim();
        if (!trimmed) return;
        onSend?.(trimmed);
        setText('');
    };

    return (
        <Card title="Chat Details" subtitle={chatName}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex -space-x-2">
                    {members.slice(0, 4).map(m => (
                        <Avatar key={m.id} name={m.name} src={m.avatarUrl} color={m.color} size="sm" ring />
                    ))}
                </div>
                <span className="text-[11px] text-ink-subtle">{members.length} membri</span>
            </div>

            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1 mb-3 scrollbar-thin">
                {messages.length === 0 && (
                    <div className="text-xs text-ink-subtle italic py-3 text-center">
                        Nessun messaggio ancora. Rompi il ghiaccio!
                    </div>
                )}
                {messages.slice(-20).map(m => {
                    const mine = m.senderId === currentUserId;
                    return (
                        <div key={m.id} className={`flex gap-2 ${mine ? 'flex-row-reverse' : ''}`}>
                            {!mine && (
                                <Avatar name={m.senderName || '?'} src={m.senderAvatar} color={m.senderColor} size="xs" />
                            )}
                            <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-xs leading-relaxed
                                             ${mine
                                                ? 'bg-grad-violet text-white rounded-br-sm'
                                                : 'bg-surface-inset text-ink rounded-bl-sm'}`}>
                                {!mine && <p className="text-[10px] font-medium opacity-70 mb-0.5">{m.senderName}</p>}
                                {m.body}
                            </div>
                        </div>
                    );
                })}
            </div>

            <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <button
                    type="button"
                    className="icon-btn !w-8 !h-8"
                    aria-label="Allegato"
                    onClick={() => notice('Allegati', 'Qui verrà collegato il caricamento file nella chat.')}
                >
                    <Paperclip className="w-4 h-4" />
                </button>
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Scrivi un messaggio…"
                    className="input flex-1 !py-2"
                />
                <button
                    type="button"
                    className="icon-btn !w-8 !h-8"
                    aria-label="Emoji"
                    onClick={() => setText(t => `${t}${t ? ' ' : ''}:)`)}
                >
                    <Smile className="w-4 h-4" />
                </button>
                <button
                    type="submit"
                    disabled={!text.trim()}
                    className="btn-primary !p-2 !w-9 !h-9"
                    aria-label="Invia"
                >
                    <Send className="w-4 h-4" />
                </button>
            </form>
        </Card>
    );
}
