import express from 'express';
import pool from '../database/connection.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireNotSocio } from '../middleware/authorize.js';

const router = express.Router();
router.use(authenticateToken);
router.use(requireNotSocio);

// GET /api/chats - elenco chat dell'utente con ultimo messaggio
router.get('/chats', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT c.chat_id as id, c.project_id as "projectId", c.name, c.is_group as "isGroup",
                    c.updated_at as "updatedAt",
                    (SELECT json_build_object(
                        'id', m.message_id,
                        'body', m.body,
                        'senderId', m.sender_id,
                        'senderName', u.name,
                        'createdAt', m.created_at
                     )
                     FROM messages m
                     LEFT JOIN users u ON u.user_id = m.sender_id
                     WHERE m.chat_id = c.chat_id
                     ORDER BY m.created_at DESC LIMIT 1) as "lastMessage"
             FROM chats c
             JOIN chat_members cm ON cm.chat_id = c.chat_id
             WHERE cm.user_id = $1
             ORDER BY c.updated_at DESC`,
            [req.user.userId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Errore get chats:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

// GET /api/chats/:id/messages
router.get('/chats/:id/messages', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT m.message_id as id, m.chat_id as "chatId", m.sender_id as "senderId",
                    m.body, m.created_at as "createdAt",
                    u.name as "senderName", u.avatar_url as "senderAvatar",
                    u.handle as "senderHandle", u.color as "senderColor"
             FROM messages m
             LEFT JOIN users u ON u.user_id = m.sender_id
             WHERE m.chat_id = $1
             ORDER BY m.created_at ASC`,
            [req.params.id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Errore get messages:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

// POST /api/chats/:id/messages
router.post('/chats/:id/messages', async (req, res) => {
    try {
        const { body } = req.body;
        if (!body) return res.status(400).json({ error: 'body obbligatorio' });
        const result = await pool.query(
            `INSERT INTO messages (chat_id, sender_id, body)
             VALUES ($1,$2,$3)
             RETURNING message_id as id, chat_id as "chatId", sender_id as "senderId",
                       body, created_at as "createdAt"`,
            [req.params.id, req.user.userId, body]
        );
        await pool.query('UPDATE chats SET updated_at = CURRENT_TIMESTAMP WHERE chat_id = $1', [req.params.id]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Errore send message:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

// POST /api/chats - crea nuova chat
router.post('/chats', async (req, res) => {
    try {
        const { name, projectId, memberIds = [] } = req.body;
        const result = await pool.query(
            `INSERT INTO chats (name, project_id, is_group)
             VALUES ($1,$2,$3)
             RETURNING chat_id as id, name, project_id as "projectId", is_group as "isGroup"`,
            [name || null, projectId || null, memberIds.length !== 1]
        );
        const chat = result.rows[0];

        const allMembers = Array.from(new Set([req.user.userId, ...memberIds]));
        const values = allMembers.map((_, i) => `($1, $${i + 2})`).join(',');
        await pool.query(
            `INSERT INTO chat_members (chat_id, user_id) VALUES ${values}
             ON CONFLICT DO NOTHING`,
            [chat.id, ...allMembers]
        );

        res.status(201).json(chat);
    } catch (error) {
        console.error('Errore create chat:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

export default router;
