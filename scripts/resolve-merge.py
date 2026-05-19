"""Risolve i conflitti di merge per push diretto su main."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def write(rel: str, content: str) -> None:
    p = ROOT / rel
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(content, encoding="utf-8")
    print("wrote", rel)

def fix_api_ts() -> None:
    p = ROOT / "gestionale-app/src/services/api.ts"
    t = p.read_text(encoding="utf-8")
    start = t.index("<<<<<<< HEAD")
    mid = t.index("=======", start)
    end = t.index(">>>>>>> origin/main", mid)
    head = t[start + len("<<<<<<< HEAD\n") : mid].rstrip()
    theirs = t[mid + len("=======\n") : end]
    # Rimuovi tasksAPI duplicato dal ramo remote
    dup = "// Tasks API\nexport const tasksAPI = {"
    if dup in theirs:
        idx = theirs.index(dup)
        mock_idx = theirs.index("// Funzione per generare mock data", idx)
        theirs = theirs[mock_idx:]
    merged_tail = head + "\n\n" + theirs
    t = t[:start] + merged_tail + t[end + len(">>>>>>> origin/main\n") :]
    p.write_text(t, encoding="utf-8")
    print("fixed api.ts")

SERVER_JS = r'''import express from 'express';
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
'''

USERS_JS = r'''import express from 'express';
import pool from '../database/connection.js';
import bcrypt from 'bcrypt';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticateToken);

const isAdminOrIT = (req, res, next) => {
    if (['Admin', 'IT', 'Responsabile'].includes(req.user.role)) return next();
    return res.status(403).json({ error: 'Accesso negato. Solo Admin/IT Manager possono accedere.' });
};

const isPrivileged = (role) => ['Admin', 'IT', 'Responsabile'].includes(role);

router.get('/', async (req, res) => {
    try {
        const query = isPrivileged(req.user.role)
            ? `SELECT user_id as id, name, email, area, role, is_active as "isActive",
                      avatar_url as "avatarUrl", handle, color, last_seen as "lastSeen",
                      created_at as "createdAt"
               FROM users ORDER BY name ASC`
            : `SELECT user_id as id, name, area, role,
                      avatar_url as "avatarUrl", handle, color
               FROM users WHERE is_active = TRUE ORDER BY name ASC`;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Errore recupero utenti:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

router.get('/me', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT user_id as id, name, email, area, role,
                    avatar_url as "avatarUrl", handle, color,
                    created_at as "createdAt"
             FROM users WHERE user_id = $1`,
            [req.user.userId],
        );
        if (!result.rows.length) return res.status(404).json({ error: 'Utente non trovato' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Errore /me:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

router.patch('/me', async (req, res) => {
    try {
        const { name, avatarUrl, handle, color } = req.body;
        const result = await pool.query(
            `UPDATE users SET
                name = COALESCE($1, name),
                avatar_url = COALESCE($2, avatar_url),
                handle = COALESCE($3, handle),
                color = COALESCE($4, color),
                updated_at = CURRENT_TIMESTAMP
             WHERE user_id = $5
             RETURNING user_id as id, name, email, area, role,
                       avatar_url as "avatarUrl", handle, color`,
            [name, avatarUrl, handle, color, req.user.userId],
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Errore patch /me:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

router.get('/online', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT user_id as id, name, email, area, role, last_seen as "lastSeen"
             FROM users
             WHERE last_seen > NOW() - INTERVAL '5 minutes'
             ORDER BY last_seen DESC`,
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Errore recupero utenti online:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

router.post('/', isAdminOrIT, async (req, res) => {
    try {
        const { name, email, password, area, role } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Nome, email e password sono obbligatori' });
        }
        const existingUser = await pool.query('SELECT user_id FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'Email già registrata' });
        }
        const passwordHash = await bcrypt.hash(password, 10);
        const result = await pool.query(
            `INSERT INTO users (name, email, password_hash, area, role, is_active)
             VALUES ($1, $2, $3, $4, $5, TRUE)
             RETURNING user_id as id, name, email, area, role, is_active as "isActive", created_at as "createdAt"`,
            [name, email, passwordHash, area || null, role || 'Socio'],
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Errore creazione utente:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

router.put('/:id', isAdminOrIT, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, area, role } = req.body;
        const result = await pool.query(
            `UPDATE users SET
                name = COALESCE($1, name),
                email = COALESCE($2, email),
                area = COALESCE($3, area),
                role = COALESCE($4, role),
                updated_at = CURRENT_TIMESTAMP
             WHERE user_id = $5
             RETURNING user_id as id, name, email, area, role, is_active as "isActive", created_at as "createdAt"`,
            [name, email, area, role, id],
        );
        if (!result.rows.length) return res.status(404).json({ error: 'Utente non trovato' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Errore modifica utente:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

router.patch('/:id/reset-password', isAdminOrIT, async (req, res) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ error: 'Password deve avere almeno 6 caratteri' });
        }
        const passwordHash = await bcrypt.hash(newPassword, 10);
        const result = await pool.query(
            `UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
             WHERE user_id = $2 RETURNING user_id as id, name, email`,
            [passwordHash, id],
        );
        if (!result.rows.length) return res.status(404).json({ error: 'Utente non trovato' });
        res.json({ message: 'Password reimpostata con successo' });
    } catch (error) {
        console.error('Errore reset password:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

router.patch('/:id/status', isAdminOrIT, async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;
        if (isActive === undefined) {
            return res.status(400).json({ error: 'isActive è richiesto' });
        }
        if (id === req.user.userId && !isActive) {
            return res.status(400).json({ error: 'Non puoi disattivare il tuo stesso account' });
        }
        const result = await pool.query(
            `UPDATE users SET is_active = $1, updated_at = CURRENT_TIMESTAMP
             WHERE user_id = $2 RETURNING user_id as id, name, email, is_active as "isActive"`,
            [isActive, id],
        );
        if (!result.rows.length) return res.status(404).json({ error: 'Utente non trovato' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Errore modifica stato utente:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (id !== req.user.userId && !isPrivileged(req.user.role)) {
            return res.status(403).json({ error: 'Non hai i permessi per vedere questi dati' });
        }
        const result = await pool.query(
            `SELECT user_id as id, name, email, area, role, is_active as "isActive",
                    avatar_url as "avatarUrl", handle, color, last_seen as "lastSeen",
                    created_at as "createdAt"
             FROM users WHERE user_id = $1`,
            [id],
        );
        if (!result.rows.length) return res.status(404).json({ error: 'Utente non trovato' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Errore recupero utente:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

export default router;
'''

BACKEND_PKG = '''{
  "name": "gestionale-backend",
  "version": "1.0.0",
  "description": "Backend API per Gestionale Associazione",
  "main": "server.js",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "node --watch server.js",
    "migrate": "node scripts/migrate.js",
    "migrate:v2": "node scripts/migrate_v2.js",
    "migrate:all": "node scripts/migrate.js && node scripts/migrate_v2.js",
    "create-user": "node scripts/create_admin_user.js",
    "db:generate": "drizzle-kit generate",
    "db:push": "drizzle-kit push",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio",
    "db:check": "drizzle-kit check"
  },
  "dependencies": {
    "bcrypt": "^5.1.1",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "drizzle-orm": "^0.45.2",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.2",
    "pg": "^8.11.3"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "drizzle-kit": "^0.31.10"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
'''

APP_PKG = '''{
  "name": "gestionale-app",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.17",
    "typescript": "~5.9.3",
    "vite": "^7.1.7"
  },
  "dependencies": {
    "@dnd-kit/core": "^6.3.1",
    "@dnd-kit/sortable": "^10.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    "@types/react": "^19.2.2",
    "@types/react-dom": "^19.2.2",
    "clsx": "^2.1.1",
    "framer-motion": "^12.38.0",
    "lucide-react": "^1.14.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "recharts": "^3.8.1",
    "tailwind-merge": "^3.3.1"
  }
}
'''

def main() -> None:
    fix_api_ts()
    write("backend/server.js", SERVER_JS)
    write("backend/routes/users.js", USERS_JS)
    write("backend/package.json", BACKEND_PKG)
    write("gestionale-app/package.json", APP_PKG)

    ours_files = [
        "gestionale-app/src/App.tsx",
        "gestionale-app/src/index.css",
        "gestionale-app/tailwind.config.js",
        "gestionale-app/src/components/ui/Card.tsx",
        "gestionale-app/src/components/ui/Badge.tsx",
        "gestionale-app/src/components/Calendar.tsx",
        "gestionale-app/src/components/Login.tsx",
        "backend/routes/tasks.js",
    ]
    import subprocess
    for f in ours_files:
        subprocess.run(["git", "checkout", "--ours", f], cwd=ROOT, check=True)
        subprocess.run(["git", "add", f], cwd=ROOT, check=True)
        print("ours", f)

    # package-lock: rigenera dopo merge package.json
    for f in ["backend/package-lock.json", "gestionale-app/package-lock.json"]:
        subprocess.run(["git", "checkout", "--theirs", f], cwd=ROOT, check=True)
        subprocess.run(["git", "add", f], cwd=ROOT)

    print("done")

if __name__ == "__main__":
    main()
