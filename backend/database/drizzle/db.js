import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema.js';

const { Pool } = pg;

function poolOptions() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        throw new Error('DATABASE_URL non configurato');
    }
    const useSsl =
        process.env.DRIZZLE_SSL !== 'false' &&
        (process.env.NODE_ENV === 'production' || connectionString.includes('render.com'));
    return {
        connectionString,
        ssl: useSsl ? { rejectUnauthorized: false } : false,
    };
}

let pool;
let db;

export function getDb() {
    if (!db) {
        pool = new Pool(poolOptions());
        db = drizzle(pool, { schema });
    }
    return db;
}

export async function closeDb() {
    if (pool) {
        await pool.end();
        pool = undefined;
        db = undefined;
    }
}
