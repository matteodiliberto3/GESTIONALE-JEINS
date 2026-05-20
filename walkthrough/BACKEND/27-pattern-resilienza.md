# Capitolo 27 — Pattern di resilienza

---

## 27.1–27.4 Stato JEINS

| Pattern | Stato |
|---------|-------|
| Retry verso DB | fail fast |
| Circuit breaker | assente |
| DLQ / job | target Cap. 3, **N/A** repo |
| Idempotenza POST | gap su creazioni critiche |

---

## 27.5 Trade-off

Team piccolo: preferire **semplicità** finché SLO non violati; introdurre coda + idempotenza su **primo** side-effect esterno (email, Stripe).

---

*Capitolo 27 — v1*
