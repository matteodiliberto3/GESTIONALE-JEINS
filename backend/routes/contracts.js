import express from 'express';
import pool from '../database/connection.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireContractWrite } from '../middleware/authorize.js';
import { canAccessBilling } from '../lib/roles.js';

const router = express.Router();
router.use(authenticateToken);

function requireContractRead(req, res, next) {
    if (!canAccessBilling(req.user)) {
        return res.status(403).json({ error: 'Non hai accesso ai contratti e alle fatture' });
    }
    next();
}

router.use(requireContractRead);

// GET /api/contracts - Lista contratti
router.get('/', async (req, res, next) => {
    try {
        const result = await pool.query(
            `SELECT c.contract_id as id, c.type, c.amount, c.status, c.date,
                    c.client_id as "clientId", c.project_id as "projectId",
                    cl.name as "clientName", p.name as "projectName",
                    c.created_at as "createdAt", c.version
             FROM contracts c
             LEFT JOIN clients cl ON c.client_id = cl.client_id
             LEFT JOIN projects p ON c.project_id = p.project_id
             ORDER BY c.date DESC, c.created_at DESC`,
        );
        res.json(result.rows);
    } catch (error) {
        next(error);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `SELECT c.contract_id as id, c.type, c.amount, c.status, c.date,
                    c.client_id as "clientId", c.project_id as "projectId",
                    cl.name as "clientName", p.name as "projectName",
                    c.created_at as "createdAt", c.version
             FROM contracts c
             LEFT JOIN clients cl ON c.client_id = cl.client_id
             LEFT JOIN projects p ON c.project_id = p.project_id
             WHERE c.contract_id = $1`,
            [id],
        );

        if (!result.rows.length) {
            return res.status(404).json({ error: 'Contratto non trovato' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        next(error);
    }
});

router.post('/', requireContractWrite, async (req, res, next) => {
    try {
        const { type, clientId, projectId, amount, status, date } = req.body;

        if (!type || !clientId || !amount || !date) {
            return res.status(400).json({ error: 'Tipo, cliente, importo e data sono obbligatori' });
        }

        const result = await pool.query(
            `INSERT INTO contracts (type, client_id, project_id, amount, status, date, created_by)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING contract_id as id, type, client_id as "clientId",
                       project_id as "projectId", amount, status, date, created_at as "createdAt", version`,
            [type, clientId, projectId || null, amount, status || 'Bozza', date, req.user.userId],
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
});

router.put('/:id', requireContractWrite, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { type, clientId, projectId, amount, status, date, expectedVersion } = req.body;

        if (expectedVersion !== undefined) {
            const currentCheck = await pool.query(
                'SELECT version FROM contracts WHERE contract_id = $1',
                [id],
            );

            if (!currentCheck.rows.length) {
                return res.status(404).json({ error: 'Contratto non trovato' });
            }

            const currentVersion = currentCheck.rows[0].version;
            if (currentVersion !== expectedVersion) {
                const serverData = await pool.query(
                    `SELECT contract_id as id, type, client_id as "clientId",
                            project_id as "projectId", amount, status, date, version,
                            created_at as "createdAt"
                     FROM contracts WHERE contract_id = $1`,
                    [id],
                );

                return res.status(409).json({
                    error: 'CONCURRENT_MODIFICATION',
                    message: 'Il contratto è stato modificato da un altro utente.',
                    currentVersion,
                    expectedVersion,
                    serverData: serverData.rows[0],
                });
            }
        }

        const result = await pool.query(
            `UPDATE contracts
             SET type = COALESCE($1, type),
                 client_id = COALESCE($2, client_id),
                 project_id = COALESCE($3, project_id),
                 amount = COALESCE($4, amount),
                 status = COALESCE($5, status),
                 date = COALESCE($6, date),
                 updated_at = CURRENT_TIMESTAMP
             WHERE contract_id = $7
             RETURNING contract_id as id, type, client_id as "clientId",
                       project_id as "projectId", amount, status, date, version,
                       created_at as "createdAt"`,
            [type, clientId, projectId, amount, status, date, id],
        );

        if (!result.rows.length) {
            return res.status(404).json({ error: 'Contratto non trovato' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        next(error);
    }
});

router.patch('/:id/status', requireContractWrite, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ error: 'Stato richiesto' });
        }

        const result = await pool.query(
            `UPDATE contracts SET status = $1, updated_at = CURRENT_TIMESTAMP
             WHERE contract_id = $2
             RETURNING contract_id as id, type, amount, status, date, version`,
            [status, id],
        );

        if (!result.rows.length) {
            return res.status(404).json({ error: 'Contratto non trovato' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', requireContractWrite, async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM contracts WHERE contract_id = $1 RETURNING contract_id',
            [id],
        );

        if (!result.rows.length) {
            return res.status(404).json({ error: 'Contratto non trovato' });
        }

        res.json({ message: 'Contratto eliminato con successo' });
    } catch (error) {
        next(error);
    }
});

export default router;
