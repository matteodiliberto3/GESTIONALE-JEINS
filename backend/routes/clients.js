import express from 'express';
import pool from '../database/connection.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireClientWrite, requireNotSocio } from '../middleware/authorize.js';
import { isPrivileged, canAccessClientInArea } from '../lib/roles.js';
import { parsePagination, buildPaginatedResult, sqlLimitOffset } from '../lib/pagination.js';
import { AppError } from '../lib/AppError.js';

const router = express.Router();
router.use(authenticateToken);

router.get('/', requireNotSocio, async (req, res, next) => {
    try {
        const paginated = req.query.limit !== undefined || req.query.cursor !== undefined;
        const { limit, offset } = parsePagination(req.query);
        const params = [];
        let where = '';

        if (!isPrivileged(req.user.role)) {
            params.push(req.user.area);
            where = ' WHERE area = $1 OR area IS NULL';
        }

        const limitClause = paginated ? sqlLimitOffset(limit, offset) : '';

        const result = await pool.query(
            `SELECT client_id as id, name, contact_person as "contactPerson",
                    email, phone, status, area, created_at as "createdAt", version
             FROM clients${where}
             ORDER BY created_at DESC${limitClause}`,
            params,
        );

        if (!paginated) {
            return res.json(result.rows);
        }

        const { items, pagination } = buildPaginatedResult(result.rows, { limit, offset });
        res.json({ items, pagination });
    } catch (error) {
        next(error);
    }
});

router.get('/:id', requireNotSocio, async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `SELECT client_id as id, name, contact_person as "contactPerson",
                    email, phone, status, area, created_at as "createdAt", version
             FROM clients WHERE client_id = $1`,
            [id],
        );

        if (!result.rows.length) {
            return res.status(404).json({ error: 'Cliente non trovato' });
        }

        const client = result.rows[0];
        if (!canAccessClientInArea(req.user, client.area)) {
            return res.status(403).json({ error: 'Accesso negato a questo cliente' });
        }

        res.json(client);
    } catch (error) {
        next(error);
    }
});

router.post('/', requireClientWrite, async (req, res, next) => {
    try {
        const { name, contactPerson, email, phone, status, area } = req.body;

        if (!name || !name.trim()) {
            throw new AppError('Il nome del cliente è obbligatorio', 400);
        }

        const clientArea = area || req.user.area || null;

        const result = await pool.query(
            `INSERT INTO clients (name, contact_person, email, phone, status, area, created_by)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING client_id as id, name, contact_person as "contactPerson",
                       email, phone, status, area, created_at as "createdAt", version`,
            [
                name.trim(),
                contactPerson || null,
                email || null,
                phone || null,
                status || 'Prospect',
                clientArea,
                req.user.userId,
            ],
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
});

router.put('/:id', requireClientWrite, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, contactPerson, email, phone, status, area, expectedVersion } = req.body;

        const existing = await pool.query('SELECT area, version FROM clients WHERE client_id = $1', [id]);
        if (!existing.rows.length) {
            return res.status(404).json({ error: 'Cliente non trovato' });
        }
        if (!canAccessClientInArea(req.user, existing.rows[0].area)) {
            return res.status(403).json({ error: 'Accesso negato' });
        }

        if (expectedVersion !== undefined) {
            const currentVersion = existing.rows[0].version;
            if (currentVersion !== expectedVersion) {
                const serverData = await pool.query(
                    `SELECT client_id as id, name, contact_person as "contactPerson",
                            email, phone, status, area, version, created_at as "createdAt"
                     FROM clients WHERE client_id = $1`,
                    [id],
                );
                return res.status(409).json({
                    error: 'CONCURRENT_MODIFICATION',
                    message: 'Il cliente è stato modificato da un altro utente.',
                    currentVersion,
                    expectedVersion,
                    serverData: serverData.rows[0],
                });
            }
        }

        const result = await pool.query(
            `UPDATE clients
             SET name = COALESCE($1, name),
                 contact_person = COALESCE($2, contact_person),
                 email = COALESCE($3, email),
                 phone = COALESCE($4, phone),
                 status = COALESCE($5, status),
                 area = COALESCE($6, area),
                 updated_at = CURRENT_TIMESTAMP
             WHERE client_id = $7
             RETURNING client_id as id, name, contact_person as "contactPerson",
                       email, phone, status, area, version, created_at as "createdAt"`,
            [name, contactPerson, email, phone, status, area, id],
        );

        res.json(result.rows[0]);
    } catch (error) {
        next(error);
    }
});

router.patch('/:id/status', requireClientWrite, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) throw new AppError('Stato richiesto', 400);

        const existing = await pool.query('SELECT area FROM clients WHERE client_id = $1', [id]);
        if (!existing.rows.length) return res.status(404).json({ error: 'Cliente non trovato' });
        if (!canAccessClientInArea(req.user, existing.rows[0].area)) {
            return res.status(403).json({ error: 'Accesso negato' });
        }

        const result = await pool.query(
            `UPDATE clients SET status = $1, updated_at = CURRENT_TIMESTAMP
             WHERE client_id = $2
             RETURNING client_id as id, name, contact_person as "contactPerson",
                       email, phone, status, area, created_at as "createdAt", version`,
            [status, id],
        );

        res.json(result.rows[0]);
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', requireClientWrite, async (req, res, next) => {
    try {
        const { id } = req.params;

        const existing = await pool.query('SELECT area FROM clients WHERE client_id = $1', [id]);
        if (!existing.rows.length) return res.status(404).json({ error: 'Cliente non trovato' });
        if (!canAccessClientInArea(req.user, existing.rows[0].area)) {
            return res.status(403).json({ error: 'Accesso negato' });
        }

        await pool.query('DELETE FROM clients WHERE client_id = $1', [id]);
        res.json({ message: 'Cliente eliminato con successo' });
    } catch (error) {
        next(error);
    }
});

export default router;
