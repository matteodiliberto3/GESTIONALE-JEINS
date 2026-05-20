# Capitolo 6 — Backend: route, middleware, SQL (appendice)

> **Riferimento architetturale:** [BACKEND Cap. 1](../BACKEND/01-fondamenta-architetturali-e-flusso-richiesta.md), [Cap. 4bis](../BACKEND/04bis-middleware-pipeline-sicurezza.md), [Cap. 7](../BACKEND/07-autorizzazione-rbac.md)

---

## 3.1 Anatomia di una route JEINS

📁 Modello: `backend/routes/clients.js`

```js
const router = express.Router();
router.use(authenticateToken);  // tutte le route sotto richiedono login

router.get('/', requireNotSocio, async (req, res, next) => {
    try {
        // req.user disponibile
        const result = await pool.query(`SELECT ...`, [params]);
        res.json(result.rows);
    } catch (error) {
        next(error);  // ✅
    }
});
```

| Pezzo | Regola |
|-------|--------|
| `authenticateToken` | una volta per router |
| `requireNotSocio` / `requireClientWrite` | su ogni metodo che lo richiede |
| `next(error)` | sempre nel catch |
| `AppError` | validazione business → status 4xx |

---

## 3.2 Junior vs Mid-Level

### Validazione input

❌ Junior:

```js
const { name, role } = req.body;
// role dal client → escalation
```

✅ Mid-Level:

```js
const { name, contactPerson, email } = req.body;
if (!name?.trim()) throw new AppError('Il nome del cliente è obbligatorio', 400);
// ruolo MAI dal body su register: vedi authService
```

### SQL

❌ Junior — concatenazione:

```js
pool.query(`SELECT * FROM clients WHERE name = '${name}'`);
```

✅ Mid-Level — parametri:

```js
pool.query(
    `SELECT client_id as id, name, version FROM clients WHERE client_id = $1`,
    [id],
);
```

### Errori

❌ Junior:

```js
} catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore' });
}
```

✅ Mid-Level:

```js
} catch (error) {
    next(error);
}
```

L’error handler in `app.js` uniforma la risposta; le route possono ancora fare `if (error instanceof AppError) return res.status(...)` come in `auth.js` — **preferire** `next(error)` quando refactori.

### Autorizzazione

❌ Junior: solo `if (req.user.role === 'Admin')` nel mezzo del POST.

✅ Mid-Level: middleware `requireClientWrite` + `canAccessClientInArea(req.user, client.area)` su GET singolo.

---

## 3.3 Paginazione (liste grandi)

📁 `lib/pagination.js`

Se la lista supporta `?limit=` e `?cursor=`, copia il pattern `GET /` in `clients.js` (`buildPaginatedResult`).

❌ Junior: `SELECT *` senza LIMIT su tabella che crescerà.

---

## 3.4 Optimistic locking (UPDATE)

Entità con `version`: il client invia `expectedVersion`; il backend verifica `WHERE version = $n`.

Se 0 righe → `409` con body che include dati server (pattern già usato su clienti/progetti).

📁 Frontend: `useConflictUpdate` — [Capitolo 3](./cap03-gestione-conflitti-dati-concorrenti.md).

---

## 3.5 Quando creare un `service/`

✅ Estrai in `services/clientsService.js` se:

- stessa query usata da 2 route  
- logica > ~30 righe  
- vuoi testare senza HTTP

❌ Non creare service vuoto che fa solo `pool.query` una riga — YAGNI finché il team non standardizza tutti i domini.

**Oggi:** solo `authService` è l’esempio maturo — usalo come template.

---

## 3.6 Registrazione nuova route

1. Crea `backend/routes/foo.js`  
2. In `app.js`:

```js
import fooRoutes from './routes/foo.js';
app.use('/api/foo', fooRoutes);
```

3. Documenta in `docs/backend/API-Endpoints.md` (se il team mantiene il file aggiornato).

---

## 3.7 Test rapido

```bash
cd backend && npm test
```

Aggiungi test unit solo se tocchi `lib/` o `services/` con logica non banale.

---

*Capitolo 6 — v2*
