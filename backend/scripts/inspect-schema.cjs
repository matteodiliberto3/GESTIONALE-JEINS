require('dotenv').config();
const { Client } = require('pg');

async function main() {
    const c = new Client({ connectionString: process.env.DATABASE_URL });
    await c.connect();
    const tables = ['users', 'events', 'event_participants', 'participants', 'clients'];
    for (const t of tables) {
        const r = await c.query(
            "SELECT column_name FROM information_schema.columns WHERE table_name = $1 ORDER BY ordinal_position",
            [t],
        );
        console.log(`\n[${t}]`);
        console.log(r.rows.map(x => x.column_name).join(', ') || '(no columns/table not found)');
    }
    await c.end();
}

main().catch(e => { console.error(e); process.exit(1); });
