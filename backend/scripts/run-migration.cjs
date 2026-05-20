require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function main() {
    const file = process.argv[2];
    if (!file) {
        console.error('Usage: node run-migration.cjs <relative-sql-path>');
        process.exit(1);
    }
    const sql = fs.readFileSync(path.resolve(__dirname, '..', file), 'utf8');
    const c = new Client({ connectionString: process.env.DATABASE_URL });
    await c.connect();
    try {
        await c.query('BEGIN');
        await c.query(sql);
        await c.query('COMMIT');
        console.log('Migration applied:', file);
    } catch (e) {
        await c.query('ROLLBACK');
        console.error('Migration failed:', e.message);
        process.exit(1);
    } finally {
        await c.end();
    }
}

main();
