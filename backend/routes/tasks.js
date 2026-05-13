import express from 'express';
import pool from '../database/connection.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticateToken);

// Helper: carica subtasks + assignees per una lista di task
async function hydrateTasks(taskRows) {
    if (taskRows.length === 0) return [];
    const ids = taskRows.map(t => t.id);

    const subtasks = await pool.query(
        `SELECT subtask_id as id, task_id as "taskId", text, completed, position
         FROM subtasks WHERE task_id = ANY($1::uuid[]) ORDER BY position ASC`,
        [ids]
    );

    const assignees = await pool.query(
        `SELECT ta.task_id as "taskId", u.user_id as id, u.name, u.email,
                u.avatar_url as "avatarUrl", u.handle, u.color
         FROM task_assignees ta
         JOIN users u ON u.user_id = ta.user_id
         WHERE ta.task_id = ANY($1::uuid[])`,
        [ids]
    );

    return taskRows.map(t => ({
        ...t,
        subtasks: subtasks.rows.filter(s => s.taskId === t.id),
        assignees: assignees.rows.filter(a => a.taskId === t.id),
    }));
}

// GET /api/tasks - tutti i task (filtri opzionali)
router.get('/', async (req, res) => {
    try {
        const { projectId, columnId, sprintId } = req.query;
        const conditions = [];
        const params = [];

        if (projectId) { params.push(projectId); conditions.push(`t.project_id = $${params.length}`); }
        if (columnId)  { params.push(columnId);  conditions.push(`t.column_id = $${params.length}`); }
        if (sprintId)  { params.push(sprintId);  conditions.push(`t.sprint_id = $${params.length}`); }

        const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

        const result = await pool.query(
            `SELECT t.task_id as id, t.project_id as "projectId", t.column_id as "columnId",
                    t.sprint_id as "sprintId", t.title, t.description, t.cover_url as "coverUrl",
                    t.priority, t.story_points as "storyPoints",
                    t.start_date as "startDate", t.due_date as "dueDate", t.position,
                    t.created_at as "createdAt", t.updated_at as "updatedAt",
                    p.name as "projectName", bc.name as "columnName", s.name as "sprintName"
             FROM tasks t
             LEFT JOIN projects p ON p.project_id = t.project_id
             LEFT JOIN board_columns bc ON bc.column_id = t.column_id
             LEFT JOIN sprints s ON s.sprint_id = t.sprint_id
             ${where}
             ORDER BY t.position ASC, t.created_at DESC`,
            params
        );

        res.json(await hydrateTasks(result.rows));
    } catch (error) {
        console.error('Errore recupero tasks:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

// GET /api/tasks/:id
router.get('/:id', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT t.task_id as id, t.project_id as "projectId", t.column_id as "columnId",
                    t.sprint_id as "sprintId", t.title, t.description, t.cover_url as "coverUrl",
                    t.priority, t.story_points as "storyPoints",
                    t.start_date as "startDate", t.due_date as "dueDate", t.position,
                    t.created_at as "createdAt", t.updated_at as "updatedAt"
             FROM tasks t WHERE t.task_id = $1`,
            [req.params.id]
        );
        if (!result.rows.length) return res.status(404).json({ error: 'Task non trovato' });
        const [task] = await hydrateTasks(result.rows);
        res.json(task);
    } catch (error) {
        console.error('Errore recupero task:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

// POST /api/tasks
router.post('/', async (req, res) => {
    try {
        const {
            projectId, columnId, sprintId, title, description, coverUrl,
            priority, storyPoints, startDate, dueDate, position, assigneeIds
        } = req.body;

        if (!projectId || !title) {
            return res.status(400).json({ error: 'projectId e title sono obbligatori' });
        }

        const result = await pool.query(
            `INSERT INTO tasks (project_id, column_id, sprint_id, title, description, cover_url,
                                priority, story_points, start_date, due_date, position, created_by)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
             RETURNING task_id as id, project_id as "projectId", column_id as "columnId",
                       sprint_id as "sprintId", title, description, cover_url as "coverUrl",
                       priority, story_points as "storyPoints",
                       start_date as "startDate", due_date as "dueDate", position,
                       created_at as "createdAt"`,
            [projectId, columnId || null, sprintId || null, title, description || null,
             coverUrl || null, priority || 'Media', storyPoints || 0,
             startDate || null, dueDate || null, position || 0, req.user.userId]
        );

        const task = result.rows[0];

        if (Array.isArray(assigneeIds) && assigneeIds.length) {
            const values = assigneeIds.map((_, i) => `($1, $${i + 2})`).join(',');
            await pool.query(
                `INSERT INTO task_assignees (task_id, user_id) VALUES ${values}
                 ON CONFLICT DO NOTHING`,
                [task.id, ...assigneeIds]
            );
        }

        await pool.query(
            `INSERT INTO activities (actor_id, type, target_type, target_id, project_id, payload)
             VALUES ($1, 'task.created', 'task', $2, $3, $4::jsonb)`,
            [req.user.userId, task.id, projectId, JSON.stringify({ title })]
        );

        const [hydrated] = await hydrateTasks([task]);
        res.status(201).json(hydrated);
    } catch (error) {
        console.error('Errore creazione task:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

// PUT /api/tasks/:id
router.put('/:id', async (req, res) => {
    try {
        const {
            columnId, sprintId, title, description, coverUrl,
            priority, storyPoints, startDate, dueDate, position
        } = req.body;

        const result = await pool.query(
            `UPDATE tasks SET
                column_id   = COALESCE($1, column_id),
                sprint_id   = COALESCE($2, sprint_id),
                title       = COALESCE($3, title),
                description = COALESCE($4, description),
                cover_url   = COALESCE($5, cover_url),
                priority    = COALESCE($6, priority),
                story_points= COALESCE($7, story_points),
                start_date  = COALESCE($8, start_date),
                due_date    = COALESCE($9, due_date),
                position    = COALESCE($10, position),
                updated_at  = CURRENT_TIMESTAMP
             WHERE task_id = $11
             RETURNING task_id as id, project_id as "projectId", column_id as "columnId",
                       sprint_id as "sprintId", title, description, cover_url as "coverUrl",
                       priority, story_points as "storyPoints",
                       start_date as "startDate", due_date as "dueDate", position,
                       created_at as "createdAt"`,
            [columnId, sprintId, title, description, coverUrl, priority,
             storyPoints, startDate, dueDate, position, req.params.id]
        );

        if (!result.rows.length) return res.status(404).json({ error: 'Task non trovato' });
        const [hydrated] = await hydrateTasks([result.rows[0]]);
        res.json(hydrated);
    } catch (error) {
        console.error('Errore aggiornamento task:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

// PATCH /api/tasks/:id/move - sposta tra colonne (drag & drop)
router.patch('/:id/move', async (req, res) => {
    try {
        const { columnId, position } = req.body;
        const result = await pool.query(
            `UPDATE tasks SET column_id = $1, position = COALESCE($2, position),
                              updated_at = CURRENT_TIMESTAMP
             WHERE task_id = $3
             RETURNING task_id as id, column_id as "columnId", position`,
            [columnId, position, req.params.id]
        );
        if (!result.rows.length) return res.status(404).json({ error: 'Task non trovato' });

        await pool.query(
            `INSERT INTO activities (actor_id, type, target_type, target_id, payload)
             VALUES ($1, 'task.moved', 'task', $2, $3::jsonb)`,
            [req.user.userId, req.params.id, JSON.stringify({ columnId, position })]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Errore move task:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

// DELETE /api/tasks/:id
router.delete('/:id', async (req, res) => {
    try {
        const result = await pool.query(
            'DELETE FROM tasks WHERE task_id = $1 RETURNING task_id',
            [req.params.id]
        );
        if (!result.rows.length) return res.status(404).json({ error: 'Task non trovato' });
        res.json({ message: 'Task eliminato' });
    } catch (error) {
        console.error('Errore delete task:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

// --- Subtasks ---
router.post('/:id/subtasks', async (req, res) => {
    try {
        const { text, position } = req.body;
        if (!text) return res.status(400).json({ error: 'text obbligatorio' });
        const result = await pool.query(
            `INSERT INTO subtasks (task_id, text, position)
             VALUES ($1, $2, COALESCE($3, 0))
             RETURNING subtask_id as id, task_id as "taskId", text, completed, position`,
            [req.params.id, text, position]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Errore add subtask:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

router.patch('/:taskId/subtasks/:subtaskId/toggle', async (req, res) => {
    try {
        const result = await pool.query(
            `UPDATE subtasks SET completed = NOT completed, updated_at = CURRENT_TIMESTAMP
             WHERE subtask_id = $1 AND task_id = $2
             RETURNING subtask_id as id, task_id as "taskId", text, completed, position`,
            [req.params.subtaskId, req.params.taskId]
        );
        if (!result.rows.length) return res.status(404).json({ error: 'Subtask non trovato' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Errore toggle subtask:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

router.delete('/:taskId/subtasks/:subtaskId', async (req, res) => {
    try {
        const result = await pool.query(
            'DELETE FROM subtasks WHERE subtask_id = $1 AND task_id = $2 RETURNING subtask_id',
            [req.params.subtaskId, req.params.taskId]
        );
        if (!result.rows.length) return res.status(404).json({ error: 'Subtask non trovato' });
        res.json({ message: 'Subtask eliminato' });
    } catch (error) {
        console.error('Errore delete subtask:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

// --- Assignees ---
router.post('/:id/assignees', async (req, res) => {
    try {
        const { userId } = req.body;
        await pool.query(
            `INSERT INTO task_assignees (task_id, user_id) VALUES ($1, $2)
             ON CONFLICT DO NOTHING`,
            [req.params.id, userId]
        );
        res.status(201).json({ message: 'Assegnato' });
    } catch (error) {
        console.error('Errore add assignee:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

router.delete('/:id/assignees/:userId', async (req, res) => {
    try {
        await pool.query(
            'DELETE FROM task_assignees WHERE task_id = $1 AND user_id = $2',
            [req.params.id, req.params.userId]
        );
        res.json({ message: 'Rimosso' });
    } catch (error) {
        console.error('Errore remove assignee:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

// --- Board columns (lette per progetto) ---
router.get('/columns/by-project/:projectId', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT column_id as id, project_id as "projectId", name, accent, position
             FROM board_columns WHERE project_id = $1 ORDER BY position ASC`,
            [req.params.projectId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Errore get columns:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

export default router;
