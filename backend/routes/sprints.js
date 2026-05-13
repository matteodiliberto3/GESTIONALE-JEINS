import express from 'express';
import pool from '../database/connection.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticateToken);

router.get('/', async (req, res) => {
    try {
        const { projectId, status } = req.query;
        const conditions = [];
        const params = [];
        if (projectId) { params.push(projectId); conditions.push(`project_id = $${params.length}`); }
        if (status)    { params.push(status);    conditions.push(`status = $${params.length}`); }
        const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

        const result = await pool.query(
            `SELECT sprint_id as id, project_id as "projectId", name, goal,
                    start_date as "startDate", end_date as "endDate",
                    target_points as "targetPoints", completed_points as "completedPoints",
                    status, created_at as "createdAt"
             FROM sprints ${where}
             ORDER BY start_date DESC`,
            params
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Errore get sprints:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

router.get('/active', async (req, res) => {
    try {
        const { projectId } = req.query;
        const params = [];
        let where = `WHERE status = 'active'`;
        if (projectId) { params.push(projectId); where += ` AND project_id = $${params.length}`; }

        const result = await pool.query(
            `SELECT sprint_id as id, project_id as "projectId", name, goal,
                    start_date as "startDate", end_date as "endDate",
                    target_points as "targetPoints", completed_points as "completedPoints",
                    status
             FROM sprints ${where}
             ORDER BY start_date DESC LIMIT 1`,
            params
        );
        res.json(result.rows[0] || null);
    } catch (error) {
        console.error('Errore active sprint:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { projectId, name, goal, startDate, endDate, targetPoints, status } = req.body;
        if (!name || !startDate || !endDate) {
            return res.status(400).json({ error: 'name, startDate, endDate obbligatori' });
        }
        const result = await pool.query(
            `INSERT INTO sprints (project_id, name, goal, start_date, end_date, target_points, status)
             VALUES ($1,$2,$3,$4,$5,$6,$7)
             RETURNING sprint_id as id, project_id as "projectId", name, goal,
                       start_date as "startDate", end_date as "endDate",
                       target_points as "targetPoints", completed_points as "completedPoints",
                       status`,
            [projectId || null, name, goal || null, startDate, endDate, targetPoints || 0, status || 'planned']
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Errore create sprint:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { name, goal, startDate, endDate, targetPoints, completedPoints, status } = req.body;
        const result = await pool.query(
            `UPDATE sprints SET
                name             = COALESCE($1, name),
                goal             = COALESCE($2, goal),
                start_date       = COALESCE($3, start_date),
                end_date         = COALESCE($4, end_date),
                target_points    = COALESCE($5, target_points),
                completed_points = COALESCE($6, completed_points),
                status           = COALESCE($7, status),
                updated_at       = CURRENT_TIMESTAMP
             WHERE sprint_id = $8
             RETURNING sprint_id as id, project_id as "projectId", name, goal,
                       start_date as "startDate", end_date as "endDate",
                       target_points as "targetPoints", completed_points as "completedPoints",
                       status`,
            [name, goal, startDate, endDate, targetPoints, completedPoints, status, req.params.id]
        );
        if (!result.rows.length) return res.status(404).json({ error: 'Sprint non trovato' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Errore update sprint:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM sprints WHERE sprint_id = $1 RETURNING sprint_id', [req.params.id]);
        if (!result.rows.length) return res.status(404).json({ error: 'Sprint non trovato' });
        res.json({ message: 'Sprint eliminato' });
    } catch (error) {
        console.error('Errore delete sprint:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

export default router;
