# Gestionale JEINS

Applicazione full-stack per gestione clienti, progetti, contabilità, calendario e board operativa.

## Architettura

```
Browser (React + Vite + TypeScript)
        │  REST + JWT
        ▼
Backend (Node.js + Express + PostgreSQL)
```

## Requisiti

- Node.js 18+
- PostgreSQL

## Setup locale

### 1. Backend

```bash
cd backend
cp .env.example .env
# Imposta DATABASE_URL, JWT_SECRET, FRONTEND_URL=http://localhost:5173
npm install
npm run migrate:all
npm run dev
```

### 2. Frontend

```bash
cd gestionale-app
echo VITE_API_URL=http://localhost:3000 > .env
npm install
npm run dev
```

Apri http://localhost:5173

### Credenziali seed (dopo migrate)

- Email: `admin@gestionale.it`
- Password: `admin123` (cambiala subito)

## Script utili

| Comando | Dove | Descrizione |
|---------|------|-------------|
| `npm run dev` | `backend` / `gestionale-app` | Dev server |
| `npm run build` | `gestionale-app` | Build produzione |
| `npm run test` | `gestionale-app` / `backend` | Test |
| `npm run migrate:all` | `backend` | Schema + migrazioni SQL |

## Mock API (solo development)

Mock in `gestionale-app/src/lib/api/mock.ts` (import dinamico). Attivazione da `/admin` in dev. **Disabilitati in produzione.**

## Documentazione

- `ARCHITETTURA.md` — deploy e API
- `docs/` — documentazione aggiuntiva

## Deploy (Render)

Vedi `ARCHITETTURA.md` per variabili d'ambiente e deploy backend/frontend.

## Struttura frontend

```
gestionale-app/src/
  app/           # Router, auth, layout
  pages/         # Route pages
  features/      # Hooks dati, form
  components/    # UI e dashboard
  services/api.ts
  lib/           # API client, react-query
```
