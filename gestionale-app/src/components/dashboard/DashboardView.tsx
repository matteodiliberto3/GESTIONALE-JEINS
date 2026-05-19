import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { KanbanBoard } from './KanbanBoard';
import { BentoCell } from '../motion/BentoCell';
import { MotionDialog } from '../motion/MotionDialog';
import { bentoStagger } from '../../motion/variants';
import { useReducedMotion } from '../../motion/useReducedMotion';
import { TimeSheet } from './TimeSheet';
import { SprintVelocity } from './SprintVelocity';
import { ActivityFeed } from './ActivityFeed';
import { CalendarMini } from './CalendarMini';
import { PromoCard } from './PromoCard';
import { Plus, X } from 'lucide-react';
import {
    tasksAPI, sprintsAPI, activitiesAPI, timeAPI,
    eventsAPI, usersAPI,
} from '../../services/api';
import type {
    Task, BoardColumn, Sprint, Activity, TimeEntrySummary,
    User,
} from '../../types/models';

interface DashboardViewProps {
    activeProjectId: string | null;
    currentUser: User | null;
}

export function DashboardView({ activeProjectId, currentUser }: DashboardViewProps) {
    const [columns, setColumns] = useState<BoardColumn[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [activeSprint, setActiveSprint] = useState<Sprint | null>(null);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [timeSummary, setTimeSummary] = useState<TimeEntrySummary[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [members, setMembers] = useState<User[]>([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [taskComposerColumnId, setTaskComposerColumnId] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                const safe = async <T,>(p: Promise<T>, fb: T): Promise<T> => {
                    try { return await p; } catch { return fb; }
                };

                const [colsRaw, tasksRaw, sprint, acts, sum, evs, users] = await Promise.all([
                    activeProjectId ? safe(tasksAPI.getColumns(activeProjectId), []) : Promise.resolve([]),
                    safe(tasksAPI.getAll(activeProjectId ? { projectId: activeProjectId } : {}), []),
                    safe(sprintsAPI.getActive(activeProjectId || undefined), null),
                    safe(activitiesAPI.getAll({ limit: 20 }), []),
                    safe(timeAPI.summary('month'), []),
                    safe(eventsAPI.getAll({}), []),
                    safe(usersAPI.getAll(), []),
                ]);

                if (cancelled) return;

                const cols: BoardColumn[] = (colsRaw as BoardColumn[]).length
                    ? (colsRaw as BoardColumn[])
                    : DEFAULT_COLUMNS;

                setColumns(cols);
                setTasks(tasksRaw as Task[]);
                setActiveSprint(sprint as Sprint | null);
                setActivities(acts as Activity[]);
                setTimeSummary(sum as TimeEntrySummary[]);
                setEvents(evs as any[]);
                setMembers(users as User[]);
            } catch (err) {
                console.error('Errore loading dashboard:', err);
            }
        }

        load();
        return () => { cancelled = true; };
    }, [activeProjectId]);

    const displayTasks: Task[] = useMemo(() => {
        if (tasks.length > 0) return tasks;
        return mockTasks(columns.length ? columns : DEFAULT_COLUMNS, members);
    }, [tasks, columns, members]);

    const displayActivities = activities.length ? activities : mockActivities(members);
    const displayTimeSummary = timeSummary.length ? timeSummary : mockTimeSummary(members);
    const displaySprint = activeSprint || mockSprint;
    const displayEvents = events.length ? events : mockEvents();

    const handleMoveTask = async (taskId: string, columnId: string, position: number) => {
        setTasks(prev => prev.map(t =>
            t.id === taskId ? { ...t, columnId, position } : t
        ));
        try {
            if (tasks.length > 0) await tasksAPI.move(taskId, columnId, position);
        } catch (err) {
            console.error('Errore move task:', err);
        }
    };

    const handleAddTask = async (columnId: string) => {
        setTaskComposerColumnId(columnId);
    };

    const createTask = async (title: string, columnId: string) => {
        const columnTasks = displayTasks.filter(t => t.columnId === columnId);
        const optimistic: Task = {
            id: `local-${Date.now()}`,
            projectId: activeProjectId || 'demo',
            projectName: activeProjectId ? undefined : 'Project Board',
            columnId,
            columnName: cols.find(c => c.id === columnId)?.name,
            sprintId: activeSprint?.id || null,
            sprintName: activeSprint?.name || undefined,
            title,
            description: null,
            coverUrl: null,
            priority: 'Media',
            storyPoints: 3,
            startDate: null,
            dueDate: null,
            position: columnTasks.length,
            subtasks: [],
            assignees: currentUser ? [currentUser] : [],
            createdAt: new Date().toISOString(),
        };

        setTasks(prev => [...prev, optimistic]);
        setTaskComposerColumnId(null);

        if (!activeProjectId) return;

        try {
            const created = await tasksAPI.create({
                projectId: activeProjectId,
                columnId,
                sprintId: activeSprint?.id || null,
                title: optimistic.title,
                priority: optimistic.priority,
                storyPoints: optimistic.storyPoints,
                position: optimistic.position,
            }) as Task;
            setTasks(prev => prev.map(t => t.id === optimistic.id ? created : t));
        } catch (err) {
            console.error('Errore creazione task:', err);
            window.dispatchEvent(new CustomEvent('app:notice', {
                detail: {
                    title: 'Task creato localmente',
                    message: 'Il task resta visibile in questa sessione, ma il salvataggio sul server non è riuscito.',
                },
            }));
        }
    };

    const cols = columns.length ? columns : DEFAULT_COLUMNS;
    const avgPoints = displaySprint?.completedPoints
        ? Number(((displaySprint.completedPoints / Math.max(1, displaySprint.targetPoints)) * 100).toFixed(2))
        : 87.29;

    const reducedMotion = useReducedMotion();

    return (
        <motion.div
            className="dashboard-bento"
            variants={reducedMotion ? undefined : bentoStagger}
            initial={reducedMotion ? false : 'hidden'}
            animate={reducedMotion ? undefined : 'show'}
        >
            <BentoCell className="bento-kanban">
                <KanbanBoard
                    columns={cols}
                    tasks={displayTasks}
                    onMoveTask={handleMoveTask}
                    onAddTask={handleAddTask}
                />
            </BentoCell>

            <TaskComposerDialog
                open={!!taskComposerColumnId}
                columnName={cols.find(c => c.id === taskComposerColumnId)?.name || 'Task'}
                onClose={() => setTaskComposerColumnId(null)}
                onSubmit={(title) => {
                    if (taskComposerColumnId) createTask(title, taskComposerColumnId);
                }}
            />

            <BentoCell className="bento-activity">
                <ActivityFeed activities={displayActivities} />
            </BentoCell>

            <BentoCell className="bento-timesheet">
                <TimeSheet summary={displayTimeSummary} period="month" />
            </BentoCell>

            <BentoCell className="bento-velocity">
                <SprintVelocity
                    sprint={displaySprint}
                    avgPoints={avgPoints}
                    deltaPct={24}
                    history={[
                        { label: 'Gen', value: 72 },
                        { label: 'Feb', value: 81 },
                        { label: 'Mar', value: 76 },
                        { label: 'Apr', value: 87 },
                    ]}
                />
            </BentoCell>

            <BentoCell className="bento-calendar">
                <CalendarMini
                    events={displayEvents}
                    selectedDate={selectedDate}
                    onSelectDate={setSelectedDate}
                />
            </BentoCell>

            <BentoCell className="bento-promo">
                <PromoCard
                    onAction={() => window.dispatchEvent(new CustomEvent('app:notice', {
                        detail: {
                            title: 'Premium',
                            message: 'Feature premium selezionata. Puoi collegare qui report avanzati, automazioni o upgrade piano.',
                        },
                    }))}
                />
            </BentoCell>
        </motion.div>
    );
}

