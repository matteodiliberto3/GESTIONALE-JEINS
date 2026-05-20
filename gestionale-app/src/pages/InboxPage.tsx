import { useEffect, useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { messagesAPI } from '../services/api';
import type { Chat, Message } from '../types/models';
import { Card } from '../components/ui/Card';

export function InboxPage() {
    const [chats, setChats] = useState<Chat[]>([]);
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [draft, setDraft] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        messagesAPI
            .getChats()
            .then((list: Chat[]) => {
                setChats(list);
                if (list.length) setActiveChatId(list[0].id);
            })
            .catch((e: Error) => setError(e.message))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!activeChatId) return;
        let cancelled = false;
        messagesAPI
            .getMessages(activeChatId)
            .then(msgs => { if (!cancelled) setMessages(msgs); })
            .catch((e: Error) => { if (!cancelled) setError(e.message); });
        return () => { cancelled = true; };
    }, [activeChatId]);

    const send = async () => {
        if (!activeChatId || !draft.trim()) return;
        const body = draft.trim();
        setDraft('');
        try {
            const msg = await messagesAPI.sendMessage(activeChatId, body);
            setMessages(prev => [...prev, msg]);
        } catch (e: unknown) {
            setError((e as Error).message);
        }
    };

    const activeChat = chats.find(c => c.id === activeChatId);

    if (loading) return <p className="text-ink-muted">Caricamento inbox…</p>;
    if (error) return <p className="text-rose-400">{error}</p>;

    return (
        <Card title="Inbox" subtitle="Chat di team e progetti" padding="none">
            <div className="flex min-h-[420px] border-t border-line/40">
                <aside className="w-56 border-r border-line/40 flex-shrink-0">
                    {chats.length === 0 ? (
                        <p className="p-4 text-xs text-ink-subtle italic">Nessuna chat. Creane una dal backend o dalla dashboard.</p>
                    ) : (
                        chats.map(chat => (
                            <button
                                key={chat.id}
                                type="button"
                                onClick={() => setActiveChatId(chat.id)}
                                className={`w-full text-left px-3 py-2.5 text-sm border-b border-line/30 hover:bg-surface-inset/60 ${
                                    activeChatId === chat.id ? 'bg-brand-500/10 text-ink' : 'text-ink-muted'
                                }`}
                            >
                                <span className="font-medium block truncate">
                                    {chat.name || 'Chat progetto'}
                                </span>
                                {chat.lastMessage && (
                                    <span className="text-[11px] text-ink-subtle truncate block">
                                        {chat.lastMessage.body}
                                    </span>
                                )}
                            </button>
                        ))
                    )}
                </aside>
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="px-4 py-3 border-b border-line/40 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-brand-300" />
                        <span className="text-sm font-medium text-ink">
                            {activeChat?.name || 'Seleziona una chat'}
                        </span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {!activeChatId && (
                            <p className="text-sm text-ink-subtle italic">Seleziona una conversazione.</p>
                        )}
                        {activeChatId && messages.map(m => (
                            <div key={m.id} className="card-inset px-3 py-2 max-w-[85%]">
                                <p className="text-[11px] text-ink-subtle mb-0.5">
                                    {m.senderName || 'Utente'} ·{' '}
                                    {new Date(m.createdAt).toLocaleString('it-IT')}
                                </p>
                                <p className="text-sm text-ink">{m.body}</p>
                            </div>
                        ))}
                        {!messages.length && activeChatId && (
                            <p className="text-sm text-ink-subtle italic">Nessun messaggio.</p>
                        )}
                    </div>
                    {activeChatId && (
                        <div className="p-3 border-t border-line/40 flex gap-2">
                            <input
                                className="input flex-1"
                                value={draft}
                                onChange={e => setDraft(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && send()}
                                placeholder="Scrivi un messaggio…"
                            />
                            <button type="button" className="btn-primary px-3" onClick={send} aria-label="Invia">
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
}
