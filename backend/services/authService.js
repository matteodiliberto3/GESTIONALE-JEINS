import bcrypt from 'bcrypt';
import pool from '../database/connection.js';
import { resolveRegistrationRole } from '../lib/registrationRoles.js';
import { AppError } from '../lib/AppError.js';
import { issueAccessToken, issueRefreshToken } from '../lib/tokens.js';
import { getPermissionsForUser } from '../lib/permissions.js';

export async function registerUser({ name, email, password, area, managerCode }) {
    const roleResult = await resolveRegistrationRole(managerCode);
    if (roleResult.error) {
        throw new AppError(roleResult.error, roleResult.status);
    }

    const existing = await pool.query('SELECT user_id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
        throw new AppError('Email già registrata', 400);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const assignedRole = roleResult.role;
    const registrationArea = area || (assignedRole === 'CDA' ? 'CDA' : null);

    const result = await pool.query(
        `INSERT INTO users (name, email, password_hash, area, role)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING user_id, name, email, area, role`,
        [name, email, passwordHash, registrationArea, assignedRole],
    );

    return result.rows[0];
}

export async function loginUser({ email, password }) {
    const result = await pool.query(
        `SELECT user_id, name, email, password_hash, area, role, is_active
         FROM users WHERE email = $1`,
        [email],
    );

    if (!result.rows.length) {
        throw new AppError('Credenziali non valide', 401);
    }

    const user = result.rows[0];
    if (user.is_active === false) {
        throw new AppError('Account disattivato', 401);
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
        throw new AppError('Credenziali non valide', 401);
    }

    return user;
}

/** @deprecated Usare issueAccessToken + issueRefreshToken */
export function issueToken(user) {
    return issueAccessToken(user);
}

export { issueAccessToken, issueRefreshToken };

export function toPublicUser(user) {
    const publicUser = {
        id: user.user_id,
        name: user.name,
        email: user.email,
        area: user.area,
        role: user.role,
    };
    publicUser.permissions = getPermissionsForUser(publicUser);
    return publicUser;
}
