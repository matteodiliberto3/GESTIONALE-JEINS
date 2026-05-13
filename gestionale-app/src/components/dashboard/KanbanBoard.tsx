import { useState, useMemo } from 'react';
import {
    DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
    closestCorners, useDroppable,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, Filter, Share2 } from 'lucide-react';
import { TaskCard } from './TaskCard';
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
        activationConstraint: { distance: 6 },
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

        const overData = over.data.current as any;
        const overColumnId =
            overData?.type === 'column' ? (over.id as string)
            : overData?.type === 'task' ? overData.task.columnId
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
        <section className="card overflow-hidden">
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
                <h3 className="text-base font-semibold text-ink">All Tasks</h3>
                <div className="flex items-center gap-1">
                    <button
                        className="icon-btn"
                        aria-label="Filtra"
                        onClick={() => notice('Filtri task', 'Filtro pronto: qui potrai filtrare per priorità, assegnatario e sprint.')}
                    >
                        <Filter className="w-4 h-4" />
                    </button>
                    <button
                        className="icon-btn"
                        aria-label="Condividi"
                        onClick={() => notice('Condividi board', 'Link board preparato. Collega qui copia link o invito team.')}
                    >
                        <Share2 className="w-4 h-4" />
                    </button>
                    <button className="btn-primary text-xs px-3 py-1.5" onClick={() => onAddTask?.(columns[0]?.id || '')}>
                        <Plus className="w-3.5 h-3.5" /> Add Task
                    </button>
                </div>
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
                    <DragOverlay>
                        {activeTask && (
                            <div className="w-72">
                                <TaskCard task={activeTask} isOverlay />
                            </div>
                        )}
                    </DragOverlay>
                </DndContext>
            </div>
        </section>
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
            <div className={`flex items-center justify-between mb-2 px-1 py-1 rounded-lg
                             ${isOver ? 'bg-surface-inset/70' : ''}`}>
                <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full
                                 bg-surface-inset border border-line/60`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${accent.dot}`} />
                    <span className={`text-[11px] font-semibold uppercase tracking-wider ${accent.text}`}>
                        {column.name}
                    </span>
                    <span className="text-[10px] text-ink-subtle font-medium">{tasks.length}</span>
                </div>
                <button
                    className="icon-btn !w-7 !h-7"
                    onClick={() => onAddTask?.(column.id)}
                    aria-label="Aggiungi task"
                >
                    <Plus className="w-3.5 h-3.5" />
                </button>
            </div>

            <div className={`min-h-[200px] rounded-xl space-y-2 p-1
                             ${isOver ? 'bg-brand-500/5 ring-1 ring-brand-500/30' : ''}`}>
                <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    {tasks.map(t => (
                        <TaskCard key={t.id} task={t} />
                    ))}
                </SortableContext>
                {tasks.length === 0 && (
                    <div className="text-[11px] text-ink-subtle italic px-3 py-6 text-center">
                        Trascina qui i task
                    </div>
                )}
            </div>
        </div>
    );
}
