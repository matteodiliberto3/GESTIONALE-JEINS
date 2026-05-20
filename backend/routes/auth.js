import express from 'express';
import pool from '../database/connection.js';
import { loginLimiter, registerLimiter } from '../middleware/rateLimit.js';
import { validateBody, loginSchema, registerSchema } from '../validators/authSchemas.js';
import {
    registerUser,
    loginUser,
    issueAccessToken,
    issueRefreshToken,
    toPublicUser,
} from '../services/authService.js';
import { AppError } from '../lib/AppError.js';
import { setAuthCookies, clearAuthCookies, extractBearerOrCookie } from '../lib/authCookies.js';
import { verifyRefreshToken, verifyAccessToken, verifyAnyAccessToken } from '../lib/tokens.js';

const router = express.Router();
const isProd = process.env.NODE_ENV === 'production';

if (!isProd) {
    router.get('/test', (req, res) => {
        res.json({ message: 'Auth router funziona!', path: req.path });
    });
}

function sendAuthSuccess(res, user, status = 200) {
    const accessToken = issueAccessToken(user);
    const refreshToken = issueRefreshToken(user);
    setAuthCookies(res, accessToken, refreshToken);
    const body = {
        message: status === 201 ? 'Registrazione completata' : 'Login effettuato con successo',
        user: toPublicUser(user),
        token: accessToken,
    };
    if (status === 201) {
        return res.status(201).json(body);
    }
    return res.json(body);
}

router.post('/register', registerLimiter, validateBody(registerSchema), async (req, res, next) => {
    try {
        const { name, email, password, area, managerCode } = req.body;
        const user = await registerUser({ name, email, password, area, managerCode });
        sendAuthSuccess(res, user, 201);
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.status).json({ error: error.message });
        }
        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
            return res.status(500).json({ error: 'Errore di connessione al database.' });
        }
        next(error);
    }
});

router.post('/login', loginLimiter, validateBody(loginSchema), async (req, res, next) => {
    try {
        const user = await loginUser(req.body);
        if (!isProd) {
            console.log(`Login OK user=${user.user_id} role=${user.role}`);
        }
        sendAuthSuccess(res, user);
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.status).json({ error: error.message });
        }
        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
            return res.status(500).json({ error: 'Errore di connessione al database.' });
        }
        next(error);
    }
});

router.post('/refresh', async (req, res, next) => {
    try {
        const refresh = req.cookies?.refresh_token;
        if (!refresh) {
            return res.status(401).json({ error: 'Refresh token mancante' });
        }

        const decoded = verifyRefreshToken(refresh);
        const result = await pool.query(
            `SELECT user_id, name, email, area, role, is_active
             FROM users WHERE user_id = $1`,
            [decoded.userId],
        );

        if (!result.rows.length || result.rows[0].is_active === false) {
            clearAuthCookies(res);
            return res.status(401).json({ error: 'Utente non valido' });
        }

        const user = result.rows[0];
        const accessToken = issueAccessToken(user);
        setAuthCookies(res, accessToken, refresh);
        res.json({ user: toPublicUser(user), token: accessToken });
    } catch (error) {
        clearAuthCookies(res);
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Sessione scaduta, effettua di nuovo il login' });
        }
        next(error);
    }
});

router.post('/logout', (req, res) => {
    clearAuthCookies(res);
    res.json({ message: 'Logout effettuato' });
});

router.get('/verify', async (req, res, next) => {
    try {
        const token = extractBearerOrCookie(req);
        if (!token) {
            return res.status(401).json({ error: 'Token mancante' });
        }

        let decoded;
        try {
            decoded = verifyAccessToken(token);
        } catch {
            decoded = verifyAnyAccessToken(token);
        }

        const result = await pool.query(
            `SELECT user_id, name, email, area, role, is_active
             FROM users WHERE user_id = $1`,
            [decoded.userId],
        );

        if (!result.rows.length || result.rows[0].is_active === false) {
            return res.status(404).json({ error: 'Utente non trovato' });
        }

        res.json({ user: toPublicUser(result.rows[0]) });
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token non valido o scaduto' });
        }
        next(error);
    }
});

export default router;
