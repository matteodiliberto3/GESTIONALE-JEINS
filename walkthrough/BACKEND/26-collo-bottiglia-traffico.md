# Capitolo 26 — Collo di bottiglia sotto traffico ×100

---

## 26.1 Matrice

| Componente | Sintomo | Prima misura |
|------------|---------|--------------|
| Postgres pool | timeout acquire, 53300 | pool stats, `max` |
| `loadUser` | CPU ok, DB alto | query count/request |
| N+1 liste | latenza lineare con N | EXPLAIN, 2-query rule |
| Event loop | CPU 100% | profilo, ridurre sync work |
| Log stdout | latenza tail | Pino, sample |

---

## 26.2 Scaling

Stateless API → scale repliche Render; **condizione:** niente stato dominio in RAM (eccezione documentata `last_seen`).

---

## 26.3 Cache Redis

**Assente.** Candidati: session role cache, rate limit globale — **non** cache liste business senza invalidazione.

---

## 26.4 Coda

Vedi Cap. 3 — email, webhook, export devono uscire dal request path.

---

*Capitolo 26 — v1*
