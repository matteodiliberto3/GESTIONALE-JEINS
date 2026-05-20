# Drizzle ORM — DB remoto Render da locale

L'API [gestionale-backand-api.onrender.com](https://gestionale-backand-api.onrender.com) **non** espone SQL: Drizzle si collega direttamente a **PostgreSQL** con `DATABASE_URL`.

## 1. Ottieni la connection string

1. Render Dashboard → **PostgreSQL** → **Connect**
2. Copia **External Connection String** (da locale non funziona l'Internal URL)
3. In `backend/.env`:

```env
DATABASE_URL=postgresql://...@dpg-xxxxx.oregon-postgres.render.com/gestionale_db
JWT_SECRET=...   # solo se avvii anche il server in locale
```

Se la password nel dashboard è stata rigenerata, aggiorna anche `DATABASE_URL` sul **Web Service** backend su Render (stesso errore `28P01` dell'API).

## 2. Verifica connessione

```bash
cd backend
npm run db:check
```

Atteso: `Connessione OK` + elenco tabelle.

## 3. Introspection (schema dal DB reale)

Sincronizza `database/drizzle/schema.js` con lo schema già presente su Render (dopo le migration SQL del progetto):

```bash
npm run db:pull
```

## 4. Drizzle Studio (UI web)

```bash
npm run db:studio
```

Apre l'interfaccia su `https://local.drizzle.studio` (o URL indicato in console) per navigare e modificare i dati.

## 5. Altri comandi

| Comando | Uso |
|---------|-----|
| `npm run db:generate` | Genera SQL da `schema.js` |
| `npm run db:migrate` | Applica migration Drizzle in `database/drizzle/migrations` |
| `npm run db:push` | Push schema → DB (**attenzione in produzione**) |

## Coesistenza con migration SQL esistenti

In produzione Render esegue ancora `npm run migrate:deploy` (`run-sql-migrations.js`). Per cambi schema in prod:

- preferisci i file in `backend/database/migration_*.sql` + `migrate:deploy`, oppure
- usa Drizzle solo in dev/studio e documenta ogni `db:push` su Render.

## File

- `drizzle.config.js` — configurazione kit
- `database/drizzle/schema.js` — definizione tabelle (aggiornabile con `db:pull`)
- `database/drizzle/db.js` — client programmatico (`getDb()`)
