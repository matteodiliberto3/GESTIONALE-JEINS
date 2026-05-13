import { useState, useEffect, useMemo, useRef } from 'react';
import { X, Plus, ArrowRight, Bell, Inbox, BarChart3, Settings, HelpCircle } from 'lucide-react';
import type { ReactNode } from 'react';

import Login from './components/Login';
import Calendar from './components/Calendar';
import { ThemeProvider } from './theme/ThemeProvider';
import { AppShell } from './layout/AppShell';
import { DashboardView } from './components/dashboard/DashboardView';
import { ClientiView } from './views/ClientiView';
import { ProgettiView } from './views/ProgettiView';
import { ContabilitaView } from './views/ContabilitaView';

import {
    clientsAPI, projectsAPI, contractsAPI, authAPI, usersAPI,
} from './services/api';
import type { Client, Contract, Project, User } from './types/models';

const AREA_OPTIONS = ['CDA', 'Marketing', 'IT', 'Commerciale'];
const CLIENT_STATUS_OPTIONS = ['Prospect', 'In Contatto', 'In Negoziazione', 'Attivo', 'Chiuso', 'Perso'];
const PROJECT_STATUS_OPTIONS = ['Pianificato', 'In Corso', 'In Revisione', 'Completato', 'Sospeso'];
const CONTRACT_TYPE_OPTIONS = ['Contratto', 'Fattura', 'Preventivo'];
const CONTRACT_STATUS_OPTIONS = ['Bozza', 'Inviato', 'Firmato', 'Pagato', 'Annullato'];

export default function App() {
    return (
        <ThemeProvider>
            <AppRoot />
        </ThemeProvider>
    );
}

