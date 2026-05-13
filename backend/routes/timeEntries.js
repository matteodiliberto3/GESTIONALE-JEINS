import express from 'express';
import pool from '../database/connection.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticateToken);

router.get('/', async (req, res) => {
    try {
        const { userId, projectId, startDate, endDate } = req.query;
        const conditions = [];
        const params = [];
        if (userId)    { params.push(userId);    conditions.push(`te.user_id = $${params.length}`); }
        if (projectId) { params.push(projectId); conditions.push(`te.project_id = $${params.length}`); }
        if (startDate) { params.push(startDate); conditions.push(`te.entry_date >= $${params.length}`); }
        if (endDate)   { params.push(endDate);   conditions.push(`te.entry_date <= $${params.length}`); }
        const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

        const result = await pool.query(
            `SELECT te.entry_id as id, te.user_id as "userId", te.project_id as "projectId",
                    te.task_id as "taskId", te.hours, te.entry_date as "entryDate", te.note,
                    u.name as "userName", u.avatar_url as "userAvatar",
                    u.handle as "userHandle", u.color as "userColor",
                    p.name as "projectName"
             FROM time_entries te
             LEFT JOIN users u ON u.user_id = te.user_id
             LEFT JOIN projects p ON p.project_id = te.project_id
             ${where}
             ORDER BY te.entry_date DESC, te.created_at DESC`,
            params
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Errore get time entries:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

// GET /api/time-entries/summary?period=month
// Aggregato ore per utente nel periodo
router.get('/summary', async (req, res) => {
    try {
        const { period = 'month' } = req.query;
        const interval = period === 'week' ? "7 days" : period === 'year' ? "365 days" : "30 days";

        const result = await pool.query(
            `SELECT u.user_id as id, u.name, u.avatar_url as "avatarUrl",
                    u.handle, u.color,
                    COALESCE(SUM(te.hours), 0)::numeric(10,2) as "totalHours",
                    COUNT(te.entry_id) as "entryCount"
             FROM users u
             LEFT JOIN time_entries te ON te.user_id = u.user_id
                  AND te.entry_date >= CURRENT_DATE - INTERVAL '${interval}'
             GROUP BY u.user_id, u.name, u.avatar_url, u.handle, u.color
             HAVING COALESCE(SUM(te.hours), 0) > 0
             ORDER BY "totalHours" DESC
             LIMIT 10`
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Errore time summary:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { projectId, taskId, hours, entryDate, note } = req.body;
        if (!hours || !entryDate) return res.status(400).json({ error: 'hours e entryDate obbligatori' });
        const result = await pool.query(
            `INSERT INTO time_entries (user_id, project_id, task_id, hours, entry_date, note)
             VALUES ($1,$2,$3,$4,$5,$6)
             RETURNING entry_id as id, user_id as "userId", project_id as "projectId",
                       task_id as "taskId", hours, entry_date as "entryDate", note`,
            [req.user.userId, projectId || null, taskId || null, hours, entryDate, note || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Errore create time entry:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const result = await pool.query(
            'DELETE FROM time_entries WHERE entry_id = $1 AND user_id = $2 RETURNING entry_id',
            [req.params.id, req.user.userId]
        );
        if (!result.rows.length) return res.status(404).json({ error: 'Entry non trovata' });
        res.json({ message: 'Entry eliminata' });
    } catch (error) {
        console.error('Errore delete time entry:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

export default router;
