# Capitolo 6 — Backend: route, middleware, SQL (appendice)

> **A chi serve questo capitolo:** hai già letto [Capitolo 1 — Metodo JEINS](./cap01-metodo-jeins-feature-end-to-end.md) e vuoi una **scheda rapida** solo lato server, oppure devi ripassare route/SQL prima di una PR senza rileggere tutto il Cap. 1.  
> **Non ripete** migration, `lib/` completo o integrazione frontend — quelli restano nel Cap. 1.

**Riferimento architetturale (teoria):** [BACKEND Cap. 1](../BACKEND/01-fondamenta-architetturali-e-flusso-richiesta.md), [Cap. 4bis](../BACKEND/04bis-middleware-pipeline-sicurezza.md), [Cap. 7](../BACKEND/07-autorizzazione-rbac.md)

---

## 6.1 Anatomia di una route JEINS (cosa succede a ogni richiesta)

Una **route** Express non è “il backend”: è l’**adattatore HTTP**. Traduce `req` (URL, header, body, cookie) in chiamate a funzioni che parlano col database, poi traduce il risultato in `res.json(...)`.

**Flusso che devi visualizzare:**

1. Il browser chiama `GET /api/clients` con header `Authorization: Bearer …` (o cookie).
2. `app.js` inoltra a `routes/clients.js`.
3. `router.use(authenticateToken)` popola `req.user` (chi sei).
4. `requireNotSocio` (o altro) verifica se **puoi** eseguire questa operazione.
5. L’handler esegue SQL (idealmente via `lib/`, non stringhe nel file route).
6. In caso di errore → `next(error)` → error handler globale in `app.js`.

📁 Modello reale: `backend/routes/clients.js`

```js
const router = express.Router();
router.use(authenticateToken);  // tutte le route sotto questo router richiedono login

router.get('/', requireNotSocio, async (req, res, next) => {
    try {
        // Da qui in poi req.user esiste: id, role, area, ...
        const result = await pool.query(`SELECT ...`, [params]);
        res.json(result.rows);
    } catch (error) {
        next(error);  // ✅ non gestire 500 a mano qui
    }
});
```

| Pezzo | Cosa fa | Se lo dimentichi |
|-------|---------|------------------|
| `authenticateToken` | Legge JWT/cookie, carica utente da DB | Route “anonima” che espone dati |
| `requireNotSocio`, `requireClientWrite`, … | Autorizzazione per **questo** metodo HTTP | Escalation ruolo via API |
| `try/catch` + `next(error)` | Errori uniformi, log centralizzati | Risposte 500 diverse per ogni file |
| `AppError` nel `lib/` | 400/404/409 con messaggio italiano controllato | `res.status(500).json('Errore')` generico |

**Per un neofita:** non mettere mai `console.log` al posto di `next(error)` in produzione; il reviewer non può debuggare la tua macchina.

---

## 6.2 Junior vs Mid-Level — input, SQL, errori, permessi

### 6.2.1 Validazione input (perché il body del client non è affidabile)

Il frontend può essere modificato con DevTools. **Ogni** campo che influenza sicurezza o integrità (ruolo, `userId` di un altro utente, importi) deve essere validato o ignorato sul server.

❌ **Junior — pericoloso:**

```js
const { name, role } = req.body;
// Se il client manda role: 'Admin', hai appena creato un admin
```

✅ **Mid-Level — whitelist di campi:**

```js
const { name, contactPerson, email } = req.body;
if (!name?.trim()) {
    throw new AppError('Il nome del cliente è obbligatorio', 400);
}
// Il ruolo dell'utente registrato viene SOLO da req.user dopo auth, mai da req.body
```

**Zod (consigliato su POST/PUT strutturati):** schema in `backend/validators/*Schemas.js` + middleware `validateBody(schema)` **prima** dell’handler. Vedi esempio completo in [Cap. 1](./cap01-metodo-jeins-feature-end-to-end.md) (sezione route + Zod).

### 6.2.2 SQL — parametri `$1`, non stringhe nel template

❌ **Junior — SQL injection:**

```js
pool.query(`SELECT * FROM clients WHERE name = '${name}'`);
// Un name = "'; DROP TABLE clients; --" è un incidente di sicurezza
```

✅ **Mid-Level — parametrizzato:**