function AppRoot() {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    const [clients, setClients] = useState<Client[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [contracts, setContracts] = useState<Contract[]>([]);

    const [activeView, setActiveView] = useState('dashboard');
    const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
    const [modal, setModal] = useState<ReactNode | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { setLoading(false); return; }

        authAPI.verify()
            .then(async (res: any) => {
                let me = res.user as User;
                try { me = await usersAPI.getMe(); } catch { /* ignore */ }
                setUser(me);
                setIsAuthenticated(true);
                await loadData();
            })
            .catch(() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            })
            .finally(() => setLoading(false));
    }, []);

    const loadData = async () => {
        try {
            const [c, p, ct] = await Promise.all([
                clientsAPI.getAll(),
                projectsAPI.getAll(),
                contractsAPI.getAll(),
            ]);
            setClients(c);
            setProjects(p);
            setContracts(ct);
            if (!activeProjectId && p.length) setActiveProjectId(p[0].id);
        } catch (err) {
            console.error('Errore caricamento dati:', err);
        }
    };

    const handleLoginSuccess = async (data: any) => {
        let me = data as User;
        try { me = await usersAPI.getMe(); } catch { /* ignore */ }
        setUser(me);
        setIsAuthenticated(true);
        await loadData();
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
        setClients([]); setProjects([]); setContracts([]);
    };

    // --- CRUD wrappers ---

    const addClient = async (data: any) => {
        try {
            const created = await clientsAPI.create(data);
            setClients(c => [...c, created]);
            setModal(null);
        } catch (e: any) { alert(e.message); }
    };
    const updateClientStatus = async (id: string, status: string) => {
        try {
            const u = await clientsAPI.updateStatus(id, status);
            setClients(c => c.map(x => x.id === id ? u : x));
        } catch (e: any) { alert(e.message); }
    };
    const deleteClient = async (id: string) => {
        if (!window.confirm('Eliminare il cliente? I progetti e contratti collegati verranno rimossi.')) return;
        try {
            await clientsAPI.delete(id);
            setClients(c => c.filter(x => x.id !== id));
            setProjects(p => p.filter(x => x.clientId !== id));
            setContracts(ct => ct.filter(x => x.clientId !== id));
        } catch (e: any) { alert(e.message); }
    };

    const addProject = async (data: any) => {
        try {
            let clientId: string | undefined = data.clientId;
            const typedName: string = (data.clientName || '').trim();

            if (!clientId && typedName) {
                const match = clients.find(
                    c => c.name.trim().toLowerCase() === typedName.toLowerCase()
                );
                if (match) {
                    clientId = match.id;
                } else {
                    const newClient = await clientsAPI.create({ name: typedName });
                    setClients(c => [...c, newClient]);
                    clientId = newClient.id;
                }
            }

            const payload = {
                name: data.name,
                clientId,
                area: data.area,
                status: data.status,
            };
            const created = await projectsAPI.create(payload);
            setProjects(p => [...p, created]);
            setModal(null);
        } catch (e: any) { alert(e.message); }
    };
    const updateProjectStatus = async (id: string, status: string) => {
        try {
            const u = await projectsAPI.updateStatus(id, status);
            setProjects(p => p.map(x => x.id === id ? { ...x, status: u.status } : x));
        } catch (e: any) { alert(e.message); }
    };
    const deleteProject = async (id: string) => {
        if (!window.confirm('Eliminare il progetto?')) return;
        try {
            await projectsAPI.delete(id);
            setProjects(p => p.filter(x => x.id !== id));
            setContracts(ct => ct.filter(x => x.projectId !== id));
        } catch (e: any) { alert(e.message); }
    };

    const addTodo = async (projectId: string, text: string, priority: string) => {
        try {
            const t = await projectsAPI.addTodo(projectId, { text, priority });
            setProjects(p => p.map(x => x.id === projectId ? { ...x, todos: [...(x.todos || []), t] } : x));
        } catch (e: any) { alert(e.message); }
    };
    const toggleTodo = async (projectId: string, todoId: string) => {
        try {
            const u = await projectsAPI.toggleTodo(projectId, todoId);
            setProjects(p => p.map(x => x.id === projectId
                ? { ...x, todos: (x.todos || []).map((t: any) => t.id === todoId ? u : t) }
                : x));
        } catch (e: any) { alert(e.message); }
    };
    const deleteTodo = async (projectId: string, todoId: string) => {
        try {
            await projectsAPI.deleteTodo(projectId, todoId);
            setProjects(p => p.map(x => x.id === projectId
                ? { ...x, todos: (x.todos || []).filter((t: any) => t.id !== todoId) }
                : x));
        } catch (e: any) { alert(e.message); }
    };

    const addContract = async (data: any) => {
        try {
            const created = await contractsAPI.create(data);
            setContracts(c => [...c, created]);
            setModal(null);
        } catch (e: any) { alert(e.message); }
    };
    const updateContractStatus = async (id: string, status: string) => {
        try {
            const u = await contractsAPI.updateStatus(id, status);
            setContracts(c => c.map(x => x.id === id ? u : x));
        } catch (e: any) { alert(e.message); }
    };
    const deleteContract = async (id: string) => {
        if (!window.confirm('Eliminare il documento?')) return;
        try { await contractsAPI.delete(id); setContracts(c => c.filter(x => x.id !== id)); }
        catch (e: any) { alert(e.message); }
    };

    const getClientName = (id: string) => clients.find(c => c.id === id)?.name || 'N/A';
    const getProjectName = (id: string) => projects.find(p => p.id === id)?.name || 'N/A';

    const openNotice = (title: string, message = 'Azione disponibile. La sezione è stata collegata all’interfaccia.') => {
        setModal(<NoticePanel title={title} message={message} onClose={() => setModal(null)} />);
    };

    useEffect(() => {
        const onNotice = (e: Event) => {
            const detail = (e as CustomEvent<{ title?: string; message?: string }>).detail;
            openNotice(detail?.title || 'Azione', detail?.message);
        };
        window.addEventListener('app:notice', onNotice);
        return () => window.removeEventListener('app:notice', onNotice);
    }, []);

    const title = useMemo(() => ({
        dashboard:    'Dashboard',
        clienti:      'Gestione Clienti',
        progetti:     'Gestione Progetti',
        contabilita:  'Contabilità',
        calendario:   'Calendario',
        inbox:        'Inbox',
        reports:      'Report',
        notifiche:    'Notifiche',
        help:         'Aiuto',
        settings:     'Impostazioni',
    } as Record<string, string>)[activeView] || 'Gestionale', [activeView]);

    if (loading) {
        return (
            <ThemedShell>
                <div className="h-screen flex items-center justify-center text-ink-muted">
                    Caricamento…
                </div>
            </ThemedShell>
        );
    }

    if (!isAuthenticated) {
        return <Login onLoginSuccess={handleLoginSuccess} />;
    }

    return (
        <AppShell
            user={user}
            onLogout={handleLogout}
            activeView={activeView}
            setActiveView={setActiveView}
            projects={projects}
            activeProjectId={activeProjectId}
            setActiveProjectId={setActiveProjectId}
            onAddProject={() => setModal(<AddProjectForm clients={clients} onSubmit={addProject} />)}
            onQuickAction={openNotice}
            title={title}
        >
            {activeView === 'dashboard' && (
                <DashboardView activeProjectId={activeProjectId} currentUser={user} />
            )}
            {activeView === 'clienti' && (
                <ClientiView
                    clients={clients}
                    onUpdateStatus={updateClientStatus}
                    onDelete={deleteClient}
                    onOpenAdd={() => setModal(<AddClientForm onSubmit={addClient} />)}
                />
            )}
            {activeView === 'progetti' && (
                <ProgettiView
                    projects={projects}
                    onUpdateStatus={updateProjectStatus}
                    onAddTodo={addTodo}
                    onToggleTodo={toggleTodo}
                    onDeleteTodo={deleteTodo}
                    onDelete={deleteProject}
                    onOpenAdd={() => setModal(<AddProjectForm clients={clients} onSubmit={addProject} />)}
                    getClientName={getClientName}
                />
            )}
            {activeView === 'contabilita' && (
                <ContabilitaView
                    contracts={contracts}
                    onUpdateStatus={updateContractStatus}
                    onDelete={deleteContract}
                    onOpenAdd={() => setModal(<AddContractForm clients={clients} projects={projects} onSubmit={addContract} />)}
                    getClientName={getClientName}
                    getProjectName={getProjectName}
                />
            )}
            {activeView === 'calendario' && <Calendar currentUser={user} />}
            {activeView === 'inbox' && (
                <UtilityView
                    icon={Inbox}
                    title="Inbox"
                    subtitle="Messaggi, richieste e follow-up rapidi."
                    primaryLabel="Apri chat dashboard"
                    onPrimary={() => setActiveView('dashboard')}
                    cards={[
                        ['3 richieste', 'Da trasformare in task o note progetto.'],
                        ['Follow-up clienti', 'Promemoria collegati alla pipeline commerciale.'],
                        ['Messaggi team', 'Accesso rapido alla chat operativa.'],
                    ]}
                />
            )}
            {activeView === 'reports' && (
                <UtilityView
                    icon={BarChart3}
                    title="Reports"
                    subtitle="Riepilogo operativo con collegamenti alle sezioni principali."
                    primaryLabel="Vai alla contabilità"
                    onPrimary={() => setActiveView('contabilita')}
                    cards={[
                        [`${clients.length} clienti`, 'Consulta anagrafiche e stato commerciale.'],
                        [`${projects.length} progetti`, 'Apri backlog, todo e stato progetto.'],
                        [`${contracts.length} documenti`, 'Controlla incassato e documenti aperti.'],
                    ]}
                />
            )}
            {activeView === 'notifiche' && (
                <UtilityView
                    icon={Bell}
                    title="Notifiche"
                    subtitle="Centro aggiornamenti per attività recenti e reminder."
                    primaryLabel="Torna alla dashboard"
                    onPrimary={() => setActiveView('dashboard')}
                    cards={[
                        ['Task aggiornati', 'I cambi di colonna compariranno qui.'],
                        ['Documenti', 'Fatture e contratti avranno reminder dedicati.'],
                        ['Calendario', 'Eventi e RSVP saranno raccolti in questa vista.'],
                    ]}
                />
            )}
            {activeView === 'help' && (
                <UtilityView
                    icon={HelpCircle}
                    title="Help"
                    subtitle="Guida rapida alle aree principali del gestionale."
                    primaryLabel="Crea un progetto"
                    onPrimary={() => setModal(<AddProjectForm clients={clients} onSubmit={addProject} />)}
                    cards={[
                        ['Dashboard', 'Kanban, chat, calendario e attività in un solo posto.'],
                        ['Clienti', 'Crea o aggiorna anagrafiche commerciali.'],
                        ['Progetti', 'Collega ogni progetto al cliente corretto.'],
                    ]}
                />
            )}
            {activeView === 'settings' && (
                <UtilityView
                    icon={Settings}
                    title="Impostazioni"
                    subtitle="Preferenze e scorciatoie operative."
                    primaryLabel="Cambia tema"
                    onPrimary={() => openNotice('Tema', 'Usa il pulsante sole/luna nella barra laterale per cambiare tema.')}
                    cards={[
                        ['Account', user?.name || 'Utente corrente'],
                        ['Workspace', 'GESTIONALE JEINS'],
                        ['Preferenze', 'Tema, notifiche e scorciatoie.'],
                    ]}
                />
            )}
            {!['dashboard', 'clienti', 'progetti', 'contabilita', 'calendario'].includes(activeView) && (
                null
            )}

            <Modal isOpen={!!modal} onClose={() => setModal(null)}>
                {modal}
            </Modal>
        </AppShell>
    );
}

