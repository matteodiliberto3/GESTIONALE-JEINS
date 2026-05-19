import { useState, useMemo } from 'react';
import {
    DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
    closestCorners, useDroppable,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { motion } from 'framer-motion';
import { Plus, Filter, Share2 } from 'lucide-react';
import { TaskCard } from './TaskCard';
import { SPRING, TRANSITION } from '../../motion/presets';
import type { Task, BoardColumn } from '../../types/models';

interface KanbanBoardProps {
    columns: BoardColumn[];
    tasks: Task[];
    onMoveTask: (taskId: string, columnId: string, position: number) => void;
    onAddTask?: (columnId: string) => void;
}

const columnAccent: Record<string, { dot: string; text: string }> = {
    violet:  { dot: 'bg-brand-400',   text: 'text-brand-300' },
    cyan:    { dot: 'bg-cyan-400',    text: 'text-cyan-300' },
    pink:    { dot: 'bg-pink-400',    text: 'text-pink-300' },
    emerald: { dot: 'bg-emerald-400', text: 'text-emerald-300' },
    amber:   { dot: 'bg-amber-400',   text: 'text-amber-300' },
    rose:    { dot: 'bg-rose-400',    text: 'text-rose-300' },
};

export function KanbanBoard({ columns, tasks, onMoveTask, onAddTask }: KanbanBoardProps) {
    const [activeTask, setActiveTask] = useState<Task | null>(null);

    const notice = (title: string, message: string) => {
        window.dispatchEvent(new CustomEvent('app:notice', { detail: { title, message } }));
    };

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
        <motion.section
            className="bento-panel overflow-hidden"
            layout
            transition={TRANSITION.normal}
        >
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
                <h3 className="text-base font-semibold text-ink tracking-tight">All Tasks</h3>
                <motion.div className="flex items-center gap-1" layout="position">
                    <motion.button
                        type="button"
                        className="icon-btn"
                        aria-label="Filtra"
                        whileTap={{ scale: 0.96 }}
                        transition={SPRING.snap}
                        onClick={() => notice('Filtri task', 'Filtro pronto: qui potrai filtrare per priorità, assegnatario e sprint.')}
                    >
                        <Filter className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                        type="button"
                        className="icon-btn"
                        aria-label="Condividi"
                        whileTap={{ scale: 0.96 }}
                        transition={SPRING.snap}
                        onClick={() => notice('Condividi board', 'Link board preparato. Collega qui copia link o invito team.')}
                    >
                        <Share2 className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                        type="button"
                        className="btn-primary text-xs px-3 py-1.5"
                        whileTap={{ scale: 0.98 }}
                        transition={SPRING.snap}
                        onClick={() => onAddTask?.(columns[0]?.id || '')}
                    >
                        <Plus className="w-3.5 h-3.5" /> Add Task
                    </motion.button>
                </motion.div>
            </div>

            <div className="px-5 pb-5">
                <DndContext sensors={sensors} collisionDetection={closestCorners}
                            onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                        {columns.map(col => (
                            <KanbanColumn
                                key={col.id}
                                column={col}
                                tasks={tasksByColumn.get(col.id) || []}
                                accent={columnAccent[col.accent] || columnAccent.violet}
                                onAddTask={onAddTask}
                            />
                        ))}
                    </div>
                    <DragOverlay dropAnimation={{ duration: 200, easing: 'ease-out' }}>
                        {activeTask && (
                            <motion.div
                                className="w-72"
                                initial={{ scale: 1, rotate: 0 }}
                                animate={{ scale: 1.02, rotate: 0.5 }}
                                transition={SPRING.soft}
                            >
                                <TaskCard task={activeTask} isOverlay />
                            </motion.div>
                        )}
                    </DragOverlay>
                </DndContext>
            </div>
        </motion.section>
    );
}

function KanbanColumn({
    column, tasks, accent, onAddTask,
}: {
    column: BoardColumn;
    tasks: Task[];
    accent: { dot: string; text: string };
    onAddTask?: (columnId: string) => void;
}) {
    const { setNodeRef, isOver } = useDroppable({
        id: column.id,
        data: { type: 'column', columnId: column.id },
    });

    return (
        <div ref={setNodeRef} className="w-72 flex-shrink-0">
            <div className={`flex items-center justify-between mb-2 px-1 py-1 rounded-lg transition-colors duration-200
                             ${isOver ? 'bg-surface-inset/70' : ''}`}>
                <motion.div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full
                                 bg-surface-inset/80 border border-line/50 backdrop-blur-sm`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${accent.dot}`} />
                    <span className={`text-[11px] font-semibold uppercase tracking-wider ${accent.text}`}>
                        {column.name}
                    </span>
                    <motion.span
                        key={tasks.length}
                        className="text-[10px] text-ink-subtle font-medium tabular-nums"
                        initial={{ opacity: 0.6, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={SPRING.snap}
                    >
                        {tasks.length}
                    </motion.span>
                </motion.div>
                <motion.button
                    type="button"
                    className="icon-btn !w-7 !h-7"
                    whileTap={{ scale: 0.94 }}
                    transition={SPRING.snap}
                    onClick={() => onAddTask?.(column.id)}
                    aria-label="Aggiungi task"
                >
                    <Plus className="w-3.5 h-3.5" />
                </motion.button>
            </div>

            <motion.div
                className="kanban-well space-y-2"
                animate={{
                    borderColor: isOver ? 'rgba(139, 92, 246, 0.35)' : 'rgba(42, 40, 52, 0.45)',
                    backgroundColor: isOver ? 'rgba(139, 92, 246, 0.08)' : 'rgba(14, 14, 18, 0.35)',
                }}
                transition={TRANSITION.fast}
            >
                <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    {tasks.map(t => (
                        <TaskCard key={t.id} task={t} />
                    ))}
                </SortableContext>
                {tasks.length === 0 && (
                    <p className="text-[11px] text-ink-subtle italic px-3 py-6 text-center">
                        Trascina qui i task
                    </p>
                )}
            </motion.div>
        </div>
    );
}
