import type { ReactNode } from 'react';
import { IconRail } from './IconRail';
import { ProjectSidebar } from './ProjectSidebar';
import { TopBar } from './TopBar';
import type { Project, User } from '../types/models';

interface AppShellProps {
    user: User | null;
    onLogout: () => void;
    activeView: string;
    setActiveView: (v: string) => void;
    projects: Project[];
    activeProjectId: string | null;
    setActiveProjectId: (id: string) => void;
    onAddProject?: () => void;
    onQuickAction?: (title: string, message?: string) => void;
    title?: string;
    children: ReactNode;
}

export function AppShell({
    user, onLogout, activeView, setActiveView,
    projects, activeProjectId, setActiveProjectId, onAddProject,
    onQuickAction, title, children,
}: AppShellProps) {
    return (
        <div className="h-screen flex bg-surface text-ink overflow-hidden">
            <IconRail activeView={activeView} setActiveView={setActiveView} />
            <ProjectSidebar
                projects={projects}
                activeProjectId={activeProjectId}
                onSelectProject={setActiveProjectId}
                onAddProject={onAddProject}
                onNavigate={setActiveView}
                onQuickAction={onQuickAction}
            />
            <div className="flex-1 flex flex-col min-w-0">
                <TopBar
                    user={user}
                    onLogout={onLogout}
                    title={title}
                    onNavigate={setActiveView}
                    onQuickAction={onQuickAction}
                />
                <main className="flex-1 overflow-y-auto bg-surface-sunken/40 px-4 md:px-6 lg:px-8 py-5">
                    {children}
                </main>
            </div>
        </div>
    );
}
