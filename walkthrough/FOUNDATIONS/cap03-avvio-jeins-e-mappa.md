# PRE-DE-A — Capitolo 3 — Avvio JEINS, mappa E2E ed esercizio Clienti

---

## Contesto

Fino a cap02 hai studiato modelli su carta. Qui **avvii il sistema reale**: due processi (API + UI), database migrato, login, traccia **Clienti** file per file.

Questo capitolo è **allineato** a [MID-LEVEL cap00](../MID-LEVEL/cap00-onboarding-mappa-repo.md): stesso esercizio obbligatorio, stessa tabella troubleshooting. FOUNDATIONS lo rende **obbligatorio** nel percorso neofita; MID-LEVEL cap00 resta la reference se qualcosa cambia nel repo.

---

## Perché due terminali (ragionamento)

| Processo | Cartella | Porta tipica | Se lo spegni |
|----------|----------|--------------|--------------|
| Backend Express | `backend/` | 3000 | FE: `Impossibile raggiungere il backend` |
| Frontend Vite | `gestionale-app/` | 5173 | Browser: niente UI |
| PostgreSQL | esterno / locale | 5432 | Migration e API falliscono |

**Perché non un solo `npm run dev` alla root:** sono due package.json indipendenti, deploy separato su Render — impari la stessa separazione che avrai in produzione.

---

## Checklist avvio — passi numerati

### Terminal 1 — Database e API

```bash
cd backend
cp .env.example .env
```

Apri `.env` e compila **almeno**:

| Variabile | Esempio | Perché |
|-----------|---------|--------|
| `DATABASE_URL` | `postgresql://user:pass@localhost:5432/gestionale` | Pool `pg` |
| `JWT_SECRET` | stringa lunga casuale (≥ 32 char) | Firma token |
| `FRONTEND_URL` | `http://localhost:5173` | CORS: browser può chiamare API |

Poi:

```bash
npm install
npm run migrate:all
npm run dev
```

**Verifica 1:** browser → `http://localhost:3000/health` → risposta positiva (JSON o testo OK).

**Perché `migrate:all`:** senza tabelle, login o liste falliscono con errori SQL opachi — non è “React rotto”.

### Terminal 2 — Frontend

```bash
cd gestionale-app
```

Crea `.env` (se non esiste):

```bash
# Windows PowerShell
Set-Content -Path .env -Value "VITE_API_URL=http://localhost:3000"

# macOS / Linux
echo "VITE_API_URL=http://localhost:3000" > .env
```

```bash
npm install
npm run dev
```

**Verifica 2:** `http://localhost:5173` → schermata login o shell.

**Credenziali seed (solo locale):** `admin@gestionale.it` / `admin123` — cambiale dopo primo accesso se il team lo richiede.

---

## Troubleshooting neofita (tabella estesa)

