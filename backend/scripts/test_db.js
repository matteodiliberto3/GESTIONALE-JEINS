import 'dotenv/config';
import pg from 'pg';

const { Client } = pg;

const url = process.env.DATABASE_URL || '';
console.log('Raw URL:', url.replace(/:[^:@]+@/, ':***@'));

// Parsing manuale per gestire correttamente caratteri speciali nella password
function parsePgUrl(u) {
    const m = /^postgres(?:ql)?:\/\/([^:]+):(.+)@([^:/]+)(?::(\d+))?\/(.+?)(?:\?.*)?$/.exec(u);
    if (!m) throw new Error('URL non valida');
    return {
        user:     decodeURIComponent(m[1]),
        password: decodeURIComponent(m[2]),
        host:     m[3],
        port:     parseInt(m[4] || '5432', 10),
        database: m[5],
    };
}

const cfg = { ...parsePgUrl(url), ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 15000 };
console.log('Parsed:', { user: cfg.user, host: cfg.host, port: cfg.port, db: cfg.database, passwordLen: cfg.password.length });

const client = new Client(cfg);

try {
    await client.connect();
    console.log('✅ Connected.');
    const r = await client.query('SELECT current_database() AS db, current_user AS "user", version() AS version');
    console.log('DB info:', r.rows[0]);
    const t = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name");
    console.log('Existing public tables (' + t.rows.length + '):', t.rows.map(x => x.table_name));
    await client.end();
    process.exit(0);
} catch (err) {
    console.error('❌ Connection error:', err.code || '', err.message);
    process.exit(1);
}