function TaskComposerDialog({
    open, columnName, onClose, onSubmit,
}: {
    open: boolean;
    columnName: string;
    onClose: () => void;
    onSubmit: (title: string) => void;
}) {
    const [title, setTitle] = useState('');
    const trimmed = title.trim();

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!trimmed) return;
        onSubmit(trimmed);
    };

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [onClose]);

    return (
        <MotionDialog
            open={open}
            onClose={onClose}
            className="relative w-full max-w-md rounded-[28px] border border-line/70 bg-surface-raised/95 p-5 shadow-raised"
            labelledBy="task-composer-title"
        >
            <form onSubmit={submit}>
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-brand-300 font-semibold">
                            Nuovo task
                        </p>
                        <h3 id="task-composer-title" className="text-lg font-semibold text-ink mt-1">
                            Aggiungi a {columnName}
                        </h3>
                        <p className="text-xs text-ink-subtle mt-1">
                            Scrivi un titolo chiaro. Invio salva, Esc chiude.
                        </p>
                    </div>
                    <button type="button" className="icon-btn !w-8 !h-8" onClick={onClose} aria-label="Chiudi">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="mt-5">
                    <label className="block text-xs font-medium text-ink-muted mb-1.5">
                        Titolo
                    </label>
                    <input
                        autoFocus
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Es. Preparare proposta cliente"
                        className="input !py-3"
                    />
                </div>

                <div className="mt-5 flex items-center justify-end gap-2">
                    <button type="button" className="btn-ghost px-3 py-2" onClick={onClose}>
                        Annulla
                    </button>
                    <button type="submit" disabled={!trimmed} className="btn-primary px-4 py-2">
                        <Plus className="w-4 h-4" />
                        Crea task
                    </button>
                </div>
            </form>
        </MotionDialog>
    );
}

