import pool from '../database/connection.js';

/** Utente assegnato al progetto (tabella project_assignments). */
export async function isUserAssignedToProject(userId, projectId) {
    const check = await pool.query(
        `SELECT EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = 'project_assignments'
        ) AS exists`,
    );
    if (!check.rows[0]?.exists) return false;

    const result = await pool.query(
        `SELECT 1 FROM project_assignments
         WHERE user_id = $1 AND project_id = $2`,
        [userId, projectId],
    );
    return result.rows.length > 0;
}
