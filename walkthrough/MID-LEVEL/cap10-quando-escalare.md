# Capitolo 10 — Quando escalare al Senior / Tech Lead

> Questo capitolo evita che il Junior resti bloccato giorni **o** che il Mid-Level introduca debito per orgoglio.

---

## 10.1 Escalare subito (bloccante)

| Situazione | Perché |
|------------|--------|
| Cambio schema su tabella usata da Stripe / pagamenti | rischio dati e compliance |
| Nuovo ruolo RBAC o permesso “globale” | impatta tutta l’app |
| Modifica a `auth.js`, refresh cookie, CORS | sicurezza |
| Performance: query > 1s su produzione | serve EXPLAIN, indici |
| Bug in produzione con dati corrotti | serve rollback plan |

**Cosa portare:** query, log, steps per riprodurre, branch/PR se esiste.

---

## 10.2 Escalare dopo 2–4 ore (non bloccante ma rischioso)

| Situazione | Hai già provato? |
|------------|------------------|
| 409 che non si risolve con `useConflictUpdate` | letto [Capitolo 3](./cap03-gestione-conflitti-dati-concorrenti.md), payload network tab |
| Migration che fallisce in staging | `inspect-schema.cjs`, diff SQL |
| React Query “stale data” inspiegabile | chiavi in `keys.ts`, invalidate |
| Tailwind che non applica classi | build Vite, `tailwind.config.js` content paths |

❌ Junior: escalare senza screenshot / senza aver letto l’error handler.

✅ Mid-Level: issue con ipotesi (“il 409 non include `serverVersion` nel body”).

---

## 10.3 NON escalare (risolvibile da Mid-Level)

- Nuova CRUD su entità esistente (clienti, progetti, eventi) — segui [Capitolo 1](./cap01-metodo-jeins-feature-end-to-end.md)  
- Nuovo campo su form + migration + API  
- Fix typo, loading state, permesso UI mancante su bottone già protetto da API  
- Allineare naming a pattern `ClientsPage`

---

## 10.4 Decisioni architetturali — chiedi prima di codare

| Proposta | Chiedi review se… |
|----------|-------------------|
| Nuovo ORM | **vietato** per convenzione repo — SQL + `pg` |
| Nuova libreria UI pesante | impatta bundle e tema |
| WebSocket / realtime | non è pattern standard oggi |
| Job async (coda) | vedi [BACKEND Cap. 3](../BACKEND/03-motori-asincroni-event-driven.md) — potrebbe essere solo design doc |

---

## 10.5 Documentazione da aggiornare

Quando la feature cambia contratto API o permessi:

- `docs/backend/API-Endpoints.md` (se mantenuto)  
- `docs/RBAC.md` se nuovo permesso  
- Questo playbook se hai scoperto un **anti-pattern** ricorrente → proponi patch a `walkthrough/MID-LEVEL/`

---

## 10.6 Checklist “sono pronto per Senior?”

Sei Mid-Level autonomo quando, **senza** chiedere ogni passo:

1. Consegni feature E2E in un sprint con checklist completa  
2. Le tue PR hanno pochi round di review  
3. Sai spiegare il flusso auth + RBAC su un whiteboard  
4. Debugghi 409 e 403 da solo con DevTools  
5. Scrivi SQL parametrizzato e migration idempotenti

---

## 10.7 Risorse interne

| Argomento | Percorso |
|-----------|----------|
| Backend profondo | [walkthrough/BACKEND/00-INDICE.md](../BACKEND/00-INDICE.md) |
| Frontend profondo | [walkthrough/frontend/00-INDICE.md](../frontend/00-INDICE.md) |
| RBAC | `docs/RBAC.md` |
| Metodo feature E2E | [Capitolo 1](./cap01-metodo-jeins-feature-end-to-end.md) |

---

*Capitolo 10 — v2*