function ThemedShell({ children }: { children: ReactNode }) {
    return <div className="bg-surface text-ink">{children}</div>;
}

function NoticePanel({ title, message, onClose }: { title: string; message: string; onClose: () => void }) {
    return (
        <div className="space-y-5">
            <div className="flex items-start gap-3">
                <div className="mt-0.5 w-10 h-10 rounded-2xl bg-grad-violet shadow-glow-violet flex items-center justify-center text-white">
                    <Bell className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-brand-300 font-semibold">
                        Notifica
                    </p>
                    <h3 className="text-lg font-semibold text-ink mt-1">{title}</h3>
                    <p className="text-sm text-ink-muted mt-1 leading-relaxed">{message}</p>
                </div>
            </div>
            <div className="flex justify-end">
                <button className="btn-primary px-4 py-2" onClick={onClose}>Ho capito</button>
            </div>
        </div>
    );
}

function UtilityView({
    icon: Icon, title, subtitle, primaryLabel, onPrimary, cards,
}: {
    icon: any;
    title: string;
    subtitle: string;
    primaryLabel: string;
    onPrimary: () => void;
    cards: [string, string][];
}) {
    return (
        <div className="card p-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-grad-violet shadow-glow-violet flex items-center justify-center text-white">
                        <Icon className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-ink">{title}</h2>
                        <p className="text-sm text-ink-muted">{subtitle}</p>
                    </div>
                </div>
                <button className="btn-primary" onClick={onPrimary}>
                    {primaryLabel}
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
                {cards.map(([heading, body]) => (
                    <button
                        key={heading}
                        type="button"
                        onClick={() => window.dispatchEvent(new CustomEvent('app:notice', {
                            detail: { title: heading, message: body },
                        }))}
                        className="text-left card-inset p-4 hover:border-line-strong hover:bg-surface-inset/80 transition-colors active:scale-[0.99]"
                    >
                        <h3 className="text-sm font-semibold text-ink">{heading}</h3>
                        <p className="text-xs text-ink-subtle mt-1 leading-relaxed">{body}</p>
                    </button>
                ))}
            </div>
        </div>
    );
}

