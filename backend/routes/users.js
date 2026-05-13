import express from 'express';
import pool from '../database/connection.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticateToken);

// GET /api/users - Lista utenti (con avatar/handle/color per UI team)
router.get('/', async (req, res) => {
    try {
        const query = req.user.role === 'Admin'
            ? `SELECT user_id as id, name, email, area, role,
                      avatar_url as "avatarUrl", handle, color,
                      created_at as "createdAt"
               FROM users ORDER BY name ASC`
            : `SELECT user_id as id, name, area, role,
                      avatar_url as "avatarUrl", handle, color
               FROM users ORDER BY name ASC`;

        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Errore recupero utenti:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

// GET /api/users/me - utente corrente con tutti i campi UI
router.get('/me', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT user_id as id, name, email, area, role,
                    avatar_url as "avatarUrl", handle, color,
                    created_at as "createdAt"
             FROM users WHERE user_id = $1`,
            [req.user.userId]
        );
        if (!result.rows.length) return res.status(404).json({ error: 'Utente non trovato' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Errore /me:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

// PATCH /api/users/me - aggiorna profilo utente corrente (avatar/handle/color)
router.patch('/me', async (req, res) => {
    try {
        const { name, avatarUrl, handle, color } = req.body;
        const result = await pool.query(
            `UPDATE users SET
                name       = COALESCE($1, name),
                avatar_url = COALESCE($2, avatar_url),
                handle     = COALESCE($3, handle),
                color      = COALESCE($4, color),
                updated_at = CURRENT_TIMESTAMP
             WHERE user_id = $5
             RETURNING user_id as id, name, email, area, role,
                       avatar_url as "avatarUrl", handle, color`,
            [name, avatarUrl, handle, color, req.user.userId]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Errore patch /me:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

// GET /api/users/:id - Dettaglio utente
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (id !== req.user.userId && req.user.role !== 'Admin') {
            return res.status(403).json({ error: 'Non hai i permessi per vedere questi dati' });
        }
        const result = await pool.query(
            `SELECT user_id as id, name, email, area, role,
                    avatar_url as "avatarUrl", handle, color,
                    created_at as "createdAt"
             FROM users WHERE user_id = $1`,
            [id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Utente non trovato' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Errore recupero utente:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

export default router;
