# Capitolo 25 — Osservabilità operativa (supplemento)

> **Contenuto principale:** [Cap. 5 — Osservabilità e telemetria](./05-osservabilita-telemetria.md)  
> **Runbook:** `docs/TROUBLESHOOTING.md`, `docs/MONITORING.md`

---

Questo capitolo **non duplica** il Cap. 5: collega telemetria target a operazioni quotidiane.

## 25.1 Stato vs aspirazione

| Doc | Stato |
|-----|-------|
| Cap. 5 manuale | design Pino, correlation, alert |
| `docs/MONITORING.md` | aspirazionale |
| Codice | `console.*`, `requestLog` testuale |

## 25.2 Metriche minime da introdurre

- p95 latency per route  
- error rate 5xx  
- `pool.waitingCount`  
- (futuro) `payment_reconcile_required`  

## 25.3 Incident response

1. Identificare `correlation_id` (quando implementato)  
2. Query log per route + status  
3. Controllare `/health` e Postgres Render  
4. Runbook in `docs/TROUBLESHOOTING.md`

---

*Capitolo 25 — v1 (ponte a Cap. 5)*