| Sintomo | Causa probabile | Azione |
|---------|-----------------|--------|
| `ECONNREFUSED` / NetworkError in UI | Backend spento | Terminal 1 → `npm run dev` |
| Login fallisce sempre | `JWT_SECRET` vuoto o DB down | Controlla `.env` + Postgres avviato |
| Login ok, liste vuote / errore | `VITE_API_URL` errato | Deve essere `http://localhost:3000` senza slash finale |
| Migration fallisce | `DATABASE_URL` errato | `psql` o GUI per test connessione |
| Porta 3000 occupata | Altro processo | Cambia porta in `.env` + `VITE_API_URL` coerente |
| Pagina bianca FE | Errore JS | DevTools Console + `npm run build` |
| Dati senza richiesta Network | Mock dev | [cap02 § mock](./cap02-http-json-api-client.md#mock-dev--trappola-del-neofita) |

**Ragionamento:** leggi sempre **prima** il messaggio in Console (FE) o nel Terminal 1 (BE) — non cambiare codice a caso.

---

## Mappa E2E — cartelle e responsabilità

```mermaid
flowchart LR
    subgraph fe [gestionale-app/src]
        P[pages/ClientsPage]
        V[views/ClientiView]
        H[features/data/hooks]
        S[services/api.ts]
        C[lib/api/client.ts]
    end
    subgraph be [backend]
        R[routes/clients.js]
        M[middleware/auth]
        DB[(PostgreSQL)]
    end
    P --> V
    P --> H
    H --> S
    S --> C
    C -->|HTTP| R
    R --> M
    R --> DB
```

| Cartella FE | Cosa ci metti | Esempio |
|-------------|---------------|---------|
| `pages/` | Hook, modali, permessi, stati loading | `ClientsPage.tsx` |
| `views/` | Tabella, testi, layout — **solo props** | `ClientiView.tsx` |
| `features/data/hooks.ts` | `useQuery` / `useMutation` | `useClients()` |
| `services/api.ts` | Metodi REST | `clientsAPI.getAll` |
| `lib/api/client.ts` | Transport | `apiCall` |
| `lib/query/keys.ts` | Cache keys | `queryKeys.clients` |
| `components/ui/` | Primitivi | `Button`, `DataTable` |

| Cartella BE | Cosa ci metti | Esempio |
|-------------|---------------|---------|
| `routes/` | Handler HTTP | `clients.js` |
| `middleware/auth.js` | `req.user` | JWT |
| `middleware/authorize.js` | Permessi | `requireClientWrite` |
| `database/migration_*.sql` | Schema | Una migration per feature |

---

## Comandi quotidiani (memorizza)

| Comando | Dove | Quando |
|---------|------|--------|
| `npm run dev` | `backend`, `gestionale-app` | Sviluppo — **entrambi** accesi |
| `npm run migrate:all` | `backend` | Dopo `git pull` con nuove migration |
| `npm run build` | `gestionale-app` | Prima PR — errori TS |
| `npm run lint` | `gestionale-app` | Prima PR — stile/regole |
| `npm test` | `backend` / `gestionale-app` | Se tocchi logica testata |

---

## Esercizio obbligatorio — traccia Clienti (6 passi)

**Obiettivo:** dimostrare che sai seguire il filo **Page → hook → API → route** e distinguere FE da BE.

1. Apri `gestionale-app/src/pages/ClientsPage.tsx`.
2. Trova l’hook che carica i dati (es. `useClients`) → apri `features/data/hooks.ts` → segui fino a `clientsAPI.getAll` in `services/api.ts` → `apiCall('/api/clients')`.
3. Apri `backend/routes/clients.js` — individua handler **GET** lista (path `/` o `router.get('/')` a seconda del file).
4. In `gestionale-app/src/views/ClientiView.tsx` (o view clienti reale), cambia **solo un testo visibile** (es. intestazione colonna “Nome” → “Nome cliente”) → salva → browser si aggiorna (HMR Vite).
5. In `backend/routes/clients.js`, nel handler GET lista, aggiungi **temporaneamente** `console.log('[FOUNDATIONS] GET /api/clients');` → ricarica pagina Clienti → vedi log nel **Terminal 1**.
6. **Rimuovi** il `console.log` prima di qualsiasi commit.

### Verifica mock (passo 7 — obbligatorio)

1. Login → Clienti.
2. DevTools → Network → Fetch/XHR → ricarica.
3. **Sufficiente:** compare richiesta verso `http://localhost:3000/api/clients` (o la tua `VITE_API_URL`) con status 200.
4. **Insufficiente:** dati visibili ma zero richieste → mock attivo — disattiva come cap02.

---

## Alternative scartate

| ❌ | ✅ |
|----|-----|
| Un solo terminale “tutto insieme” senza capire chi è 3000 vs 5173 | Due terminali etichettati |
| Modificare subito 10 file | Un testo in View + un log temporaneo |
| Commit con `console.log` | Rimozione prima del push |
| Cercare “Rimborsi” nel repo per esercizio | **Clienti** — file esistenti garantiti |

---

## Trade-off

| Scelta | Pro | Contro |
|--------|-----|--------|
| Esercizio su codice produzione | Realismo | Rischio commit rumore — branch dedicato |
| Duplicare checklist con MID-LEVEL cap00 | Coerenza team | Due file da aggiornare se path cambiano |
| Seed admin condiviso | Onboarding veloce | Sicurezza solo dev |

---

## Definition of Done — fine PRE-DE-A (cap0–3)

- [ ] Git: branch + commit + PR draft ([cap00](./cap00-git-workflow-e-repo.md))
- [ ] React: `FoundationsHello` + build ok ([cap01](./cap01-react-typescript-minimo.md))
- [ ] HTTP: tabella Network + catena Page→BE ([cap02](./cap02-http-json-api-client.md))
- [ ] Avvio: health + login + GET clients visibile
- [ ] Esercizio 6+7 passi sopra completati
- [ ] `console.log` backend **rimosso**

**Manca ancora** cap04 (prima modifica disciplinata View) prima di dichiarare PRE-DE-A chiuso al 100%.

---

## Limiti

- Non configura Render/Supabase produzione — BACKEND cap24.
- Non spiega Docker — opzionale in team.
- Path file possono rinominare — se non trovi `ClientiView`, cerca view collegata a `ClientsPage` nel repo.

---

## Prossimo

[Capitolo 4 — Prima modifica in View (Page vs View)](./cap04-prima-modifica-in-view.md)

*Approfondimento parallelo:* [MID-LEVEL cap00](../MID-LEVEL/cap00-onboarding-mappa-repo.md)
