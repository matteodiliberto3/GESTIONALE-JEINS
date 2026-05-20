# Capitolo 9 — PR, review e test

---

## 9.1 Definition of Done (Mid-Level)

Prima di aprire la PR, verifica [Capitolo 1 — Metodo JEINS](./cap01-metodo-jeins-feature-end-to-end.md):

- [ ] Migration in `backend/database/` registrata in `MIGRATION_FILES` + `cd backend && npm run migrate:all`
- [ ] Route montata in `app.js`
- [ ] `services/api.ts` + hook + `queryKeys`
- [ ] RBAC backend **e** `RequirePermission` UI
- [ ] Loading + errori in Page
- [ ] Messaggi utente nuovi in **italiano** (label, toast, errori in UI)
- [ ] Modali/form toccati: **tab order** coerente (primo campo → Salva/Annulla), chiusura ESC se supportata, focus visibile non rimosso
- [ ] Mock dev disattivato; nessun dato finto committato nel `queryFn` (vedi [Cap. 8 §5.4](./cap08-react-query-chiavi-cache.md#54-mock-solo-dev))
- [ ] Nessun segreto in commit (`.env` fuori da git)
- [ ] `cd gestionale-app && npm test` (Vitest) + `npm run build` senza errori TS
- [ ] `cd backend && npm test` verde se hai toccato `lib/` o `services/`

---

## 9.2 Dimensione PR

| Tipo | Linee guida |
|------|-------------|
| Feature E2E piccola | 1 dominio, migration + BE + FE insieme |
| Refactor | PR separata, **zero** comportamento nuovo |
| Fix urgente | solo file necessari |

❌ Junior: PR “WIP tutto il gestionale” con 40 file non correlati.

✅ Mid-Level: titolo tipo `feat(clients): filtro per area su lista clienti`.

---

## 9.3 Descrizione PR (template mentale)

```markdown
## Cosa
Breve descrizione funzionale.

## Perché
Ticket / contesto business.

## Come testare
1. Login come Responsabile IT
2. Vai su /clients
3. …

## Note
Migration `00X_foo.sql` — eseguire prima del deploy.
```

---

## 9.4 Self-review (prima di chiedere review)

Leggi il diff come se fossi il Tech Lead:

1. **Sicurezza:** ruolo/area validati sul server?  
2. **SQL:** solo parametri `$1`?  
3. **Cache:** `invalidateQueries` con chiave giusta?  
4. **UX:** stati loading/error/409? Messaggi utente in italiano?  
5. **A11y (se modali/form):** tab order, focus trap/ESC su `AppModal`/`Modal`, niente `outline-none` senza alternativa  
6. **Mock:** PR testata senza mock dev attivo?  
7. **Dead code:** `console.log`, import inutili, commenti TODO senza ticket?

---

## 9.5 Test in questo repo

| Livello | Comando | Quando |
|---------|---------|--------|
| Backend unit | `cd backend && npm test` | logica in `lib/`, `services/` |
| Frontend unit (Vitest) | `cd gestionale-app && npm test` | ogni PR FE; obbligatorio se tocchi `lib/`, hook, utils testabili |
| Frontend watch | `cd gestionale-app && npm run test:watch` | sviluppo TDD locale |
| Frontend build | `cd gestionale-app && npm run build` | ogni PR FE (typecheck + bundle) |
| E2E Playwright | `cd gestionale-app && npm run test:e2e` | smoke in `e2e/` — **non obbligatorio** su ogni PR piccola; usalo se tocchi routing/auth critico o il reviewer lo chiede |
| Manuale | browser + due utenti per 409 | update con `version` |

**Copertura attuale (non aspettarti una suite piena):** pochi test Vitest (es. `src/lib/api/client.test.ts`) e smoke Playwright (`e2e/smoke.spec.ts`). Il Mid-Level **aggiunge** test unit quando introduce logica non banale in `lib/` o utils; per il resto documenta **passi manuali** nella PR.

❌ Junior: solo `npm run build` e zero `npm test` in `gestionale-app` con logica nuova in `lib/`.  
✅ Mid-Level: build + Vitest verde; E2E Playwright se la feature impatta login o navigazione globale.

---

## 9.6 Commenti del reviewer

| Commento | Azione |
|----------|--------|
| “Usa middleware esistente” | refactor, non duplicare check |
| “Chiave query centralizzata” | `queryKeys` |
| “409?” | aggiungi `useConflictUpdate` |
| “Nit: naming” | fix veloce, non dibattere |

❌ Junior: rispondere “funziona sulla mia macchina” senza riprodurre i passi del reviewer.

---

## 9.7 Commit

Messaggi chiari, in italiano o inglese coerente col repo:

```
feat(clients): aggiunge filtro per area in GET /api/clients
```

Niente trailer promozionali verso tool AI (regola team).

---

*Capitolo 9 — v2*
