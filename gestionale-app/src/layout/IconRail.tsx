import {
    LayoutGrid, FolderOpen, FileText, PieChart,
    MessageSquare, Cloud, CalendarDays, Settings,
    Sun, Moon, ListTodo,
} from 'lucide-react';
import { LayoutGroup, motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../theme/ThemeProvider';
import { useAuth } from '../app/AuthProvider';
import { resolvePermissions, type UserPermissions } from '../lib/permissions';
import { SPRING } from '../motion/presets';
import { useReducedMotion } from '../motion/useReducedMotion';

interface IconRailProps {
    activeView: string;
    setActiveView: (view: string) => void;
}

const VIEW_PATHS: Record<string, string> = {
    clienti: '/clienti',
    dashboard: '/dashboard',
    progetti: '/progetti',
    reports: '/reports',
    calendario: '/calendario',
    inbox: '/inbox',
    contabilita: '/contabilita',
    tasks: '/tasks',
    settings: '/settings',
};

const TOP_ITEMS: { id: string; icon: typeof LayoutGrid; label: string; perm: keyof UserPermissions }[] = [
    { id: 'clienti',     icon: LayoutGrid,    label: 'Clienti',       perm: 'viewClients' },
    { id: 'dashboard',   icon: FolderOpen,    label: 'Dashboard',     perm: 'viewDashboard' },
    { id: 'progetti',    icon: FileText,      label: 'Progetti',      perm: 'viewProjects' },
    { id: 'tasks',       icon: ListTodo,      label: 'I miei lavori', perm: 'viewMyTasks' },
    { id: 'reports',     icon: PieChart,      label: 'Report',        perm: 'viewReports' },
    { id: 'calendario',  icon: CalendarDays,  label: 'Scadenze',      perm: 'viewCalendar' },
    { id: 'inbox',       icon: MessageSquare, label: 'Inbox',         perm: 'viewInbox' },
    { id: 'contabilita', icon: Cloud,         label: 'Fatturato',     perm: 'viewBilling' },
];

const BOTTOM_ITEMS = [
    { id: 'settings', icon: Settings, label: 'Impostazioni' },
];

function RailButton({
    active, onClick, label, Icon, reduced,
}: {
    active: boolean;
    onClick: () => void;
    label: string;
    Icon: typeof LayoutGrid;
    reduced: boolean;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="nav-rail-btn relative"
            data-active={active}
            title={label}
            aria-label={label}
            aria-current={active ? 'page' : undefined}
        >
            {active && !reduced && (
                <motion.span
                    layoutId="rail-active"
                    className="absolute inset-0 rounded-xl bg-grad-brand shadow-glow-brand"
                    transition={SPRING.snap}
                />
            )}
            {active && reduced && (
                <span className="absolute inset-0 rounded-xl bg-grad-brand shadow-glow-brand" />
            )}
            <Icon className={`w-[18px] h-[18px] relative z-10 ${active ? 'text-white' : ''}`} />
        </button>
    );
}

export function IconRail({ activeView, setActiveView }: IconRailProps) {
    const { user } = useAuth();
    const permissions = resolvePermissions(user);
    const navItems = TOP_ITEMS.filter(item => permissions[item.perm]);
    const { theme, toggle } = useTheme();
    const reduced = useReducedMotion();
    const navigate = useNavigate();
    const location = useLocation();

    const go = (viewId: string) => {
        setActiveView(viewId);
        const path = VIEW_PATHS[viewId] || `/${viewId}`;
        if (location.pathname !== path) navigate(path);
    };

    return (
        <aside className="hidden md:flex w-[3.5rem] flex-shrink-0 flex-col items-center
                          bg-surface-sunken border-r border-line/40 py-3 gap-1.5">
            <div className="w-8 h-8 rounded-lg bg-grad-brand flex items-center justify-center mb-2 shadow-glow-brand">
                <span className="text-white text-xs font-bold">J</span>
            </div>

            <LayoutGroup id="rail-nav">
                <nav className="flex flex-col gap-1 mt-2">
                    {navItems.map(item => (
                        <RailButton
                            key={item.id}
                            active={activeView === item.id}
                            onClick={() => go(item.id)}
                            label={item.label}
                            Icon={item.icon}
                            reduced={reduced}
                        />
                    ))}
                </nav>
            </LayoutGroup>

            <div className="flex-1" />

            <LayoutGroup id="rail-bottom">
                <nav className="flex flex-col gap-1">
                    {BOTTOM_ITEMS.map(item => (
                        <RailButton
                            key={item.id}
                            active={activeView === item.id}
                            onClick={() => go(item.id)}
                            label={item.label}
                            Icon={item.icon}
                            reduced={reduced}
                        />
                    ))}
                </nav>
            </LayoutGroup>

            <button
                type="button"
                onClick={toggle}
                className="nav-rail-btn mt-2"
                title={theme === 'dark' ? 'Tema chiaro' : 'Tema scuro'}
                aria-label="Cambia tema"
            >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
        </aside>
    );
}
