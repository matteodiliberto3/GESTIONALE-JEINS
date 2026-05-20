import { createApp } from './app.js';
import pool from './database/connection.js';

const PORT = process.env.PORT || 3000;
const app = createApp();

async function testDatabaseConnection() {
    try {
        await pool.query('SELECT NOW()');
        console.log('Database connesso');
    } catch (error) {
        console.error('Errore database:', error.message);
    }
}

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, async () => {
        console.log(`Server su porta ${PORT}`);
        await testDatabaseConnection();
    });
}

export default app;
