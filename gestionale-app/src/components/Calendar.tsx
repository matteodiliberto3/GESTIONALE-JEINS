import React, { useState, useEffect } from 'react';
import { Plus, Clock, Users, CheckCircle, XCircle, Phone, AlertCircle } from 'lucide-react';
import { eventsAPI, usersAPI } from '../services/api.ts';

interface Event {
    id: string;
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    isCall: boolean;
    callLink?: string;
    creatorId: string;
    creatorName?: string;
    participants?: Participant[];
}

interface Participant {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    status: 'pending' | 'accepted' | 'declined';
}

interface CalendarProps {
    currentUser: any;
}

export default function Calendar({ currentUser }: CalendarProps) {
    const [events, setEvents] = useState<Event[]>([]);
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Carica eventi e utenti
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [eventsData, usersData] = await Promise.all([
                eventsAPI.getAll({}),
                usersAPI.getAll(),
            ]);
            setEvents(eventsData);
            setAllUsers(usersData);
        } catch (error) {
            console.error('Errore nel caricamento:', error);
            alert('Errore nel caricamento degli eventi');
        } finally {
            setLoading(false);
        }
    };

    // Filtra eventi per il mese selezionato
    const getMonthEvents = () => {
        const start = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        const end = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0, 23, 59, 59);
        return events.filter(event => {
            const eventStart = new Date(event.startTime);
            return eventStart >= start && eventStart <= end;
        });
    };

    // Ottieni giorni del mese
    const getDaysInMonth = () => {
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];
        
        // Aggiungi giorni vuoti all'inizio
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }

        // Aggiungi giorni del mese
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(day);
        }

        return days;
    };

    // Ottieni eventi per un giorno specifico
    const getEventsForDay = (day: number | null) => {
        if (day === null) return [];
        const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
        return events.filter(event => {
            const eventDate = new Date(event.startTime);
            return eventDate.toDateString() === date.toDateString();
        });
    };

    // Naviga mese
    const changeMonth = (direction: number) => {
        setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + direction, 1));
    };

    // Formatta data/ora
    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('it-IT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    };

    // Gestione RSVP
    const handleRSVP = async (eventId: string, status: 'accepted' | 'declined') => {
        try {
            await eventsAPI.rsvp(eventId, status);
            await loadData(); // Ricarica eventi per aggiornare partecipanti
            if (selectedEvent?.id === eventId) {
                // Ricarica dettagli evento se aperto
                const updated = events.find(e => e.id === eventId);
                if (updated) setSelectedEvent(updated);
            }
        } catch (error: any) {
            alert(error.message || 'Errore nell\'aggiornamento RSVP');
        }
    };

    // Ottieni stato RSVP dell'utente corrente
    const getMyRSVPStatus = (event: Event) => {
        if (!currentUser) return null;
        const participant = event.participants?.find(p => p.userId === currentUser.id);
        return participant?.status || null;
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64 text-ink-muted">Caricamento eventi…</div>;
    }

    const monthEvents = getMonthEvents();
    const days = getDaysInMonth();
    const monthNames = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 
                       'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="bento-panel p-5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => changeMonth(-1)}
                            className="icon-btn"
                        >
                            ‹
                        </button>
                        <h2 className="text-xl font-semibold text-ink tracking-tight">
                            {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                        </h2>
                        <button
                            onClick={() => changeMonth(1)}
                            className="icon-btn"
                        >
                            ›
                        </button>
                        <button
                            onClick={() => setSelectedDate(new Date())}
                            className="btn-soft text-xs px-3 py-1.5"
                        >
                            Oggi
                        </button>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="btn-primary"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Nuovo Evento</span>
                    </button>
                </div>

                {/* Griglia Calendario */}
                <div className="grid grid-cols-7 gap-1">
                    {/* Nomi giorni */}
                    {dayNames.map(day => (
                        <div key={day} className="py-2 text-center text-xs font-semibold uppercase tracking-wider text-ink-muted">
                            {day}
                        </div>
                    ))}

                    {/* Giorni */}
                    {days.map((day, index) => {
                        const dayEvents = getEventsForDay(day);
                        const isToday = day !== null && 
                            new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day).toDateString() === 
                            new Date().toDateString();

                        return (
                            <div
                                key={index}
                                className={`min-h-[100px] p-1.5 rounded-xl border transition-colors ${
                                    day === null
                                        ? 'border-transparent bg-transparent'
                                        : 'border-line/40 bg-surface-inset/35 hover:bg-surface-inset/55'
                                } ${isToday ? 'ring-1 ring-brand-500/50' : ''}`}
                            >
                                {day !== null && (
                                    <>
                                        <div className={`text-sm font-semibold mb-1.5 tabular-nums ${isToday ? 'text-brand-300' : 'text-ink'}`}>
                                            {day}
                                        </div>
                                        <div className="space-y-1">
                                            {dayEvents.slice(0, 3).map(event => (
                                                <div
                                                    key={event.id}
                                                    onClick={() => {
                                                        setSelectedEvent(event);
                                                        setIsModalOpen(true);
                                                    }}
                                                    className={`text-[11px] px-1.5 py-1 rounded-md cursor-pointer truncate font-medium ${
                                                        event.isCall
                                                            ? 'bg-cyan-500/15 text-cyan-200 hover:bg-cyan-500/25 border border-cyan-500/20'
                                                            : 'bg-brand-500/15 text-brand-200 hover:bg-brand-500/25 border border-brand-500/20'
                                                    }`}
                                                    title={event.title}
                                                >
                                                    {event.isCall && <Phone className="w-3 h-3 inline mr-1" />}
                                                    {formatTime(event.startTime)} {event.title}
                                                </div>
                                            ))}
                                            {dayEvents.length > 3 && (
                                                <div className="text-xs text-ink-subtle">
                                                    +{dayEvents.length - 3} altri
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Lista Eventi del Mese */}
            <div className="bento-panel p-6">
                <h3 className="text-lg font-semibold text-ink tracking-tight mb-4">Eventi di {monthNames[selectedDate.getMonth()]}</h3>
                {monthEvents.length === 0 ? (
                    <p className="text-ink-muted text-sm">Nessun evento questo mese</p>
                ) : (
                    <div className="space-y-3">
                        {monthEvents.map(event => {
                            const myStatus = getMyRSVPStatus(event);
                            return (
                                <div
                                    key={event.id}
                                    onClick={() => {
                                        setSelectedEvent(event);
                                        setIsModalOpen(true);
                                    }}
                                    className="p-4 bento-panel--task border border-line/40 rounded-2xl hover:border-brand-500/30 cursor-pointer transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                {event.isCall && (
                                                    <Phone className="w-4 h-4 text-cyan-300 shrink-0" />
                                                )}
                                                <h4 className="font-semibold text-ink truncate">{event.title}</h4>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-muted">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4 text-ink-subtle" />
                                                    {formatDateTime(event.startTime)} - {formatTime(event.endTime)}
                                                </div>
                                                {event.participants && event.participants.length > 0 && (
                                                    <div className="flex items-center gap-1">
                                                        <Users className="w-4 h-4" />
                                                        {event.participants.length} partecipanti
                                                    </div>
                                                )}
                                            </div>
                                            {event.description && (
                                                <p className="text-sm text-ink-muted mt-2 line-clamp-2">{event.description}</p>
                                            )}
                                        </div>
                                        {myStatus && (
                                            <div className="ml-4">
                                                {myStatus === 'accepted' && (
                                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                                )}
                                                {myStatus === 'declined' && (
                                                    <XCircle className="w-5 h-5 text-red-500" />
                                                )}
                                                {myStatus === 'pending' && (
                                                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modale Dettaglio Evento */}
            {isModalOpen && selectedEvent && (
                <EventDetailModal
                    event={selectedEvent}
                    currentUser={currentUser}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedEvent(null);
                    }}
                    onRSVP={handleRSVP}
                    onRefresh={loadData}
                />
            )}

            {/* Modale Crea Evento */}
            {isCreateModalOpen && (
                <CreateEventModal
                    allUsers={allUsers}
                    currentUser={currentUser}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={() => {
                        setIsCreateModalOpen(false);
                        loadData();
                    }}
                />
            )}
        </div>
    );
}

// Modale Dettaglio Evento
function EventDetailModal({ event, currentUser, onClose, onRSVP }: any) {
    const myStatus = event.participants?.find((p: Participant) => p.userId === currentUser?.id)?.status;

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('it-IT', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'accepted': return 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25';
            case 'declined': return 'bg-rose-500/15 text-rose-300 border border-rose-500/25';
            default: return 'bg-amber-500/15 text-amber-300 border border-amber-500/25';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'accepted': return 'Accettato';
            case 'declined': return 'Rifiutato';
            default: return 'In attesa';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>
            <div className="relative bento-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-raised">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 icon-btn z-10"
                >
                    <XCircle className="w-6 h-6" />
                </button>

                <div className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                        {event.isCall && (
                            <div className="p-3 bg-cyan-500/15 rounded-xl border border-cyan-500/25">
                                <Phone className="w-6 h-6 text-cyan-300" />
                            </div>
                        )}
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-ink mb-2">{event.title}</h2>
                            {event.description && (
                                <p className="text-ink-muted mb-4">{event.description}</p>
                            )}
                            <div className="space-y-2 text-sm text-ink-muted">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    <span>{formatDateTime(event.startTime)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    <span>Fine: {formatDateTime(event.endTime)}</span>
                                </div>
                                {event.creatorName && (
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4" />
                                        <span>Creato da: {event.creatorName}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Link Call (solo per call e visibile a creatore e partecipanti) */}
                    {event.isCall && event.callLink && (
                        (currentUser?.id === event.creatorId || myStatus === 'accepted') && (
                            <div className="mb-6 p-4 bg-cyan-500/10 border border-cyan-500/25 rounded-lg">
                                <h3 className="font-medium text-ink mb-2 flex items-center gap-2">
                                    <Phone className="w-5 h-5 text-cyan-300" />
                                    <span>Link per la Call</span>
                                </h3>
                                <div className="flex items-center gap-2">
                                    <a
                                        href={event.callLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-primary flex-1 justify-center"
                                    >
                                        Apri Call
                                    </a>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(event.callLink!);
                                            alert('Link copiato negli appunti!');
                                        }}
                                        className="btn-soft px-4 py-2"
                                        title="Copia link"
                                    >
                                        📋
                                    </button>
                                </div>
                                <p className="text-xs text-ink-muted mt-2 break-all">{event.callLink}</p>
                            </div>
                        )
                    )}

                    {/* RSVP Buttons (solo se non è il creatore e non è già accettato/rifiutato) */}
                    {currentUser && event.creatorId !== currentUser.id && (
                        <div className="mb-6 p-4 bg-surface-inset/60 rounded-lg">
                            <h3 className="font-medium text-ink mb-3">Il tuo invito</h3>
                            {myStatus ? (
                                <div className="flex items-center gap-2">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(myStatus)}`}>
                                        {getStatusLabel(myStatus)}
                                    </span>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => onRSVP(event.id, 'accepted')}
                                        className="btn-primary flex-1 bg-emerald-600 hover:brightness-110"
                                    >
                                        Accetta
                                    </button>
                                    <button
                                        onClick={() => onRSVP(event.id, 'declined')}
                                        className="btn-primary flex-1 bg-rose-600 hover:brightness-110"
                                    >
                                        Rifiuta
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Partecipanti */}
                    {event.participants && event.participants.length > 0 && (
                        <div>
                            <h3 className="font-semibold text-ink mb-3">Partecipanti ({event.participants.length})</h3>
                            <div className="space-y-2">
                                {event.participants.map((participant: Participant) => (
                                    <div
                                        key={participant.id}
                                        className="flex items-center justify-between p-3 bg-surface-inset/60 rounded-lg"
                                    >
                                        <div>
                                            <div className="font-medium text-ink">{participant.userName}</div>
                                            <div className="text-sm text-ink-muted">{participant.userEmail}</div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(participant.status)}`}>
                                            {getStatusLabel(participant.status)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Modale Crea Evento
function CreateEventModal({ allUsers, currentUser, onClose, onSuccess }: any) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        isCall: false,
        callLink: '',
        participantIds: [] as string[],
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.title || !formData.startTime || !formData.endTime) {
            setError('Titolo, data inizio e fine sono obbligatori');
            return;
        }

        if (new Date(formData.endTime) <= new Date(formData.startTime)) {
            setError('La data di fine deve essere successiva alla data di inizio');
            return;
        }

        if (formData.isCall && !formData.callLink) {
            setError('Il link per la call è obbligatorio per le call');
            return;
        }

        try {
            setLoading(true);
            await eventsAPI.create({
                title: formData.title,
                description: formData.description || undefined,
                startTime: formData.startTime,
                endTime: formData.endTime,
                isCall: formData.isCall,
                callLink: formData.isCall ? formData.callLink : undefined,
                participantIds: formData.isCall ? formData.participantIds : undefined,
            });
            onSuccess();
        } catch (err: any) {
            setError(err.message || 'Errore nella creazione dell\'evento');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleParticipant = (userId: string) => {
        setFormData(prev => ({
            ...prev,
            participantIds: prev.participantIds.includes(userId)
                ? prev.participantIds.filter(id => id !== userId)
                : [...prev.participantIds, userId],
        }));
    };

    // Precompila data/ora di inizio e fine
    const now = new Date();
    const defaultStart = new Date(now.getTime() + 60 * 60 * 1000); // 1 ora da ora
    const defaultEnd = new Date(defaultStart.getTime() + 60 * 60 * 1000); // 1 ora dopo

    const formatDateTimeLocal = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>
            <div className="relative bento-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-raised">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 icon-btn z-10"
                >
                    <XCircle className="w-6 h-6" />
                </button>

                <div className="p-6">
                    <h2 className="text-2xl font-bold text-ink mb-6">Crea nuovo evento</h2>

                    {error && (
                        <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-ink-muted mb-1">
                                Titolo *
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                className="input"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-ink-muted mb-1">
                                Descrizione
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                className="input"
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-ink-muted mb-1">
                                    Data/Ora Inizio *
                                </label>
                                <input
                                    type="datetime-local"
                                    value={formData.startTime || formatDateTimeLocal(defaultStart)}
                                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                                    className="input"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-ink-muted mb-1">
                                    Data/Ora Fine *
                                </label>
                                <input
                                    type="datetime-local"
                                    value={formData.endTime || formatDateTimeLocal(defaultEnd)}
                                    onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                                    className="input"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="isCall"
                                checked={formData.isCall}
                                onChange={(e) => setFormData(prev => ({ ...prev, isCall: e.target.checked }))}
                                className="w-4 h-4 rounded border-line/60 text-brand-500 focus:ring-brand-500/40"
                            />
                            <label htmlFor="isCall" className="ml-2 text-sm font-medium text-ink-muted flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                È una Call (con inviti)
                            </label>
                        </div>

                        {formData.isCall && (
                            <div>
                                <label className="block text-sm font-medium text-ink-muted mb-1">
                                    Link per la Call *
                                </label>
                                <input
                                    type="url"
                                    value={formData.callLink}
                                    onChange={(e) => setFormData(prev => ({ ...prev, callLink: e.target.value }))}
                                    placeholder="https://meet.google.com/xxx-xxxx-xxx o link Zoom, Teams, ecc."
                                    className="input"
                                    required={formData.isCall}
                                />
                                <p className="text-xs text-ink-subtle mt-1">
                                    Inserisci il link per la videoconferenza (Google Meet, Zoom, Teams, ecc.)
                                </p>
                            </div>
                        )}

                        {formData.isCall && (
                            <div>
                                <label className="block text-sm font-medium text-ink-muted mb-2">
                                    Invita Partecipanti
                                </label>
                                <div className="max-h-48 overflow-y-auto border border-line/60 rounded-xl p-3 space-y-2 bg-surface-inset/40">
                                    {allUsers
                                        .filter((u: any) => u.id !== currentUser?.id)
                                        .map((user: any) => (
                                            <label
                                                key={user.id}
                                                className="flex items-center p-2 hover:bg-surface-inset/60 rounded cursor-pointer"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={formData.participantIds.includes(user.id)}
                                                    onChange={() => handleToggleParticipant(user.id)}
                                                    className="w-4 h-4 rounded border-line/60 text-brand-500 focus:ring-brand-500/40"
                                                />
                                                <div className="ml-3">
                                                    <div className="text-sm font-medium text-ink">{user.name}</div>
                                                    {user.email && (
                                                        <div className="text-xs text-ink-subtle">{user.email}</div>
                                                    )}
                                                </div>
                                            </label>
                                        ))}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="btn-soft"
                            >
                                Annulla
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary disabled:opacity-50"
                            >
                                {loading ? 'Creazione...' : 'Crea Evento'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

