# Appendici — Architecture & Engineering Manual

---

## Appendice A — Mappa file → responsabilità

| Path | Responsabilità |
|------|----------------|
| `server.js` | Avvio HTTP, test connessione |
| `app.js` | Factory Express, middleware, mount route |
| `routes/*.js` | Adapter HTTP per dominio |
| `services/authService.js` | Login, register |
| `lib/*.js` | Policy, token, pagination, access |
| `middleware/*.js` | Auth, rate limit, log |
| `validators/*.js` | Zod schemi |
| `database/schema.sql` | Bootstrap |
| `database/migration_*.sql` | Evoluzione incrementale |
| `scripts/run-sql-migrations.js` | Runner migrazioni |
| `test/*.js` | Test Node |

---

## Appendice B — Endpoint

Catalogo completo: **`docs/backend/API-Endpoints.md`**

---

## Appendice C — RBAC

Matrice: **`docs/RBAC.md`**

---

## Appendice D — Glossario

Ruoli, aree, stati: **`docs/GLOSSARY.md`**

---

## Appendice E — Checklist Senior review (merge)

- [ ] Cap. 1 §1.9 — bordo HTTP  
- [ ] Cap. 2 §2.8 — dati e migrazioni  
- [ ] Cap. 3 checklist — async/idempotenza  
- [ ] Cap. 4 checklist — pagamenti futuri  
- [ ] Cap. 5 checklist — logging  
- [ ] Cap. 7 — permesso esplicito su write  
- [ ] Cap. 11–20 — query count su liste  

---

## Appendice F — Ordine migrazioni SQL

Ordine in `backend/scripts/run-sql-migrations.js` → `MIGRATION_FILES`:

1. `migration_000_shared_functions.sql`  
2. `migration_add_last_seen.sql`  
3. `migration_add_version_optimistic_locking.sql`  
4. `migration_tasks_and_assignments.sql`  
5. `migration_advanced_events.sql`  
6. `migration_event_reports_and_polls.sql`  
7. `migration_hr_recruiting.sql`  
8. `migration_poll_heatmap_mode.sql`  
9. `migration_roles_manager.sql`  
10. `migration_fix_polls_updated_at_triggers.sql`  

Bootstrap iniziale: `npm run migrate` → `schema.sql` poi `migrate:sql`.

---

*Appendici — v1*
