# Capitolo 23 — Strategia di test

> **Comando:** `npm test` in `backend/` · **CI:** `.github/workflows/backend.yml`

---

## 23.1 Copertura attuale

| Area | Test tipico |
|------|-------------|
| `lib/roles.js` | unit |
| `authService` | unit |
| `pagination` | unit |
| `app.test.js` | smoke health |

---

## 23.2 Gap

- Integrazione DB reale (container Postgres)  
- Refresh cookie E2E  
- RBAC matrix per route critiche  
- Migrazioni su DB temporaneo  

---

## 23.3 Trade-off

`node --test` leggero vs supertest + Testcontainers — introdurre container per regression su SQL.

---

*Capitolo 23 — v1*