// --- Fallback / mock data (per popolare la dashboard quando il DB è vuoto) ---

const DEFAULT_COLUMNS: BoardColumn[] = [
    { id: 'col-progress', projectId: 'demo', name: 'In Progress',     accent: 'violet',  position: 0 },
    { id: 'col-design',   projectId: 'demo', name: 'Ready to Design', accent: 'cyan',    position: 1 },
    { id: 'col-review',   projectId: 'demo', name: 'Final Review',    accent: 'pink',    position: 2 },
    { id: 'col-done',     projectId: 'demo', name: 'Completed',       accent: 'emerald', position: 3 },
];

const mockMembers: User[] = [
    { id: 'u1', name: 'Mehmet Oguz', color: '#8B5CF6', handle: '@mehmet' },
    { id: 'u2', name: 'Sarah Lin',   color: '#EC4899', handle: '@sarah' },
    { id: 'u3', name: 'Aramin Gjadi',color: '#22D3EE', handle: '@aramin' },
    { id: 'u4', name: 'Lia Ferri',   color: '#10B981', handle: '@lia' },
    { id: 'u5', name: 'Ben West',    color: '#F59E0B', handle: '@ben' },
];

function mockTasks(columns: BoardColumn[], members: User[]): Task[] {
    const team = members.length >= 2 ? members.slice(0, 5) : mockMembers;
    const today = new Date();
    const iso = (offset: number) => {
        const d = new Date(today);
        d.setDate(d.getDate() + offset);
        return d.toISOString().split('T')[0];
    };
    const samples: Partial<Task>[] = [
        { title: 'Refine Dashboard Navigation', priority: 'Alta', startDate: iso(-2), dueDate: iso(5), columnId: columns[0]?.id, sprintName: 'Sprint 2', subtasksCount: 2 } as any,
        { title: 'Improve Board Responsiveness for Mobile Devices', priority: 'Alta', columnId: columns[0]?.id, sprintName: 'Sprint 2' } as any,
        { title: 'Implement Dark Mode Toggle', priority: 'Bassa', startDate: iso(0), dueDate: iso(7), columnId: columns[1]?.id, sprintName: 'Sprint 2' } as any,
        { title: 'Customize User Roles and Permissions for Teams', priority: 'Media', startDate: iso(1), dueDate: iso(10), columnId: columns[1]?.id, sprintName: 'Sprint 3', subtasksCount: 2 } as any,
        { title: 'Enhance Visual Feedback', priority: 'Media', startDate: iso(-1), dueDate: iso(4), columnId: columns[2]?.id, sprintName: 'Sprint 2', subtasksCount: 2 } as any,
        { title: 'Refine Empty States Across Modules', priority: 'Bassa', columnId: columns[3]?.id, sprintName: 'Sprint 1' } as any,
    ];
    return samples.map((s, i) => ({
        id: `mock-${i}`,
        projectId: 'demo',
        projectName: 'Project Board',
        columnId: s.columnId || columns[0]?.id || null,
        sprintId: null,
        sprintName: (s as any).sprintName || 'Sprint 2',
        title: s.title!,
        description: null,
        coverUrl: null,
        priority: (s.priority as any) || 'Media',
        storyPoints: 3,
        startDate: (s as any).startDate || null,
        dueDate: (s as any).dueDate || null,
        position: i,
        subtasks: Array.from({ length: (s as any).subtasksCount || 0 }, (_, k) => ({
            id: `mock-st-${i}-${k}`,
            taskId: `mock-${i}`,
            text: `Subtask ${k + 1}`,
            completed: k === 0,
            position: k,
        })),
        assignees: [team[i % team.length], team[(i + 1) % team.length]].filter(Boolean) as User[],
        columnName: columns.find(c => c.id === (s.columnId || columns[0]?.id))?.name,
    }));
}

