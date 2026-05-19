import {
    LayoutGrid, FolderKanban, Users, Wallet, CalendarDays,
    Inbox, BarChart3, Bell, Settings, HelpCircle,
    Sun, Moon,
} from 'lucide-react';
import { LayoutGroup, motion } from 'framer-motion';
import { useTheme } from '../theme/ThemeProvider';
import { SPRING } from '../motion/presets';
import { useReducedMotion } from '../motion/useReducedMotion';

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
                    className="absolute inset-0 rounded-xl bg-brand-500/15 border border-brand-500/25"
                    transition={SPRING.snap}
                />
            )}
            <Icon className="w-5 h-5 relative z-10" />
        </button>
    );
}

export function IconRail({ activeView, setActiveView }: IconRailProps) {
    const { theme, toggle } = useTheme();
    const reduced = useReducedMotion();

    return (
        <aside className="hidden md:flex w-[4.25rem] flex-shrink-0 flex-col items-center
                          bg-[#08080a] border-r border-line/30 py-4 gap-2">
            <div className="w-10 h-10 rounded-xl bg-grad-violet shadow-glow-violet
                            flex items-center justify-center mb-2">
                <span className="text-white font-bold text-lg">G</span>
            </div>

            <LayoutGroup id="rail-nav">
                <nav className="flex flex-col gap-1 mt-2">
                    {TOP_ITEMS.map(item => (
                        <RailButton
                            key={item.id}
                            active={activeView === item.id}
                            onClick={() => setActiveView(item.id)}
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
                            onClick={() => setActiveView(item.id)}
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
