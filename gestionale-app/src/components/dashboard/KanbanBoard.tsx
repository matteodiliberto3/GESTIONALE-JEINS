import { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
    DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
    closestCorners, useDroppable,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Filter, Share2, MoreHorizontal, ArrowDownWideNarrow } from 'lucide-react';
import { TaskCard } from './TaskCard';
import { TRANSITION } from '../../motion/presets';
import { dropdown } from '../../motion/variants';
import { openNotice } from '../../utils/notice';
import type { Task, BoardColumn } from '../../types/models';

interface KanbanBoardProps {
    columns: BoardColumn[];
    tasks: Task[];
    onMoveTask: (taskId: string, columnId: string, position: number) => void;
    onAddTask?: (columnId: string) => void;
    onDeleteTask?: (taskId: string) => void;
    onSortColumnByPriority?: (columnId: string) => void;
}

const columnPill = 'bg-surface-inset border-line/50';
const columnDot = 'bg-brand-500';
const columnText = 'text-ink-muted';

export function KanbanBoard({
    columns, tasks, onMoveTask, onAddTask, onDeleteTask, onSortColumnByPriority,
}: KanbanBoardProps) {
    const [activeTask, setActiveTask] = useState<Task | null>(null);

    const sensors = useSensors(useSensor(PointerSensor, {
        activationConstraint: { distance: 8 },
    }));

    const tasksByColumn = useMemo(() => {
        const map = new Map<string, Task[]>();
        columns.forEach(c => map.set(c.id, []));
        tasks.forEach(t => {
            if (t.columnId && map.has(t.columnId)) map.get(t.columnId)!.push(t);
        });
        map.forEach(list => list.sort((a, b) => a.position - b.position));
        return map;
    }, [columns, tasks]);

    const handleDragStart = (e: DragStartEvent) => {
        const t = tasks.find(x => x.id === e.active.id);
        if (t) setActiveTask(t);
    };

    const handleDragEnd = (e: DragEndEvent) => {
        const { active, over } = e;
        setActiveTask(null);
        if (!over) return;

        const overData = over.data.current as { type?: string; task?: Task; columnId?: string } | undefined;
        const overColumnId =
            overData?.type === 'column' ? (over.id as string)
            : overData?.type === 'task' ? overData.task?.columnId
            : null;

        if (!overColumnId) return;

        const taskId = active.id as string;
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        const colTasks = tasksByColumn.get(overColumnId) || [];
        let newPosition = colTasks.length;
        if (overData?.type === 'task') {
            const idx = colTasks.findIndex(t => t.id === over.id);
            newPosition = idx >= 0 ? idx : colTasks.length;
        }

        if (task.columnId === overColumnId && task.position === newPosition) return;
        onMoveTask(taskId, overColumnId, newPosition);
    };

    return (
        <section className="bento-panel overflow-hidden h-full flex flex-col">
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
                <h3 className="text-sm font-semibold text-ink tracking-tight">Task</h3>
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        className="icon-btn"
                        aria-label="Ordina per priorità"
                        title="Ordina per priorità"
                        onClick={() => {
                            if (!onSortColumnByPriority) {
                                openNotice('Ordinamento', 'Ordina le colonne per priorità.');
                                return;
                            }
                            columns.forEach(c => onSortColumnByPriority(c.id));
                        }}
                    >
                        <ArrowDownWideNarrow className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        className="icon-btn"
                        aria-label="Filtra"
                        onClick={() => openNotice('Filtri', 'Filtri per priorità, assegnatario e sprint in arrivo.')}
                    >
                        <Filter className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        className="icon-btn"
                        aria-label="Condividi board"
                        onClick={() => openNotice('Condividi', 'Link al board in preparazione.')}
                    >
                        <Share2 className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        className="btn-primary text-xs !px-3 !py-1.5"
                        onClick={() => onAddTask?.(columns[0]?.id || '')}
                    >
                        <Plus className="w-3.5 h-3.5" /> Nuovo task
                    </button>
                </div>
            </div>

            <div className="px-5 pb-5 flex-1 min-h-0">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin h-full">
                        {columns.map(col => (
                            <KanbanColumn
                                key={col.id}
                                column={col}
                                tasks={tasksByColumn.get(col.id) || []}
                                onAddTask={onAddTask}
                                onDeleteTask={onDeleteTask}
                                onSortByPriority={onSortColumnByPriority}
                            />
                        ))}
                    </div>
                    {createPortal(
                        <DragOverlay dropAnimation={{ duration: 180, easing: 'ease-out' }}>
                            {activeTask && (
                                <div className="w-[17rem]">
                                    <TaskCard task={activeTask} isOverlay />
                                </div>
                            )}
                        </DragOverlay>,
                        document.body,
                    )}
                </DndContext>
            </div>
        </section>
    );
}