function mockActivities(members: User[]): Activity[] {
    const team = members.length ? members : mockMembers;
    const now = Date.now();
    return [
        {
            id: 'a1', actorId: team[0].id, actorName: team[0].name, actorColor: team[0].color,
            type: 'file.uploaded', payload: { fileName: 'Project Brief.txt', size: '24.5 MB', progress: 43, target: 'Client Brief' },
            createdAt: new Date(now - 1000 * 60 * 4).toISOString(),
        },
        {
            id: 'a2', actorId: team[1]?.id || team[0].id, actorName: team[1]?.name || team[0].name, actorColor: team[1]?.color,
            type: 'comment.added',
            payload: { body: 'Awesome design! Love how you handled the spacing.', target: 'Enhance Visual Feedback' },
            createdAt: new Date(now - 1000 * 60 * 18).toISOString(),
        },
        {
            id: 'a3', actorId: team[2]?.id || team[0].id, actorName: team[2]?.name || team[0].name, actorColor: team[2]?.color,
            type: 'mention',
            payload: { body: 'Just having a blast with these activity components!', target: 'Dev.ui Kit' },
            createdAt: new Date(now - 1000 * 60 * 60).toISOString(),
        },
    ] as Activity[];
}

function mockTimeSummary(members: User[]): TimeEntrySummary[] {
    const team = members.length ? members : mockMembers;
    return team.slice(0, 5).map((u, i) => ({
        id: u.id,
        name: u.name,
        avatarUrl: u.avatarUrl,
        handle: u.handle,
        color: u.color,
        totalHours: 22 - i * 3.5,
        entryCount: 18 - i * 2,
    }));
}

const mockSprint: Sprint = {
    id: 'sprint-mock',
    projectId: null,
    name: 'Sprint 2 / Ready to design',
    goal: 'Refine dashboard',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString().split('T')[0],
    targetPoints: 100,
    completedPoints: 87,
    status: 'active',
};

function mockEvents() {
    const today = new Date();
    const at = (h: number, m = 0) => {
        const d = new Date(today);
        d.setHours(h, m, 0, 0);
        return d.toISOString();
    };
    return [
        { id: 'e1', title: 'Refine Dashboard Navigation Flow', startTime: at(8, 0),  endTime: at(9, 0) },
        { id: 'e2', title: 'Customize User Roles and Permissions', startTime: at(10, 30), endTime: at(11, 30) },
        { id: 'e3', title: 'Sprint Review', startTime: at(12, 0), endTime: at(12, 45) },
    ];
}