function Modal({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: ReactNode }) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative card max-w-lg w-full max-h-[90vh] overflow-y-auto animate-fade-in">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 icon-btn z-10"
                    aria-label="Chiudi"
                >
                    <X className="w-4 h-4" />
                </button>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
}

// --- Form Modali ---

function AddClientForm({ onSubmit }: { onSubmit: (data: any) => void }) {
    const [data, setData] = useState({
        name: '', contactPerson: '', email: '', phone: '',
        status: 'Prospect', area: 'Marketing',
    });
    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.name || !data.email) { alert('Nome e email obbligatori.'); return; }
        onSubmit(data);
    };
    return (
        <form onSubmit={submit} className="space-y-4">
            <h3 className="text-lg font-semibold text-ink">Nuovo Cliente</h3>
            <FormField label="Azienda" required value={data.name} onChange={v => setData({ ...data, name: v })} />
            <FormField label="Referente"        value={data.contactPerson} onChange={v => setData({ ...data, contactPerson: v })} />
            <FormField label="Email" type="email" required value={data.email} onChange={v => setData({ ...data, email: v })} />
            <FormField label="Telefono"          value={data.phone} onChange={v => setData({ ...data, phone: v })} />
            <FormSelect label="Area" value={data.area} options={AREA_OPTIONS} onChange={v => setData({ ...data, area: v })} />
            <FormSelect label="Stato" value={data.status} options={CLIENT_STATUS_OPTIONS} onChange={v => setData({ ...data, status: v })} />
            <div className="flex justify-end pt-2">
                <button type="submit" className="btn-primary">Salva Cliente</button>
            </div>
        </form>
    );
}

