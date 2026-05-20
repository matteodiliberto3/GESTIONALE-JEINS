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
- `docs/` — documentazione aggiuntiva (RBAC, glossario, reference)

### Walkthrough (percorsi didattici)

**Punto di ingresso:** [walkthrough/00-PERCORSI.md](walkthrough/00-PERCORSI.md) — scegli il profilo (neofita dev, design engineer, mid E2E, architettura).

| Track | Pubblico | Indice |
|-------|----------|--------|
| [FOUNDATIONS](walkthrough/FOUNDATIONS/00-INDICE.md) | PRE-DE-A — git, React, HTTP, avvio repo | cap 0–4 |
| [DESIGN-ENGINEER](walkthrough/DESIGN-ENGINEER/00-INDICE.md) | Craft UI su design system JEINS | PRE-DE-B + cap 0–10 |
| [MID-LEVEL](walkthrough/MID-LEVEL/00-INDICE.md) | Feature end-to-end (DB → API → Page → PR) | cap 0–10 |
| [frontend](walkthrough/frontend/00-INDICE.md) | Architettura e trade-off FE | moduli 1–7 |
| [BACKEND](walkthrough/BACKEND/00-INDICE.md) | Architettura server | cap 1–28 |

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