```js
pool.query(
    `SELECT client_id AS id, name, version FROM clients WHERE client_id = $1`,
    [id],
);
```

Il driver `pg` sostituisce `$1` in modo sicuro. Il rischio resta se **concateni nomi di colonna** da `req.query.sort` senza whitelist — usa `lib/pagination.js` e mappe `{ date: 'created_at' }`.

### 6.2.3 Errori — `next(error)` invece di risposta manuale

❌ **Junior:**

```js
} catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore' });
}
```

✅ **Mid-Level:**

```js
} catch (error) {
    next(error);
}
```

L’error handler in `app.js` decide formato e status. Se lanci `throw new AppError('...', 400)` nel `lib/`, arriva come 400 coerente.

### 6.2.4 Autorizzazione — middleware, non `if` sparsi

❌ **Junior:** `if (req.user.role === 'Admin')` copiato in 5 route diverse.

✅ **Mid-Level:** `requireClientWrite` su `POST/PUT/DELETE` + `canAccessClientInArea(req.user, client.area)` sul GET singolo quando il record ha un’`area`.

Dettaglio RBAC: [Capitolo 4](./cap04-auth-rbac-blindare-feature.md).

---

## 6.3 Paginazione (liste che crescono)

📁 `backend/lib/pagination.js`

Senza `LIMIT`, una tabella da 50.000 righe **freeza** Node e il browser.

**Cosa fare:**

1. Leggi come `GET /api/clients` usa `parsePagination(req.query)` e `buildPaginatedResult`.
2. Se aggiungi una nuova lista, ripeti lo stesso contratto (`items`, `nextCursor` o `total`, come nel dominio esistente).
3. Documenta in PR i query param supportati (`?limit=`, `?cursor=`).

❌ **Junior:** `SELECT * FROM big_table` in produzione “perché al momento sono pochi”.

---

## 6.4 Optimistic locking (UPDATE con `version`)

Quando due persone modificano lo stesso record, l’ultimo salvataggio non deve **cancellare** silenziosamente l’altro.

**Contratto:**

- Il client invia `expectedVersion` (numero letto all’apertura del form).
- Il backend fa `UPDATE … WHERE id = $1 AND version = $2`.
- Se 0 righe aggiornate → **409** con `serverData` (stato attuale sul server).

📁 Frontend: [Capitolo 3](./cap03-gestione-conflitti-dati-concorrenti.md) (`useConflictUpdate`, `ConflictDialog`).

---

## 6.5 Quando creare un file in `services/`

| Situazione | Azione |
|----------|--------|
| Una query usata da **due** route | Estrai in `services/nomeService.js` o `lib/nome.js` |
| Logica > ~30 righe, branch complessi | Stesso |
| Vuoi test unit **senza** simulare HTTP | Funzione pura in `lib/` o `services/` |
| Una sola `pool.query` da 5 righe | **Non** creare service vuoto (YAGNI) |

**Oggi nel repo:** `authService` è il riferimento maturo. Le nuove entità seguono prima `lib/<entità>.js` come in Cap. 1.

---

## 6.6 Registrazione di una nuova route (checklist passo-passo)

1. Crea `backend/routes/foo.js` con `router.use(authenticateToken)` e middleware RBAC per metodo.
2. Monta in `backend/app.js`:

```js
import fooRoutes from './routes/foo.js';
app.use('/api/foo', fooRoutes);  // prefisso kebab-case plurale, come /api/clients
```

3. Verifica con curl o Postman **senza** token → deve rispondere **401**.
4. Verifica con utente senza permesso → **403**.
5. Aggiorna `docs/backend/API-Endpoints.md` se il team lo mantiene.

**Errore tipico del neofita:** dimenticare `app.use` → la route esiste ma risponde sempre 404 del catch-all.

---

## 6.7 Test rapido backend

```bash
cd backend
npm test
```

| Hai modificato… | Cosa ti aspetti |
|-----------------|----------------|
| Solo messaggi di errore in route | Test esistenti ancora verdi; test manuale curl |
| `lib/pagination.js`, validazione, 409 | Aggiungi o estendi test in `backend` (Jest) |

Non serve un test per ogni `SELECT` banale; serve test quando introduci **regole** (es. filtro area, calcolo permessi).

---

*Capitolo 6 — v3 — appendice backend esaustiva*