function KanbanColumn({
    column, tasks, onAddTask, onDeleteTask, onSortByPriority,
}: {
    column: BoardColumn;
    tasks: Task[];
    onAddTask?: (columnId: string) => void;
    onDeleteTask?: (taskId: string) => void;
    onSortByPriority?: (columnId: string) => void;
}) {
    const { setNodeRef, isOver } = useDroppable({
        id: column.id,
        data: { type: 'column', columnId: column.id },
    });

    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!menuOpen) return;
        const onClick = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, [menuOpen]);

    return (
        <div ref={setNodeRef} className="w-[17rem] flex-shrink-0 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-2 px-0.5">
                <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full border ${columnPill}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${columnDot}`} />
                    <span className={`text-[10px] font-semibold uppercase tracking-wide ${columnText}`}>
                        {column.name}
                    </span>
                    <span className="text-[10px] text-ink font-bold tabular-nums ml-0.5">
                        {tasks.length}
                    </span>
                </div>
                <div className="flex items-center gap-0.5">
                    <button
                        type="button"
                        className="icon-btn !w-7 !h-7"
                        onClick={() => onAddTask?.(column.id)}
                        aria-label="Aggiungi task"
                    >
                        <Plus className="w-3.5 h-3.5" />
                    </button>
                    <div className="relative" ref={menuRef}>
                        <button
                            type="button"
                            className="icon-btn !w-7 !h-7"
                            onClick={() => setMenuOpen(o => !o)}
                            aria-label="Opzioni colonna"
                        >
                            <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>
                        <AnimatePresence>
                            {menuOpen && (
                                <motion.div
                                    className="absolute right-0 top-full mt-1.5 w-52 bento-panel p-1 z-50"
                                    variants={dropdown}
                                    initial="hidden"
                                    animate="show"
                                    exit="exit"
                                >
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onSortByPriority?.(column.id);
                                            setMenuOpen(false);
                                        }}
                                        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg
                                                   text-xs text-ink hover:bg-surface-inset/70 transition-colors"
                                    >
                                        <ArrowDownWideNarrow className="w-3.5 h-3.5 text-ink-subtle" />
                                        Ordina per priorità
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onAddTask?.(column.id);
                                            setMenuOpen(false);
                                        }}
                                        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg
                                                   text-xs text-ink hover:bg-surface-inset/70 transition-colors"
                                    >
                                        <Plus className="w-3.5 h-3.5 text-ink-subtle" />
                                        Aggiungi task
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <motion.div
                className="kanban-well space-y-2 flex-1 overflow-y-auto scrollbar-thin"
                animate={{
                    borderColor: isOver ? 'rgba(26, 122, 85, 0.4)' : 'rgba(var(--line) / 0.5)',
                    backgroundColor: isOver ? 'rgba(26, 122, 85, 0.06)' : 'rgb(var(--surface-inset) / 0.5)',
                }}
                transition={TRANSITION.fast}
            >
                <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    {tasks.map(t => (
                        <TaskCard key={t.id} task={t} onDelete={onDeleteTask} />
                    ))}
                </SortableContext>
                {tasks.length === 0 && (
                    <p className="text-xs text-ink-subtle italic px-3 py-6 text-center">
                        Trascina qui i task
                    </p>
                )}
            </motion.div>
        </div>
    );
}
