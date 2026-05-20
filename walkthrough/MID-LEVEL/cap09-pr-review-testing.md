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
- [ ] Mock dev disattivato; nessun dato finto committato nel `queryFn` (vedi [Cap. 8 §8.4](./cap08-react-query-chiavi-cache.md#84-mock-solo-dev---cosa-sono-e-cosa-non-committare))
- [ ] Nessun segreto in commit (`.env` fuori da git)
- [ ] `cd gestionale-app && npm test` (Vitest) + `npm run build` senza errori TS
- [ ] `cd gestionale-app && npm run lint` se hai modificato file in `src/` (ESLint — vedi §9.5)
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

Ogni comando verifica qualcosa di **diverso**. Il neofita spesso esegue solo `npm run dev` e dice “funziona” — in review chiediamo almeno build + test dove applicabile.

| Livello | Comando | Cosa controlla | Quando è obbligatorio |
|---------|---------|----------------|------------------------|
| Backend unit | `cd backend && npm test` | Logica in `lib/`, `services/` (Jest) | Hai toccato regole business server |
| Frontend unit | `cd gestionale-app && npm test` | Vitest — es. `lib/api/client.test.ts` | Ogni PR che modifica `lib/`, utils, hook testabili |
| Frontend watch | `cd gestionale-app && npm run test:watch` | Riesegue test al salvataggio | Mentre scrivi nuovi test |
| Frontend build | `cd gestionale-app && npm run build` | `tsc` + bundle Vite — errori di tipo | **Ogni** PR frontend |
| Frontend lint | `cd gestionale-app && npm run lint` | ESLint su `src/` — stile, hook rules, import | PR che tocca `src/` (evita warning evitabili in review) |
| E2E Playwright | `cd gestionale-app && npm run test:e2e` | Smoke browser in `e2e/` | Opzionale su PR piccole; consigliato se tocchi login, router, shell |
| Manuale browser | due tab, stesso record, due save | Conflitto **409** e `ConflictDialog` | Ogni form di modifica con `version` |
| Manuale RBAC | DevTools Network + utente senza permesso | **403** su API, non solo UI | Feature con permessi nuovi ([Cap. 4 §4.2](./cap04-auth-rbac-blindare-feature.md#42-test-manuale-rbac-in-30-secondi-obbligatorio-prima-della-pr)) |

### Cosa c’è oggi nel repo (aspettative realistiche)

- **Vitest:** pochi file (es. `src/lib/api/client.test.ts`) — non c’è ancora un test per ogni Page.
- **Playwright:** `e2e/smoke.spec.ts` — smoke minimo, non copre tutti i domini.
- **Backend:** suite Jest su moduli critici — estendi quando aggiungi logica non banale.

**Il Mid-Level aggiunge** test quando introduce funzioni pure (validazione, merge conflitti, paginazione). Per il resto, la sezione **“Come testare”** nella descrizione PR deve essere **passo-passo** (con quale utente, quale URL, cosa aspettarsi).

### Sequenza consigliata prima di `git push`

```bash
cd backend && npm test          # se hai toccato backend
cd gestionale-app && npm test   # Vitest
cd gestionale-app && npm run lint
cd gestionale-app && npm run build
```

❌ **Junior:** solo `npm run build`, zero `npm test`, PR con “testato a occhio”.  
✅ **Mid-Level:** build verde + Vitest verde + lint senza errori nuovi + passi manuali scritti nella PR.

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

*Capitolo 9 — v3*
