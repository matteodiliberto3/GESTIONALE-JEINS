import { CheckSquare, Calendar, MoreHorizontal } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { AvatarGroup } from '../ui/AvatarGroup';
import { PriorityBadge } from '../ui/PriorityBadge';
import { SPRING } from '../../motion/presets';
import { useReducedMotion } from '../../motion/useReducedMotion';
import type { Task } from '../../types/models';

interface TaskCardProps {
    task: Task;
    isOverlay?: boolean;
}

function formatRange(start?: string | null, due?: string | null) {
    const fmt = (d: string) => new Date(d).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
    if (start && due) return `${fmt(start)} – ${fmt(due)}`;
    if (due) return `Scade ${fmt(due)}`;
    if (start) return `Dal ${fmt(start)}`;
    return null;
}

export function TaskCard({ task, isOverlay = false }: TaskCardProps) {
    const reduced = useReducedMotion();
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: task.id,
        data: { type: 'task', task },
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging && !isOverlay ? 0.35 : 1,
    };

    const done = task.subtasks.filter(s => s.completed).length;
    const range = formatRange(task.startDate, task.dueDate);

    const cardClass = `group bento-panel--task p-3 cursor-grab active:cursor-grabbing select-none
        ${isOverlay ? 'shadow-raised rotate-1 ring-1 ring-brand-500/40' : 'hover:border-brand-500/25 hover:shadow-glow-violet'}`;

    const body = (
        <>
            {task.coverUrl && (
                <motion.div className="aspect-[16/9] rounded-xl overflow-hidden mb-3 bg-surface-inset ring-1 ring-line/30">
                    <img src={task.coverUrl} alt="" className="w-full h-full object-cover" />
                </motion.div>
            )}

            <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="text-sm font-semibold text-ink leading-snug truncate">{task.title}</h4>
                <button
                    type="button"
                    className="icon-btn !w-7 !h-7 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                    onClick={(e) => {
                        e.stopPropagation();
                        window.dispatchEvent(new CustomEvent('app:notice', {
                            detail: {
                                title: task.title,
                                message: 'Menu task aperto. Da qui potrai modificare assegnatari, priorità e subtasks.',
                            },
                        }));
                    }}
                    aria-label="Più opzioni"
                >
                    <MoreHorizontal className="w-3.5 h-3.5" />
                </button>
            </div>

            <p className="text-[11px] text-ink-subtle truncate mb-2">
                {task.sprintName ? `Sprints / ${task.sprintName}` : task.projectName || '—'}
                {task.columnName ? ` · ${task.columnName}` : ''}
            </p>

            {range && (
                <div className="flex items-center gap-1.5 text-[11px] text-ink-muted mb-3">
                    <Calendar className="w-3 h-3" />
                    <span>{range}</span>
                </div>
            )}

            <div className="flex items-center justify-between">
                <AvatarGroup users={task.assignees} max={3} size="xs" />
                <PriorityBadge priority={task.priority} showIcon={false} />
            </div>

            {task.subtasks.length > 0 && (
                <div className="mt-3 pt-3 border-t border-line/50 flex items-center gap-1.5 text-[11px] text-ink-muted">
                    <CheckSquare className="w-3 h-3" />
                    <span>
                        {done}/{task.subtasks.length} subtask
                    </span>
                </div>
            )}
        </>
    );

    const shared = { ref: setNodeRef, style, ...attributes, ...listeners, className: cardClass };

    if (reduced || isOverlay) {
        return <div {...shared}>{body}</div>;
    }

    return (
        <motion.div
            {...shared}
            whileHover={isDragging ? undefined : { y: -2 }}
            transition={SPRING.snap}
        >
            {body}
        </motion.div>
    );
}
