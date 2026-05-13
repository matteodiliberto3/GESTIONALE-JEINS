import { useState } from 'react';
import {
    Plus, MoreHorizontal, ChevronDown, ChevronRight,
    FolderKanban, Layers, Users, Sparkles, Compass, FlaskConical,
    Share2,
} from 'lucide-react';
import type { Project } from '../types/models';

interface ProjectSidebarProps {
    projects: Project[];
    activeProjectId: string | null;
    onSelectProject: (id: string) => void;
    onAddProject?: () => void;
    onNavigate?: (view: string) => void;
    onQuickAction?: (title: string, message?: string) => void;
}

const QUICK_BOARDS = [
    { id: 'add', label: 'Add Project', icon: Plus, accent: 'bg-grad-violet text-white', action: 'add' },
    { id: 'a',   label: 'Area Slice',  icon: Layers, accent: 'bg-surface-inset text-ink-muted', view: 'reports' },
    { id: 'b',   label: 'Web App',     icon: Compass, accent: 'bg-surface-inset text-ink-muted', view: 'dashboard' },
    { id: 'c',   label: 'Dev.ui',      icon: Sparkles, accent: 'bg-surface-inset text-ink-muted', view: 'help' },
    { id: 'd',   label: 'Sandbox',     icon: FlaskConical, accent: 'bg-surface-inset text-ink-muted', view: 'settings' },
];

export function ProjectSidebar({
    projects, activeProjectId, onSelectProject, onAddProject, onNavigate, onQuickAction,
}: ProjectSidebarProps) {
    const [overviewOpen, setOverviewOpen] = useState(true);
    const [sprintsOpen, setSprintsOpen] = useState(false);

    return (
        <aside className="hidden lg:flex w-72 flex-shrink-0 flex-col
                          bg-surface-raised border-r border-line/60 overflow-hidden">
            <div className="px-5 pt-5 pb-3 flex items-center justify-between">
                <h2 className="text-base font-semibold text-ink">Projects</h2>
                <button className="icon-btn" aria-label="More">
                    <MoreHorizontal className="w-4 h-4" />
                </button>
            </div>

            <div className="px-5 pb-4 flex items-center gap-2 overflow-x-auto scrollbar-thin">
                {QUICK_BOARDS.map(b => {
                    const Icon = b.icon;
                    const isAdd = b.id === 'add';
                    return (
                        <button
                            key={b.id}
                            onClick={() => isAdd ? onAddProject?.() : onNavigate?.((b as any).view)}
                            className="flex flex-col items-center gap-1 flex-shrink-0 transition-transform active:scale-95"
                            title={b.label}
                        >
                            <span className={`w-10 h-10 rounded-xl ${b.accent} flex items-center justify-center
                                              ${isAdd ? 'shadow-glow-violet' : 'border border-line/50'}`}>
                                <Icon className="w-4 h-4" />
                            </span>
                            <span className="text-[10px] text-ink-subtle leading-tight">{b.label}</span>
                        </button>
                    );
                })}
            </div>

            <div className="px-5 pb-2">
                <p className="text-[11px] uppercase tracking-wider text-ink-subtle font-medium">Overview</p>
            </div>

            <div className="flex-1 overflow-y-auto px-3 pb-4 scrollbar-thin">
                <div className="rounded-xl bg-surface-inset/60 border border-line/50">
                    <button
                        onClick={() => setOverviewOpen(o => !o)}
                        className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium text-ink"
                    >
                        <span className="flex items-center gap-2">
                            <FolderKanban className="w-4 h-4 text-brand-400" />
                            Project Board
                        </span>
                        {overviewOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>

                    {overviewOpen && (
                        <div className="px-2 pb-2 space-y-0.5">
                            {projects.length === 0 && (
                                <div className="text-xs text-ink-subtle italic px-3 py-2">
                                    Nessun progetto ancora. Creane uno per iniziare.
                                </div>
                            )}
                            {projects.map(p => (
                                <ProjectNode
                                    key={p.id}
                                    project={p}
                                    isActive={activeProjectId === p.id}
                                    onSelect={() => onSelectProject(p.id)}
                                    onQuickAction={onQuickAction}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <button
                    type="button"
                    onClick={() => onNavigate?.('progetti')}
                    className="w-full mt-3 px-3 py-2.5 rounded-xl flex items-center justify-between text-sm hover:bg-surface-inset transition-colors"
                >
                    <span className="flex items-center gap-2 text-ink">
                        <Layers className="w-4 h-4 text-ink-subtle" />
                        Backlog
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-grad-violet text-white font-semibold">New</span>
                </button>

                <button
                    onClick={() => setSprintsOpen(o => !o)}
                    className="w-full mt-1 px-3 py-2.5 rounded-xl flex items-center justify-between text-sm hover:bg-surface-inset"
                >
                    <span className="flex items-center gap-2 text-ink">
                        <Sparkles className="w-4 h-4 text-ink-subtle" />
                        Sprints
                    </span>
                    {sprintsOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
            </div>

            <div className="m-3 p-4 rounded-2xl bg-surface-inset/80 border border-line/60 relative overflow-hidden">
                <div className="absolute inset-0 opacity-50 bg-grad-violet" style={{ filter: 'blur(40px) saturate(140%)', transform: 'translate(40%,-30%)' }} />
                <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-surface-raised border border-line/60 flex items-center justify-center mb-3">
                        <Share2 className="w-5 h-5 text-brand-400" />
                    </div>
                    <p className="text-xs text-ink-muted leading-relaxed">
                        Condividi la documentazione su <span className="text-ink font-medium">GitHub</span> per accessi più rapidi.
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                        <button
                            className="btn-primary text-xs px-3 py-1.5"
                            onClick={() => onQuickAction?.('Share Now', 'Link di condivisione preparato. Puoi collegarlo a GitHub o alla documentazione del progetto.')}
                        >
                            <Share2 className="w-3.5 h-3.5" /> Share Now
                        </button>
                        <button
                            className="text-xs text-ink-muted hover:text-ink transition-colors active:scale-95"
                            onClick={() => onNavigate?.('help')}
                        >
                            Learn more
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
}

function ProjectNode({
    project, isActive, onSelect, onQuickAction,
}: {
    project: Project;
    isActive: boolean;
    onSelect: () => void;
    onQuickAction?: (title: string, message?: string) => void;
}) {
    const [open, setOpen] = useState(isActive);
    const sub = ['Admin', 'Client', 'Publishers'];

    return (
        <div>
            <button
                onClick={() => { setOpen(o => !o); onSelect(); }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition
                            ${isActive ? 'bg-surface-raised text-ink shadow-soft' : 'text-ink-muted hover:bg-surface-raised/60 hover:text-ink'}`}
            >
                <span className="flex items-center gap-2 truncate">
                    {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    <span className="truncate">{project.name}</span>
                </span>
                {project.todos && project.todos.length > 0 && (
                    <span className="text-[10px] text-ink-subtle font-medium">{project.todos.length}</span>
                )}
            </button>
            {open && (
                <div className="ml-5 pl-2 border-l border-line/60 mt-0.5 space-y-0.5">
                    {sub.map(s => (
                        <button
                            key={s}
                            onClick={() => onQuickAction?.(`${project.name} / ${s}`, 'Sezione selezionata. Qui verranno mostrati documenti, persone e permessi del progetto.')}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-ink-muted hover:text-ink hover:bg-surface-raised/60"
                        >
                            <Users className="w-3 h-3" />
                            <span>{s}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
