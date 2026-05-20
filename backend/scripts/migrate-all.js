import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../database/connection.js';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.join(__dirname, '../database');

const ORDERED_FILES = [
    'schema.sql',
    'schema_v2.sql',
    'migration_add_version_optimistic_locking.sql',
    'migration_add_last_seen.sql',
    'migration_tasks_and_assignments.sql',
    'migration_advanced_events.sql',
    'migration_event_reports_and_polls.sql',
    'migration_poll_heatmap_mode.sql',
    'migration_hr_recruiting.sql',
];

async function runFile(filePath) {
    const sql = fs.readFileSync(filePath, 'utf8');
    console.log(`→ ${path.basename(filePath)}`);
    await pool.query(sql);
}

async function migrateAll() {
    try {
        console.log('Migrazione database (pipeline unificata)…');
        for (const name of ORDERED_FILES) {
            const full = path.join(migrationsDir, name);
            if (!fs.existsSync(full)) {
                console.warn(`  Saltato (mancante): ${name}`);
                continue;
            }
            await runFile(full);
        }
        console.log('Migrazione completata.');
        process.exit(0);
    } catch (err) {
        console.error('Errore migrazione:', err.message);
        process.exit(1);
    }
}

migrateAll();