function AddProjectForm({ clients, onSubmit }: { clients: Client[]; onSubmit: (data: any) => void }) {
    const [data, setData] = useState({
        name: '', area: 'IT', status: 'Pianificato',
    });
    const [clientName, setClientName] = useState('');
    const [clientId, setClientId] = useState<string>('');

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.name.trim() || !clientName.trim()) {
            alert('Nome progetto e cliente sono obbligatori.');
            return;
        }
        onSubmit({ ...data, clientName: clientName.trim(), clientId: clientId || undefined });
    };
    return (
        <form onSubmit={submit} className="space-y-4">
            <h3 className="text-lg font-semibold text-ink">Nuovo Progetto</h3>
            <FormField label="Nome" required value={data.name} onChange={v => setData({ ...data, name: v })} />
            <ClientCombobox
                clients={clients}
                value={clientName}
                onChange={(name, id) => { setClientName(name); setClientId(id || ''); }}
            />
            <FormSelect label="Area" value={data.area} options={AREA_OPTIONS} onChange={v => setData({ ...data, area: v })} />
            <FormSelect label="Stato" value={data.status} options={PROJECT_STATUS_OPTIONS} onChange={v => setData({ ...data, status: v })} />
            <div className="flex justify-end pt-2">
                <button type="submit" className="btn-primary">Salva Progetto</button>
            </div>
        </form>
    );
}

function ClientCombobox({
    clients, value, onChange,
}: {
    clients: Client[];
    value: string;
    onChange: (name: string, matchedId: string | null) => void;
}) {
    const [open, setOpen] = useState(false);
    const [highlight, setHighlight] = useState(0);
    const wrapRef = useRef<HTMLDivElement>(null);

    const norm = (s: string) => s.trim().toLowerCase();

    const filtered = useMemo(() => {
        const q = norm(value);
        if (!q) return clients;
        return clients.filter(c => norm(c.name).includes(q));
    }, [clients, value]);

    const exactMatch = useMemo(
        () => clients.find(c => norm(c.name) === norm(value)) || null,
        [clients, value]
    );

    useEffect(() => {
        const onDown = (e: MouseEvent) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', onDown);
        return () => document.removeEventListener('mousedown', onDown);
    }, []);

    useEffect(() => {
        setHighlight(0);
    }, [value]);

    const pickClient = (c: Client) => {
        onChange(c.name, c.id);
        setOpen(false);
    };

    const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setOpen(true);
            setHighlight(h => Math.min(h + 1, Math.max(filtered.length - 1, 0)));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlight(h => Math.max(h - 1, 0));
        } else if (e.key === 'Enter') {
            if (open && filtered[highlight]) {
                e.preventDefault();
                pickClient(filtered[highlight]);
            }
        } else if (e.key === 'Escape') {
            setOpen(false);
        }
    };

    const showCreateRow = !!value.trim() && !exactMatch;

    return (
        <div>
            <label className="block text-xs font-medium text-ink-muted mb-1">
                Cliente<span className="text-rose-400 ml-0.5">*</span>
            </label>
            <div className="relative" ref={wrapRef}>
                <input
                    type="text"
                    value={value}
                    onChange={(e) => { onChange(e.target.value, null); setOpen(true); }}
                    onFocus={() => setOpen(true)}
                    onKeyDown={handleKey}
                    placeholder="Scrivi il nome o scegli un cliente esistente…"
                    autoComplete="off"
                    className="input"
                />
                {open && (filtered.length > 0 || showCreateRow) && (
                    <ul className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-lg border border-line/60 bg-surface-inset shadow-lg">
                        {filtered.map((c, i) => (
                            <li
                                key={c.id}
                                onMouseDown={(e) => { e.preventDefault(); pickClient(c); }}
                                onMouseEnter={() => setHighlight(i)}
                                className={`px-3 py-1.5 text-sm cursor-pointer truncate ${
                                    i === highlight
                                        ? 'bg-violet-500/15 text-ink'
                                        : 'text-ink-muted'
                                }`}
                            >
                                {c.name}
                            </li>
                        ))}
                        {showCreateRow && (
                            <li
                                onMouseDown={(e) => e.preventDefault()}
                                className="px-3 py-1.5 text-xs text-violet-300 border-t border-line/40 flex items-center gap-1.5 italic"
                            >
                                <Plus className="w-3 h-3" />
                                <span>
                                    Verrà creato un nuovo cliente:{' '}
                                    <span className="font-medium not-italic text-ink">
                                        "{value.trim()}"
                                    </span>
                                </span>
                            </li>
                        )}
                    </ul>
                )}
            </div>
        </div>
    );
}

