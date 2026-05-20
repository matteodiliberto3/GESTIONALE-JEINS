import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Verifica che DATABASE_URL sia configurato
if (!process.env.DATABASE_URL) {
    console.error('❌ ERRORE: DATABASE_URL non è configurato!');
    console.error('Configura la variabile d\'ambiente DATABASE_URL nel file .env o su Render');
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const isTest = process.env.NODE_ENV === 'test';

pool.on('connect', () => {
    if (!isTest) console.log('✅ Connesso al database PostgreSQL');
});

pool.on('error', (err) => {
    console.error('❌ Errore database:', err);
});

if (!isTest) {
    pool.query('SELECT NOW()')
        .then(() => console.log('✅ Test connessione database riuscito'))
        .catch((err) => {
            console.error('❌ ERRORE: Impossibile connettersi al database!');
            console.error('Errore:', err.message);
        });
}

export default pool;

