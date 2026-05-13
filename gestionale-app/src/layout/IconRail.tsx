import {
    LayoutGrid, FolderKanban, Users, Wallet, CalendarDays,
    Inbox, BarChart3, Bell, Settings, HelpCircle,
    Sun, Moon,
} from 'lucide-react';
import { useTheme } from '../theme/ThemeProvider';

interface IconRailProps {
    activeView: string;
    setActiveView: (view: string) => void;
}

const TOP_ITEMS = [
    { id: 'dashboard',   icon: LayoutGrid,    label: 'Dashboard' },
    { id: 'clienti',     icon: Users,         label: 'Clienti' },
    { id: 'progetti',    icon: FolderKanban,  label: 'Progetti' },
    { id: 'contabilita', icon: Wallet,        label: 'Contabilità' },
    { id: 'calendario',  icon: CalendarDays,  label: 'Calendario' },
    { id: 'inbox',       icon: Inbox,         label: 'Inbox' },
    { id: 'reports',     icon: BarChart3,     label: 'Reports' },
    { id: 'notifiche',   icon: Bell,          label: 'Notifiche' },
];

const BOTTOM_ITEMS = [
    { id: 'help',     icon: HelpCircle, label: 'Help' },
    { id: 'settings', icon: Settings,   label: 'Impostazioni' },
];

export function IconRail({ activeView, setActiveView }: IconRailProps) {
    const { theme, toggle } = useTheme();

    return (
        <aside className="hidden md:flex w-16 flex-shrink-0 flex-col items-center
                          bg-surface-sunken border-r border-line/60 py-4 gap-2">
            <div className="w-10 h-10 rounded-xl bg-grad-violet shadow-glow-violet
                            flex items-center justify-center mb-2">
                <span className="text-white font-bold text-lg">G</span>
            </div>

            <nav className="flex flex-col gap-1 mt-2">
                {TOP_ITEMS.map(item => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveView(item.id)}
                            className="nav-rail-btn"
                            data-active={activeView === item.id}
                            title={item.label}
                            aria-label={item.label}
                        >
                            <Icon className="w-5 h-5" />
                        </button>
                    );
                })}
            </nav>

            <div className="flex-1" />

            <nav className="flex flex-col gap-1">
                {BOTTOM_ITEMS.map(item => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveView(item.id)}
                            className="nav-rail-btn"
                            data-active={activeView === item.id}
                            title={item.label}
                            aria-label={item.label}
                        >
                            <Icon className="w-5 h-5" />
                        </button>
                    );
                })}
            </nav>

            <button
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
