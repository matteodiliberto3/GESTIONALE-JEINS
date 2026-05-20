import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../database/connection.js';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Bootstrap iniziale (solo nuovi ambienti).
 * Per aggiornamenti usare: npm run migrate:sql
 * Seed admin: solo se SEED_ADMIN=true (mai in produzione di default).
 */
async function migrate() {
    try {
        console.log('🔄 Bootstrap schema.sql (nuovo database)...');

        const schemaPath = path.join(__dirname, '../database/schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        await pool.query(schema);

        console.log('✅ Schema base applicato.');
        console.log('➡️  Esegui poi: npm run migrate:sql');

        const seedAdmin = process.env.SEED_ADMIN === 'true';
        if (!seedAdmin) {
            console.log('ℹ️  Seed admin disabilitato (imposta SEED_ADMIN=true solo in dev locale).');
            process.exit(0);
        }

        const bcrypt = await import('bcrypt');
        const defaultEmail = process.env.SEED_ADMIN_EMAIL || 'admin@gestionale.it';
        const defaultPassword = process.env.SEED_ADMIN_PASSWORD;

        if (!defaultPassword) {
            console.error('❌ SEED_ADMIN=true richiede SEED_ADMIN_PASSWORD in .env');
            process.exit(1);
        }

        const existingUser = await pool.query(
            'SELECT user_id FROM users WHERE email = $1',
            [defaultEmail],
        );

        if (existingUser.rows.length === 0) {
            const passwordHash = await bcrypt.default.hash(defaultPassword, 10);
            await pool.query(
                `INSERT INTO users (name, email, password_hash, role, area)
                 VALUES ($1, $2, $3, $4, $5)`,
                ['Admin', defaultEmail, passwordHash, 'Admin', 'CDA'],
            );
            console.log(`👤 Utente admin creato: ${defaultEmail}`);
        } else {
            console.log('ℹ️  Utente admin già esistente.');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Errore durante la migrazione:', error);
        process.exit(1);
    }
}

migrate();
