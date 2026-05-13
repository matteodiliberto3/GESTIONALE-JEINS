import 'dotenv/config';

const url = process.env.DATABASE_URL || '';

// Render Postgres (e in genere ogni Postgres remoto/cloud) richiede SSL.
// Lo abilitiamo se la URL non è localhost / 127.0.0.1, oppure forziamo via env.
const isLocal = /@(localhost|127\.0\.0\.1)\b/i.test(url);
const useSSL = !isLocal || process.env.PGSSL === 'require' || process.env.NODE_ENV === 'production';

/** @type {import('drizzle-kit').Config} */
export default {
    schema: './database/schema.js',
    out:    './database/drizzle',
    dialect: 'postgresql',
    dbCredentials: {
        url,
        ssl: useSSL ? { rejectUnauthorized: false } : false,
    },
    verbose: true,
    strict:  true,
};
