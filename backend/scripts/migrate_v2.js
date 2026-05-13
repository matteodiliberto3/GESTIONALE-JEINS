import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../database/connection.js';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrateV2() {
    try {
        console.log('🔄 Avvio migrazione v2 (board / sprint / activity / chat)...');

        const schemaV2Path = path.join(__dirname, '../database/schema_v2.sql');
        const schemaV2 = fs.readFileSync(schemaV2Path, 'utf8');

        await pool.query(schemaV2);
        console.log('✅ Schema v2 applicato.');

        process.exit(0);
    } catch (error) {
        console.error('❌ Errore durante la migrazione v2:', error);
        process.exit(1);
    }
}

migrateV2();
