import { useState } from 'react';
import {
    ChevronDown, ChevronRight, Trash2, Plus, CheckCircle2, Circle, Flag, Pencil,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import type { Project, Todo } from '../types/models';

const PROJECT_STATUS_OPTIONS = ['Pianificato', 'In Corso', 'In Revisione', 'Completato', 'Sospeso'];
const TODO_PRIORITY_OPTIONS: Todo['priority'][] = ['Bassa', 'Media', 'Alta'];

const statusTone: Record<string, 'violet' | 'cyan' | 'pink' | 'emerald' | 'amber' | 'rose' | 'neutral'> = {
    'Pianificato': 'cyan',
    'In Corso': 'violet',
    'In Revisione': 'amber',
    'Completato': 'emerald',
    'Sospeso': 'neutral',
};

const priorityTone = {
    Bassa: 'text-emerald-400',
    Media: 'text-amber-400',
    Alta:  'text-rose-400',
};

interface ProgettiViewProps {
    projects: Project[];
    onUpdateStatus: (id: string, status: string) => void;
    onEdit: (project: Project) => void;
    onAddTodo: (projectId: string, text: string, priority: string) => void;
    onToggleTodo: (projectId: string, todoId: string) => void;
    onDeleteTodo: (projectId: string, todoId: string) => void;
    onDelete: (id: string) => void;
    onOpenAdd: () => void;
    getClientName: (id: string) => string;
}

export function ProgettiView({
    projects, onUpdateStatus, onEdit, onAddTodo, onToggleTodo, onDeleteTodo,
    onDelete, onOpenAdd, getClientName,
}: ProgettiViewProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-ink">Progetti ({projects.length})</h2>
                    <p className="text-xs text-ink-subtle">Gestione dei progetti e delle todo list associate.</p>
                </div>
                <button onClick={onOpenAdd} className="btn-primary text-xs px-3 py-1.5">
                    <Plus className="w-3.5 h-3.5" /> Nuovo Progetto
                </button>
            </div>

            {projects.length === 0 ? (
                <Card padding="lg">
                    <div className="text-center text-ink-subtle text-sm italic py-6">
                        Nessun progetto ancora. Creane uno con il bottone <span className="font-medium text-ink">Nuovo Progetto</span>.
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {projects.map(p => (
                        <ProjectCard
                            key={p.id}
                            project={p}
                            clientName={getClientName(p.clientId || '')}
                            onUpdateStatus={onUpdateStatus}
                            onEdit={onEdit}
                            onAddTodo={onAddTodo}
                            onToggleTodo={onToggleTodo}
                            onDeleteTodo={onDeleteTodo}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function ProjectCard({
    project, clientName, onUpdateStatus, onEdit, onAddTodo, onToggleTodo, onDeleteTodo, onDelete,
}: {
    project: Project;
    clientName: string;
    onUpdateStatus: (id: string, status: string) => void;
    onEdit: (project: Project) => void;
    onAddTodo: (projectId: string, text: string, priority: string) => void;
    onToggleTodo: (projectId: string, todoId: string) => void;
    onDeleteTodo: (projectId: string, todoId: string) => void;
    onDelete: (id: string) => void;
}) {
    const [open, setOpen] = useState(true);
    const [text, setText] = useState('');
    const [priority, setPriority] = useState<Todo['priority']>('Media');
    const todos = project.todos || [];
    const done = todos.filter(t => t.completed).length;

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;
        onAddTodo(project.id, text.trim(), priority);
        setText('');
        setPriority('Media');
    };

    return (
        <div className="card overflow-hidden">
            <div className="px-4 py-3 border-b border-line/60 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                    <button onClick={() => setOpen(o => !o)} className="icon-btn !w-7 !h-7">
                        {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                    <h3 className="text-sm font-semibold text-ink truncate">{project.name}</h3>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    {clientName && clientName !== 'N/A' && <Badge tone="cyan">{clientName}</Badge>}
                    {project.area && <Badge>{project.area}</Badge>}
                    <select
                        value={project.status}
                        onChange={(e) => onUpdateStatus(project.id, e.target.value)}
                        className={`text-[11px] font-medium rounded-full px-2.5 py-1
                                    bg-surface-inset border border-line/60
                                    text-${statusTone[project.status]}-300`}
                    >
                        {PROJECT_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button
                        onClick={() => onEdit(project)}
                        className="icon-btn !w-7 !h-7 text-ink-muted hover:text-brand-300"
                        aria-label="Modifica progetto"
                    >
                        <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={() => onDelete(project.id)}
                        className="icon-btn !w-7 !h-7 text-rose-400 hover:bg-rose-500/10"
                        aria-label="Elimina progetto"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {open && (
                <div className="p-4">
                    {todos.length > 0 && (
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] uppercase tracking-wider text-ink-subtle font-medium">
                                To-do
                            </span>
                            <span className="text-[11px] text-ink-muted">{done}/{todos.length}</span>
                        </div>
                    )}

                    <div className="space-y-1 mb-3">
                        {todos.length === 0 && (
                            <div className="text-xs text-ink-subtle italic px-2 py-2">Nessun task ancora.</div>
                        )}
                        {todos.map(t => (
                            <div key={t.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-surface-inset/40 group">
                                <button onClick={() => onToggleTodo(project.id, t.id)} className="flex-shrink-0" aria-label="Toggle">
                                    {t.completed
                                        ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                        : <Circle className="w-4 h-4 text-ink-subtle" />
                                    }
                                </button>
                                <span className={`text-sm flex-1 ${t.completed ? 'line-through text-ink-subtle' : 'text-ink'}`}>
                                    {t.text}
                                </span>
                                <Flag className={`w-3.5 h-3.5 ${priorityTone[t.priority]}`} />
                                <button
                                    onClick={() => onDeleteTodo(project.id, t.id)}
                                    className="icon-btn !w-7 !h-7 opacity-0 group-hover:opacity-100 text-rose-400 hover:bg-rose-500/10"
                                    aria-label="Elimina task"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={submit} className="flex items-center gap-2">
                        <input
                            type="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Nuovo task…"
                            className="input flex-1 !py-2 text-xs"
                        />
                        <select
                            value={priority}
                            onChange={(e) => setPriority(e.target.value as Todo['priority'])}
                            className="input !py-2 !w-auto text-xs"
                        >
                            {TODO_PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                        <button type="submit" className="btn-primary text-xs px-3 py-2">
                            <Plus className="w-3.5 h-3.5" />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
