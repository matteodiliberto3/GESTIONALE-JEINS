import express from 'express';
import pool from '../database/connection.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticateToken);

router.get('/', async (req, res) => {
    try {
        const { projectId, limit } = req.query;
        const params = [];
        let where = '';
        if (projectId) { params.push(projectId); where = `WHERE a.project_id = $${params.length}`; }
        params.push(parseInt(limit) || 30);

        const result = await pool.query(
            `SELECT a.activity_id as id, a.actor_id as "actorId", a.type,
                    a.target_type as "targetType", a.target_id as "targetId",
                    a.project_id as "projectId", a.payload, a.created_at as "createdAt",
                    u.name as "actorName", u.avatar_url as "actorAvatar",
                    u.handle as "actorHandle", u.color as "actorColor"
             FROM activities a
             LEFT JOIN users u ON u.user_id = a.actor_id
             ${where}
             ORDER BY a.created_at DESC
             LIMIT $${params.length}`,
            params
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Errore get activities:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { type, targetType, targetId, projectId, payload } = req.body;
        if (!type) return res.status(400).json({ error: 'type obbligatorio' });
        const result = await pool.query(
            `INSERT INTO activities (actor_id, type, target_type, target_id, project_id, payload)
             VALUES ($1,$2,$3,$4,$5,$6::jsonb)
             RETURNING activity_id as id, actor_id as "actorId", type,
                       target_type as "targetType", target_id as "targetId",
                       project_id as "projectId", payload, created_at as "createdAt"`,
            [req.user.userId, type, targetType || null, targetId || null,
             projectId || null, JSON.stringify(payload || {})]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Errore create activity:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

export default router;
