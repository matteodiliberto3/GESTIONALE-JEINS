import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './database/connection.js';

import authRoutes from './routes/auth.js';
import clientsRoutes from './routes/clients.js';
import projectsRoutes from './routes/projects.js';
import contractsRoutes from './routes/contracts.js';
import eventsRoutes from './routes/events.js';
import eventReportsRoutes from './routes/eventReports.js';
import usersRoutes from './routes/users.js';
import tasksRoutes from './routes/tasks.js';
import sprintsRoutes from './routes/sprints.js';
import activitiesRoutes from './routes/activities.js';
import timeEntriesRoutes from './routes/timeEntries.js';
import messagesRoutes from './routes/messages.js';
import pollsRoutes from './routes/polls.js';
import candidatesRoutes from './routes/candidates.js';
import onboardingRoutes from './routes/onboarding.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`\n[${timestamp}] ${req.method} ${req.path}`);
    console.log('   Origin:', req.headers.origin || 'N/A');
    if ((req.method === 'POST' || req.method === 'PUT') && req.body) {
        const bodyCopy = { ...req.body };
        if (bodyCopy.password) bodyCopy.password = '***HIDDEN***';
        console.log('   Body:', JSON.stringify(bodyCopy).substring(0, 200));
    }
    next();
});

const allowedOrigins = (process.env.FRONTEND_URL
    || 'http://localhost:5173,http://localhost:5174,http://localhost:5175,http://127.0.0.1:5173,https://gestionale-i5bj.onrender.com')
    .split(',').map(s => s.trim()).filter(Boolean);

app.use(cors({
    origin: (origin, cb) => {
        if (!origin) return cb(null, true);
        if (allowedOrigins.includes(origin)) return cb(null, true);
        console.warn('CORS: origin non in lista, permessa per compatibilita:', origin);
        return cb(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', async (req, res) => {
    let dbStatus = 'ok';
    let dbError = null;
    try {
        await pool.query('SELECT 1');
    } catch (error) {
        dbStatus = 'error';
        dbError = error.message;
    }
    const response = { status: 'OK', db: dbStatus, timestamp: new Date().toISOString() };
    if (dbError) response.dbError = dbError;
    res.json(response);
});

app.get('/', (req, res) => {
    res.status(200).json({ status: 'online', message: 'Gestionale JEINS API is running' });
});

console.log('Registrazione route...');
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/contracts', contractsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/events', eventReportsRoutes);
app.use('/api/polls', pollsRoutes);
app.use('/api/candidates', candidatesRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/sprints', sprintsRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/time-entries', timeEntriesRoutes);
app.use('/api', messagesRoutes);
console.log('Route registrate');

app.use((err, req, res, next) => {
    console.error('Errore:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Errore interno del server',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
});

app.use((req, res) => {
    res.status(404).json({ error: 'Route non trovata', path: req.path, method: req.method });
});

async function testDatabaseConnection() {
    try {
        await pool.query('SELECT NOW()');
        console.log('Database connesso');
    } catch (error) {
        console.error('Errore database:', error.message);
    }
}

app.listen(PORT, async () => {
    console.log(`Server su porta ${PORT}`);
    await testDatabaseConnection();
});
