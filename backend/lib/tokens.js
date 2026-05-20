import jwt from 'jsonwebtoken';
import { AppError } from './AppError.js';

function secret() {
    if (!process.env.JWT_SECRET) {
        throw new AppError('Errore di configurazione del server', 500);
    }
    return process.env.JWT_SECRET;
}

export function issueAccessToken(user) {
    return jwt.sign(
        { userId: user.user_id, email: user.email, role: user.role, type: 'access' },
        secret(),
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRES || '15m' },
    );
}

export function issueRefreshToken(user) {
    return jwt.sign(
        { userId: user.user_id, email: user.email, role: user.role, type: 'refresh' },
        secret(),
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRES || '7d' },
    );
}

export function verifyAccessToken(token) {
    const decoded = jwt.verify(token, secret());
    if (decoded.type && decoded.type !== 'access') {
        throw new jwt.JsonWebTokenError('Tipo token non valido');
    }
    return decoded;
}

export function verifyRefreshToken(token) {
    const decoded = jwt.verify(token, secret());
    if (decoded.type !== 'refresh') {
        throw new jwt.JsonWebTokenError('Tipo token non valido');
    }
    return decoded;
}

/** Compat: token senza claim type (legacy) */
export function verifyAnyAccessToken(token) {
    const decoded = jwt.verify(token, secret());
    if (decoded.type === 'refresh') {
        throw new jwt.JsonWebTokenError('Refresh token non ammesso');
    }
    return decoded;
}
