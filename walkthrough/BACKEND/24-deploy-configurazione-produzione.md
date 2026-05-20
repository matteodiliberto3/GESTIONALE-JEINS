# Capitolo 24 — Deploy e runtime produzione

> **File:** `backend/render.yaml`, `ARCHITETTURA.md`

---

## 24.1 Pipeline Render

```yaml
startCommand: npm run migrate:deploy && npm start
healthCheckPath: /health
```

```mermaid
flowchart LR
    GIT[Push] --> BUILD[npm install]
    BUILD --> MIG[migrate:deploy]
    MIG --> START[npm start]
    START --> HC[/health SELECT 1 DB]
```

---

## 24.2 Variabili critiche

`DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, `NODE_ENV=production`

---

## 24.3 Health vs readiness

`/health` esegue `SELECT 1` — buono per readiness DB.  
Non misura: coda, dipendenze esterne future.

---

## 24.4 Fallimenti deploy

- Migrazione lunga → timeout start  
- Secret mancante → auth 500 al primo uso  
- Rolling senza graceful shutdown → 502 (Cap. 3bis)

---

*Capitolo 24 — v1*
