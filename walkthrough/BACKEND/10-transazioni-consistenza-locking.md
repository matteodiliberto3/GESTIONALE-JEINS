# Capitolo 10 — Transazioni, consistenza e optimistic locking

> **Doc:** `docs/backend/Optimistic-Locking.md` · **SQL:** `migration_add_version_optimistic_locking.sql`

---

## 10.1 Transazioni esplicite — gap

Molte route = singole `pool.query` senza `BEGIN`/`COMMIT`. Operazioni multi-tabella (es. delete client + cascade) affidano a **FK CASCADE**, non a transazione applicativa esplicita.

**Rischio:** metà operazione riuscita se due write indipendenti e fallimento intermedio.

---

## 10.2 Optimistic locking

Colonna `version` + trigger `increment_version` su `clients`, `projects`, `contracts`, `tasks`, `events`.

```sql
UPDATE ... WHERE id = $1 AND version = $2
-- 0 rows → 409 CONCURRENT_MODIFICATION
```

Vedi sequence diagram Cap. 2 §2.6.

---

## 10.3 Domini ad alta contesa

| Dominio | Race tipica |
|---------|-------------|
| Eventi / RSVP | doppio insert participant |
| Poll voti | doppio voto |
| Board | move task concorrente |

Mitigazione: UNIQUE constraint + idempotency key su POST.

---

## 10.4 Trade-off lock

| Optimistic | Pessimistic `FOR UPDATE` |
|------------|---------------------------|
| board UX | pagamenti critici futuri |

---

## 10.5 Fallimenti

- Lost update senza `version` in PATCH.  
- Client ignora 409 → sovrascrive dati altrui.

---

*Capitolo 10 — v1*
