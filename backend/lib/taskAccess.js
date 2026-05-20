import pool from '../database/connection.js';
import { isPrivileged, canAccessProjectInArea } from './roles.js';

export async function canEditTask(user, taskId) {
    if (isPrivileged(user.role)) return true;

    const result = await pool.query(
        `SELECT t.created_by, p.area,
                EXISTS(
                    SELECT 1 FROM task_assignees ta
                    WHERE ta.task_id = t.task_id AND ta.user_id = $2
                ) AS assigned
         FROM tasks t
         LEFT JOIN projects p ON p.project_id = t.project_id
         WHERE t.task_id = $1`,
        [taskId, user.userId],
    );

    if (!result.rows.length) return false;

    const row = result.rows[0];
    const isOwnerOrAssignee = row.created_by === user.userId || row.assigned;
    if (!isOwnerOrAssignee) return false;

    return canAccessProjectInArea(user, row.area);
}

export async function canEditProjectTasks(user, projectId) {
    if (isPrivileged(user.role)) return true;

    const result = await pool.query(
        'SELECT area FROM projects WHERE project_id = $1',
        [projectId],
    );
    if (!result.rows.length) return false;
    return canAccessProjectInArea(user, result.rows[0].area);
}
