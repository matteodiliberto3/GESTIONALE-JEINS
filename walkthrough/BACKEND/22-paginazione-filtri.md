# Capitolo 22 — Paginazione, filtri e limiti

> **Codice:** `lib/pagination.js`

---

## 22.1 Modello attuale

`parsePagination` / `buildPaginatedResult` — offset/limit su liste che lo adottano.

---

## 22.2 DoS via `limit`

**Rischio:** `limit=999999` su endpoint che accettano parametro senza cap.

**Regola:** `MAX_LIMIT` hardcoded (es. 100) in `pagination.js`.

---

## 22.3 Cursor pagination

**Non implementata.** Necessaria per feed attività/messaggi ad alto volume — keyset su `(created_at, id)`.

---

*Capitolo 22 — v1*