function AddContractForm({
    clients, projects, onSubmit,
}: { clients: Client[]; projects: Project[]; onSubmit: (data: any) => void }) {
    const [data, setData] = useState({
        type: 'Contratto', clientId: clients[0]?.id || '',
        projectId: '', amount: 0, status: 'Bozza',
        date: new Date().toISOString().split('T')[0],
    });
    const availableProjects = useMemo(
        () => projects.filter(p => p.clientId === data.clientId),
        [projects, data.clientId]
    );
    useEffect(() => {
        if (availableProjects.length && !availableProjects.find(p => p.id === data.projectId)) {
            setData(d => ({ ...d, projectId: availableProjects[0].id }));
        }
    }, [data.clientId, availableProjects, data.projectId]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.clientId || data.amount <= 0) { alert('Cliente e importo richiesti.'); return; }
        onSubmit(data);
    };
    return (
        <form onSubmit={submit} className="space-y-4">
            <h3 className="text-lg font-semibold text-ink">Nuovo Documento</h3>
            <FormSelect label="Tipo" value={data.type} options={CONTRACT_TYPE_OPTIONS} onChange={v => setData({ ...data, type: v })} />
            <FormSelect
                label="Cliente"
                value={data.clientId}
                options={clients.map(c => ({ value: c.id, label: c.name }))}
                onChange={v => setData({ ...data, clientId: v })}
            />
            <FormSelect
                label="Progetto"
                value={data.projectId}
                options={availableProjects.map(p => ({ value: p.id, label: p.name }))}
                onChange={v => setData({ ...data, projectId: v })}
            />
            <FormField label="Importo (€)" type="number" required
                       value={String(data.amount)}
                       onChange={v => setData({ ...data, amount: Number(v) })} />
            <FormField label="Data" type="date" required
                       value={data.date} onChange={v => setData({ ...data, date: v })} />
            <FormSelect label="Stato" value={data.status} options={CONTRACT_STATUS_OPTIONS} onChange={v => setData({ ...data, status: v })} />
            <div className="flex justify-end pt-2">
                <button type="submit" className="btn-primary">Salva Documento</button>
            </div>
        </form>
    );
}

function FormField({
    label, value, onChange, type = 'text', required = false,
}: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
    return (
        <div>
            <label className="block text-xs font-medium text-ink-muted mb-1">
                {label}{required && <span className="text-rose-400 ml-0.5">*</span>}
            </label>
            <input
                type={type} value={value} required={required}
                onChange={(e) => onChange(e.target.value)}
                className="input"
            />
        </div>
    );
}

function FormSelect({
    label, value, options, onChange,
}: {
    label: string; value: string; onChange: (v: string) => void;
    options: (string | { value: string; label: string })[];
}) {
    return (
        <div>
            <label className="block text-xs font-medium text-ink-muted mb-1">{label}</label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="input appearance-none"
            >
                {options.map(o => {
                    const v = typeof o === 'string' ? o : o.value;
                    const l = typeof o === 'string' ? o : o.label;
                    return <option key={v} value={v}>{l}</option>;
                })}
            </select>
        </div>
    );
}
