# Capitolo 21 — Design REST pratico

> **Codice:** `lib/AppError.js`, `validators/authSchemas.js`, pattern in `routes/*`

---

## 21.1 Convenzioni

- Prefisso `/api`  
- Status: 200/201 success, 400 validazione, 401/403 auth, 404, 409 conflict, 500  
- Body errore: `{ error: string, code?: string }` — stack solo dev nell’error handler globale

---

## 21.2 `AppError`

```js
throw new AppError('Messaggio', 403);
```

**Target:** route propaga `next(err)`; handler mappa una volta.

---

## 21.3 Validazione Zod

Oggi centralizzata su **auth**; altre route spesso validazione inline o assente.

**Trade-off:** schema per dominio in `validators/` vs duplicazione frontend.

---

## 21.4 Versioning API

Vedi `docs/backend/API-Versioning.md` — **nessun** `/v1` oggi; breaking change = coordinamento frontend.

---

*Capitolo 21 — v1*
