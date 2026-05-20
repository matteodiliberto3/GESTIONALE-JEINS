# Capitolo 0 — Onboarding e mappa del repository

> **Primo capitolo da leggere.** Qui impari dove sono i file e come avviare il progetto in locale.  
> **Non implementare ancora feature** — prima capisci il percorso **Clienti** (file reali), poi passa al [Capitolo 1](./cap01-metodo-jeins-feature-end-to-end.md).

---

## 0.1 Setup locale (ordine obbligatorio)

Serve **due terminali** aperti insieme: uno per il backend (API + database), uno per il frontend (interfaccia React).

### Terminal 1 — Database e API

```bash
cd backend
cp .env.example .env
```

Apri `.env` e verifica almeno:

| Variabile | Esempio | A cosa serve |
|-----------|---------|--------------|
| `DATABASE_URL` | `postgresql://user:pass@localhost:5432/gestionale` | Connessione PostgreSQL |
| `JWT_SECRET` | stringa lunga casuale | Firma dei token di login |
| `FRONTEND_URL` | `http://localhost:5173` | CORS: il backend accetta richieste da questo origin |

Poi:

```bash
npm install
npm run migrate:all    # crea/aggiorna tabelle — esegui dopo ogni pull con nuove migration
npm run dev
```

Apri nel browser: `http://localhost:3000/health` — deve rispondere OK (prova che l’API è viva).

### Terminal 2 — Interfaccia React

```bash
cd gestionale-app
echo VITE_API_URL=http://localhost:3000 > .env
npm install
npm run dev
```

Apri: `http://localhost:5173` — vedrai la login o la shell dell’app.

**Credenziali seed (solo locale):** `admin@gestionale.it` / `admin123` — cambiale dopo il primo accesso.

### Se qualcosa non parte (neofita)

| Sintomo | Causa probabile | Cosa fare |
|---------|-----------------|-----------|
| `ECONNREFUSED` nel frontend | Backend spento | Avvia Terminal 1 |
| Login ok ma liste vuote / errore rete | `VITE_API_URL` sbagliato | Deve puntare a `http://localhost:3000` |
| Migration fallisce | DB non raggiungibile | Controlla PostgreSQL avviato e `DATABASE_URL` |

---

## 0.2 Mappa mentale E2E (come viaggia una richiesta)

Quando clicchi “Salva cliente”, il dato **non** va direttamente da React a PostgreSQL in un solo salto. Passa da strati con responsabilità diverse:

```mermaid
flowchart LR
    subgraph fe [gestionale-app/src]
        P[pages/]
        V[views/]
        F[features/data/hooks.ts]
        S[services/api.ts]
        C[lib/api/client.ts]
    end
    subgraph be [backend]
        R[routes/]
        M[middleware/]
        L[lib/]
        DB[(PostgreSQL)]
    end
    P --> V
    P --> F
    F --> S
    S --> C
    C -->|HTTP + JWT| R
    R --> M
    R --> L
    L --> DB
```

| Cartella FE | Cosa ci metti | Esempio |
|-------------|---------------|---------|
| `pages/` | Orchestrazione: hook, modali, permessi | `ClientsPage.tsx` |
| `views/` | UI che riceve props e callback | `ClientiView.tsx` |
| `features/data/hooks.ts` | `useQuery` / `useMutation` | `useClients()` |
| `services/api.ts` | URL e metodi (`clientsAPI.getAll`) | Nessun JSX |
| `lib/api/client.ts` | Token, refresh 401, timeout, 409 | `apiCall()` |
| `lib/query/keys.ts` | Chiavi cache React Query | `queryKeys.clients` |
| `components/ui/` | Bottoni, Card, Input riusabili | Non copiare HTML a mano |

| Cartella BE | Cosa ci metti | Esempio |
|-------------|---------------|---------|
| `routes/` | HTTP: legge `req`, risponde `res` | `clients.js` |
| `middleware/auth.js` | Chi è loggato (`req.user`) | `authenticateToken` |
| `middleware/authorize.js` | Può fare questa azione? | `requireClientWrite` |
| `lib/` | SQL e regole dominio (nuove entità) | `lib/roles.js`, futuro `lib/foo.js` |
| `database/migration_*.sql` | Modifica schema DB | Una migration per feature |

---

## 0.3 Comandi che userai ogni giorno

| Comando | Dove | Quando usarlo |
|---------|------|----------------|
| `npm run dev` | `backend` e `gestionale-app` | Sviluppo quotidiano — tieni entrambi accesi |
| `npm run migrate:all` | `backend` | Dopo `git pull` se ci sono nuovi file in `database/` |
| `npm run test` | `backend` | Prima di PR se hai toccato `lib/` o `services/` |
| `npm test` | `gestionale-app` | Prima di PR frontend (Vitest) |
| `npm run test:watch` | `gestionale-app` | Mentre scrivi test a tappeto |
| `npm run test:e2e` | `gestionale-app` | Opzionale — smoke Playwright |
| `npm run build` | `gestionale-app` | Verifica errori TypeScript prima della PR |
| `npm run lint` | `gestionale-app` | Controlla regole ESLint su `src/` — vedi [Cap. 9](./cap09-pr-review-testing.md#95-test-in-questo-repo) |

Dettaglio test: [Capitolo 9](./cap09-pr-review-testing.md#95-test-in-questo-repo).

---

## 0.4 Primo giorno — esercizio obbligatorio (traccia Clienti, non Rimborsi)

**Obiettivo:** dimostrare che sai seguire il filo **Page → hook → API → route** su codice **esistente**.

1. Apri `gestionale-app/src/pages/ClientsPage.tsx`.
2. Trova quale hook carica i dati (`useClients` → `features/data/hooks.ts` → `clientsAPI` → `apiCall`).
3. Apri `backend/routes/clients.js` e individua `GET /` (lista clienti).
4. Modifica **solo un testo** in `ClientiView` (es. titolo colonna) → salva → il browser deve aggiornarsi (hot reload Vite).
5. Aggiungi **temporaneamente** un `console.log('GET clients');` nel handler `GET /` del backend → ricarica la pagina clienti → vedi il log nel Terminal 1.
6. **Rimuovi** il `console.log` prima di qualsiasi commit.

### Verifica mock disattivato (impara subito a non farti fregare dal mock)

1. Login → pagina Clienti.
2. DevTools → **Network** → filtra `Fetch/XHR`.
3. Ricarica la lista: deve comparire una richiesta verso `http://localhost:3000/api/clients` (o il tuo `VITE_API_URL`).
4. Se **non** compare nessuna richiesta ma i dati ci sono ugualmente, probabilmente hai il **mock dev** attivo — vedi [Cap. 8 §8.4](./cap08-react-query-chiavi-cache.md#84-mock-solo-dev---cosa-sono-e-cosa-non-committare).

---

**Prossimo passo:** [Capitolo 1 — Metodo JEINS](./cap01-metodo-jeins-feature-end-to-end.md) (per **implementare** una feature nuova) · [Indice playbook](./00-INDICE.md)

---

*Capitolo 0 — v3 — onboarding esaustivo*
