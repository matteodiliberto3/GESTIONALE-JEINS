import express from 'express';
import pool from '../database/connection.js';
import bcrypt from 'bcrypt';
import { authenticateToken } from '../middleware/auth.js';
import { requireRoles } from '../middleware/authorize.js';
import { isPrivileged as roleIsPrivileged } from '../lib/roles.js';
import { getPermissionsForUser } from '../lib/permissions.js';

const router = express.Router();
router.use(authenticateToken);

const isAdminOrIT = requireRoles('Admin', 'IT', 'Responsabile');

router.get('/', async (req, res) => {
    try {
        const query = roleIsPrivileged(req.user.role)
            ? `SELECT user_id as id, name, email, area, role, is_active as "isActive",
                      avatar_url as "avatarUrl", handle, color, last_seen as "lastSeen",
                      created_at as "createdAt"
               FROM users ORDER BY name ASC`
            : `SELECT user_id as id, name, area, role,
                      avatar_url as "avatarUrl", handle, color
               FROM users WHERE is_active = TRUE ORDER BY name ASC`;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Errore recupero utenti:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

router.get('/me', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT user_id as id, name, email, area, role,
                    avatar_url as "avatarUrl", handle, color,
                    created_at as "createdAt"
             FROM users WHERE user_id = $1`,
            [req.user.userId],
        );
        if (!result.rows.length) return res.status(404).json({ error: 'Utente non trovato' });
        const row = result.rows[0];
        res.json({ ...row, permissions: getPermissionsForUser(row) });
    } catch (error) {
        console.error('Errore /me:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

router.patch('/me', async (req, res) => {
    try {
        const { name, avatarUrl, handle, color } = req.body;
        const result = await pool.query(
            `UPDATE users SET
                name = COALESCE($1, name),
                avatar_url = COALESCE($2, avatar_url),
                handle = COALESCE($3, handle),
                color = COALESCE($4, color),
                updated_at = CURRENT_TIMESTAMP
             WHERE user_id = $5
             RETURNING user_id as id, name, email, area, role,
                       avatar_url as "avatarUrl", handle, color`,
            [name, avatarUrl, handle, color, req.user.userId],
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Errore patch /me:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

router.get('/online', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT user_id as id, name, email, area, role, last_seen as "lastSeen"
             FROM users
             WHERE last_seen > NOW() - INTERVAL '5 minutes'
             ORDER BY last_seen DESC`,
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Errore recupero utenti online:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

router.post('/', isAdminOrIT, async (req, res) => {
    try {
        const { name, email, password, area, role } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Nome, email e password sono obbligatori' });
        }
        const existingUser = await pool.query('SELECT user_id FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'Email già registrata' });
        }
        const passwordHash = await bcrypt.hash(password, 10);
        const result = await pool.query(
            `INSERT INTO users (name, email, password_hash, area, role, is_active)
             VALUES ($1, $2, $3, $4, $5, TRUE)
             RETURNING user_id as id, name, email, area, role, is_active as "isActive", created_at as "createdAt"`,
            [name, email, passwordHash, area || null, role || 'Socio'],
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Errore creazione utente:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

router.put('/:id', isAdminOrIT, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, area, role } = req.body;
        const result = await pool.query(
            `UPDATE users SET
                name = COALESCE($1, name),
                email = COALESCE($2, email),
                area = COALESCE($3, area),
                role = COALESCE($4, role),
                updated_at = CURRENT_TIMESTAMP
             WHERE user_id = $5
             RETURNING user_id as id, name, email, area, role, is_active as "isActive", created_at as "createdAt"`,
            [name, email, area, role, id],
        );
        if (!result.rows.length) return res.status(404).json({ error: 'Utente non trovato' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Errore modifica utente:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

router.patch('/:id/reset-password', isAdminOrIT, async (req, res) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ error: 'Password deve avere almeno 6 caratteri' });
        }
        const passwordHash = await bcrypt.hash(newPassword, 10);
        const result = await pool.query(
            `UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
             WHERE user_id = $2 RETURNING user_id as id, name, email`,
            [passwordHash, id],
        );
        if (!result.rows.length) return res.status(404).json({ error: 'Utente non trovato' });
        res.json({ message: 'Password reimpostata con successo' });
    } catch (error) {
        console.error('Errore reset password:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

router.patch('/:id/status', isAdminOrIT, async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;
        if (isActive === undefined) {
            return res.status(400).json({ error: 'isActive è richiesto' });
        }
        if (id === req.user.userId && !isActive) {
            return res.status(400).json({ error: 'Non puoi disattivare il tuo stesso account' });
        }
        const result = await pool.query(
            `UPDATE users SET is_active = $1, updated_at = CURRENT_TIMESTAMP
             WHERE user_id = $2 RETURNING user_id as id, name, email, is_active as "isActive"`,
            [isActive, id],
        );
        if (!result.rows.length) return res.status(404).json({ error: 'Utente non trovato' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Errore modifica stato utente:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (id !== req.user.userId && !roleIsPrivileged(req.user.role)) {
            return res.status(403).json({ error: 'Non hai i permessi per vedere questi dati' });
        }
        const result = await pool.query(
            `SELECT user_id as id, name, email, area, role, is_active as "isActive",
                    avatar_url as "avatarUrl", handle, color, last_seen as "lastSeen",
                    created_at as "createdAt"
             FROM users WHERE user_id = $1`,
            [id],
        );
        if (!result.rows.length) return res.status(404).json({ error: 'Utente non trovato' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Errore recupero utente:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

export default router;
