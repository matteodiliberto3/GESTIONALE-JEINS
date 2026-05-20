import { useState } from 'react';
import {
    Plus, ChevronDown, ChevronRight,
    FolderKanban, Layers, Sparkles, Share2, FileText,
    Search as SearchIcon, GitBranch,
} from 'lucide-react';
import { SidebarCalendar } from './SidebarCalendar';
import type { Project } from '../types/models';

interface ProjectSidebarProps {
    projects: Project[];
    activeProjectId: string | null;
    onSelectProject: (id: string) => void;
    onAddProject?: () => void;
    onNavigate?: (view: string) => void;
    onQuickAction?: (title: string, message?: string) => void;
}

export function ProjectSidebar({
    projects, activeProjectId, onSelectProject, onAddProject, onNavigate, onQuickAction,
}: ProjectSidebarProps) {
    const [boardOpen, setBoardOpen] = useState(true);
    const [dashOpen, setDashOpen] = useState(true);
    const [sprintsOpen, setSprintsOpen] = useState(false);

    return (
        <aside className="hidden lg:flex w-[17.5rem] flex-shrink-0 flex-col
                          bg-surface-raised border-r border-line/40 overflow-hidden">
            <div className="px-4 pt-4 pb-2 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-ink tracking-tight">Progetti</h2>
                <button
                    type="button"
                    className="icon-btn !w-7 !h-7"
                    aria-label="Nuovo progetto"
                    onClick={() => onAddProject?.()}
                >
                    <Plus className="w-3.5 h-3.5" />
                </button>
            </div>

            <div className="px-4 pb-3">
                <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-ink-subtle" />
                    <input
                        type="search"
                        placeholder="Cerca progetto…"
                        className="search-pill !py-2 !pl-8 !text-xs"
                    />
                </div>
            </div>

            <div className="px-4 pb-2">
                <p className="text-[10px] uppercase tracking-[0.14em] text-ink-subtle font-semibold">
                    Panoramica
                </p>
            </div>

            <div className="flex-1 overflow-y-auto px-3 pb-3 scrollbar-thin">
                <div className="rounded-xl bg-surface-inset/50 border border-line/40">
                    <button
                        type="button"
                        onClick={() => setBoardOpen(o => !o)}
                        className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-semibold text-ink"
                    >
                        <span className="flex items-center gap-2">
                            <FolderKanban className="w-3.5 h-3.5 text-brand-400" />
                            Board
                        </span>
                        {boardOpen
                            ? <ChevronDown className="w-3.5 h-3.5 text-ink-subtle" />
                            : <ChevronRight className="w-3.5 h-3.5 text-ink-subtle" />}
                    </button>

                    {boardOpen && (
                        <div className="px-2 pb-2 space-y-0.5">
                            {projects.length === 0 && (
                                <p className="px-2.5 py-3 text-xs text-ink-subtle italic">
                                    Nessun progetto. Creane uno dalla sezione Progetti.
                                </p>
                            )}
                            {projects.map((proj, idx) => (
                                <div key={proj.id}>
                                    {idx === 0 ? (
                                        <div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setDashOpen(o => !o);
                                                    onSelectProject(proj.id);
                                                }}
                                                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition
                                                    ${activeProjectId === proj.id
                                                        ? 'bg-surface-raised text-ink shadow-soft'
                                                        : 'text-ink-muted hover:bg-surface-raised/60 hover:text-ink'}`}
                                            >
                                                <span className="flex items-center gap-2 truncate">
                                                    <FileText className="w-3.5 h-3.5 text-brand-400" />
                                                    <span className="truncate font-medium">{proj.name}</span>
                                                </span>
                                                {dashOpen
                                                    ? <ChevronDown className="w-3 h-3 text-ink-subtle" />
                                                    : <ChevronRight className="w-3 h-3 text-ink-subtle" />}
                                            </button>
                                            {dashOpen && activeProjectId === proj.id && (
                                                <div className="ml-4 mt-0.5 pl-2 border-l border-line/40 space-y-0.5">
                                                    <SubLeaf
                                                        label="Dashboard"
                                                        onClick={() => onNavigate?.('dashboard')}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <TreeLeaf
                                            icon={FileText}
                                            label={proj.name}
                                            onClick={() => onSelectProject(proj.id)}
                                            active={activeProjectId === proj.id}
                                        />
                                    )}
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={() => onAddProject?.()}
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs
                                           text-brand-400 hover:text-brand-300 hover:bg-brand-950/30 transition-colors"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span className="font-medium">Nuovo board</span>
                            </button>
                        </div>
                    )}
                </div>

                <button
                    type="button"
                    onClick={() => onNavigate?.('progetti')}
                    className="w-full mt-2 px-3 py-2.5 rounded-xl flex items-center justify-between
                               text-sm hover:bg-surface-inset/60 transition-colors"
                >
                    <span className="flex items-center gap-2 text-ink">
                        <Layers className="w-3.5 h-3.5 text-ink-subtle" />
                        <span className="font-medium">Backlog</span>
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() => setSprintsOpen(o => !o)}
                    className="w-full mt-0.5 mb-2 px-3 py-2.5 rounded-xl flex items-center justify-between
                               text-sm hover:bg-surface-inset/60 transition-colors"
                >
                    <span className="flex items-center gap-2 text-ink">
                        <Sparkles className="w-3.5 h-3.5 text-ink-subtle" />
                        <span className="font-medium">Sprint</span>
                    </span>
                    {sprintsOpen
                        ? <ChevronDown className="w-3.5 h-3.5 text-ink-subtle" />
                        : <ChevronRight className="w-3.5 h-3.5 text-ink-subtle" />}
                </button>
            </div>

            <SidebarCalendar
                onOpenCalendar={() => onNavigate?.('calendario')}
                onQuickAction={onQuickAction}
            />

            <div className="m-3 p-3.5 rounded-xl bg-surface-inset border border-line/50">
                <div className="w-9 h-9 rounded-xl bg-grad-brand flex items-center justify-center mb-2.5">
                    <GitBranch className="w-4 h-4 text-white" />
                </div>
                <p className="text-xs text-ink-muted leading-relaxed">
                    Condividi documentazione e aggiornamenti con il team.
                </p>
                <div className="mt-3 flex items-center gap-2">
                    <button
                        type="button"
                        className="btn-primary !text-xs !px-2.5 !py-1.5"
                        onClick={() => onQuickAction?.('Condivisione', 'Link di condivisione in preparazione.')}
                    >
                        <Share2 className="w-3 h-3" /> Condividi
                    </button>
                    <button
                        type="button"
                        className="text-xs text-ink-muted hover:text-ink transition-colors"
                        onClick={() => onNavigate?.('help')}
                    >
                        Scopri di più
                    </button>
                </div>
            </div>
        </aside>
    );
}

function TreeLeaf({
    icon: Icon, label, badge, active, onClick,
}: {
    icon: typeof FileText;
    label: string;
    badge?: string;
    active?: boolean;
    onClick?: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition
                        ${active
                            ? 'bg-surface-raised text-ink'
                            : 'text-ink-muted hover:bg-surface-raised/60 hover:text-ink'}`}
        >
            <span className="flex items-center gap-2 truncate">
                <Icon className="w-3.5 h-3.5 text-ink-subtle" />
                <span className="truncate">{label}</span>
            </span>
            {badge && (
                <span className="text-[10px] font-bold text-brand-400 tabular-nums">{badge}</span>
            )}
        </button>
    );
}

function SubLeaf({ label, onClick }: { label: string; onClick?: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="w-full flex items-center justify-between px-2 py-1 rounded-md text-[11px]
                       text-ink-muted hover:text-ink hover:bg-surface-raised/40 transition-colors"
        >
            <span className="truncate">{label}</span>
        </button>
    );
}
