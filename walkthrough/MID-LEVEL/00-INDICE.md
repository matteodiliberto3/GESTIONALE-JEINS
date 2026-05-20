# Mid-Level Developer Playbook — Gestionale JEINS

**Ruolo del documento:** portare un Junior (sintassi React + Node base) a **Mid-Level autonomo** su feature **end-to-end**, seguendo le convenzioni **reali** di questa repository.

**Non sostituisce:**
- [Manuale Backend](../BACKEND/00-INDICE.md) — architettura e profondità server
- [Manuale Frontend](../frontend/00-INDICE.md) — teoria UI e trade-off

**Quando usare quale manuale**

| Obiettivo | Leggi |
|-----------|--------|
| Consegnare una feature (migration, API, Page, PR) | Questo playbook, Cap. 0 → 1 → 2–5 → 9 |
| Capire *perché* React Query / RBAC / design system | [frontend](../frontend/00-INDICE.md) (teoria e trade-off) |
| Capire *perché* pool, transazioni, async, scala | [BACKEND](../BACKEND/00-INDICE.md) |

---

## Struttura cartella (fonte unica)

In `walkthrough/MID-LEVEL/` ci sono **solo**:

- `00-INDICE.md` — indice e DoD globale  
- `cap00-…` … `cap10-…` — capitoli (il numero nel nome = **Capitolo** nel titolo)

Non usare path legacy (`01-onboarding-…`, `02-metodo-…`, `06-auth-rbac-permessi.md`, ecc.): sono stati rimossi per evitare doppioni. Aggiorna eventuali link esterni a `capNN-`.

---

## Numerazione unica (Capitolo 0 → 10)

I file usano il prefisso `capNN-` allineato al **numero di capitolo** nel titolo.  
Segui **solo** la colonna *Cap.* — non il vecchio ordinamento dei nomi file.

| Cap. | File | Contenuto |
|------|------|-----------|
| **0** | [cap00-onboarding-mappa-repo.md](./cap00-onboarding-mappa-repo.md) | Setup, mappa repo, comandi |
| **1** | [cap01-metodo-jeins-feature-end-to-end.md](./cap01-metodo-jeins-feature-end-to-end.md) | **Metodo JEINS** — feature E2E (DB → lib → route → FE) |
| **2** | [cap02-uccidere-useeffect-react-query.md](./cap02-uccidere-useeffect-react-query.md) | React Query — niente fetch in `useEffect` |
| **3** | [cap03-gestione-conflitti-dati-concorrenti.md](./cap03-gestione-conflitti-dati-concorrenti.md) | Optimistic locking, 409, `useConflictUpdate` |
| **4** | [cap04-auth-rbac-blindare-feature.md](./cap04-auth-rbac-blindare-feature.md) | Auth, cookie JWT, RBAC, `RequirePermission` |
| **5** | [cap05-ui-design-system-tailwind-motion.md](./cap05-ui-design-system-tailwind-motion.md) | Tailwind, `cn`, `components/ui`, motion |
| **6** | [cap06-backend-route-e-sql.md](./cap06-backend-route-e-sql.md) | *Appendice* — route, middleware, SQL |
| **7** | [cap07-frontend-pages-hooks-ui.md](./cap07-frontend-pages-hooks-ui.md) | *Appendice* — Page, View, hooks |
| **8** | [cap08-react-query-chiavi-cache.md](./cap08-react-query-chiavi-cache.md) | *Appendice* — `queryKeys`, cache avanzata |
| **9** | [cap09-pr-review-testing.md](./cap09-pr-review-testing.md) | PR, review, test |
| **10** | [cap10-quando-escalare.md](./cap10-quando-escalare.md) | Quando escalare al Tech Lead |

### Percorso consigliato

```
Cap 0 (setup) → Cap 1 (ogni feature) → Cap 2 + 3 (dati FE) → Cap 4 (se tocca permessi) → Cap 5 (UI)
Cap 6–8 = approfondimenti su richiesta · Cap 9 prima della PR · Cap 10 se bloccato
```

### Primo giorno vs prima feature

| Giorno | Obiettivo | Capitoli |
|--------|-----------|----------|
| 1 | Avviare repo, tracciare **Clienti** end-to-end | [Cap. 0](./cap00-onboarding-mappa-repo.md) — **non** cercare Rimborsi Spese nel codice |
| 2–3 | Leggere metodo e React Query | [Cap. 1](./cap01-metodo-jeins-feature-end-to-end.md), [Cap. 2](./cap02-uccidere-useeffect-react-query.md) |
| 4+ | Prima modifica guidata dal team (campo piccolo su dominio esistente) | Cap. 1 + [Cap. 9](./cap09-pr-review-testing.md) |

### Stack e test (riferimento rapido)

| Parte | Tecnologia | Verifica in PR |
|-------|------------|----------------|
| Frontend | React 19, Vite, TanStack Query, Tailwind | `npm test`, `npm run lint`, `npm run build` |
| Backend | Express (ESM), `pg`, Zod | `npm test` se tocchi `lib/` |
| E2E | Playwright (smoke) | Opzionale — `npm run test:e2e` |
| DB | PostgreSQL + `migration_*.sql` | `npm run migrate:all` in locale |

### Glossario minimo (leggi una volta)

| Termine | Significato in JEINS |
|---------|----------------------|
| **Page** | Componente che orchestra hook, modali, permessi (`pages/`) |
| **View** | UI che riceve solo props (`views/`) |
| **Server state** | Dati dal backend — vivono in React Query, non in `useState` |
| **queryKey** | Etichetta cache — definita solo in `lib/query/keys.ts` |
| **invalidate** | “Segna dati vecchi” dopo un save — lista si aggiorna |
| **version** | Numero intero per optimistic locking — vedi [Cap. 3](./cap03-gestione-conflitti-dati-concorrenti.md) |
| **409** | Conflitto di modifica — aprire `ConflictDialog`, non toast generico |
| **Socio / area** | Concetti RBAC — matrice in `docs/RBAC.md` |
| **Mid-Level** | Consegna feature E2E con checklist Cap. 9 senza istruzioni passo-passo dal lead |

---

## Convenzioni di lettura

| Simbolo | Significato |
|---------|-------------|
| ❌ **Junior** | pattern che non mergiamo |
| ✅ **Mid-Level** | pattern atteso in PR |
| 📁 | path reale nel repo |

---

## Convenzioni progetto (JEINS)

| Tema | Regola |
|------|--------|
| **Messaggi utente (i18n)** | Testi visibili all’utente (UI, toast, `NoticeProvider`, label form, messaggi `AppError` mostrati in FE) in **italiano**, tono professionale e chiaro. Codice, log, commenti e nomi API in inglese/camelCase come nel resto del repo. Non introdurre librerie i18n senza accordo Tech Lead. |
| **Mock dati (solo dev)** | Attivabile da `localStorage` / pannello dev (`shouldUseMockData` in `lib/api/client.ts`). Mai in produzione. Prima della PR: disattiva mock e verifica contro API reale — [Cap. 8 §8.4](./cap08-react-query-chiavi-cache.md#84-mock-solo-dev---cosa-sono-e-cosa-non-committare). |
| **Accessibilità minima** | Modali e form: tab order logico, chiusura ESC dove il componente lo supporta, `:focus-visible` non rimosso — [Cap. 9 DoD](./cap09-pr-review-testing.md#91-definition-of-done-mid-level). |

---

## Definition of Done — feature Mid-Level

- [ ] Migration SQL in `backend/database/` + voce in `MIGRATION_FILES` (`scripts/run-sql-migrations.js`)
- [ ] `cd backend && npm run migrate:all` eseguito in locale
- [ ] Route backend: `authenticateToken` + RBAC + SQL parametrizzato + `next(error)`
- [ ] `services/api.ts` + `queryKeys` + hook
- [ ] Page sottile + View presentazionale
- [ ] `RequirePermission` + `resolvePermissions` su route e azioni sensibili
- [ ] Loading / errori ([Cap. 2](./cap02-uccidere-useeffect-react-query.md)); 409 se `version` ([Cap. 3](./cap03-gestione-conflitti-dati-concorrenti.md))
- [ ] `docs/RBAC.md` aggiornato se cambiano permessi
- [ ] Messaggi utente nuovi in italiano (convenzione i18n)
- [ ] Modali/form toccati: tab order e focus visibile verificati a mano
- [ ] Mock dev disattivato; nessun bypass mock nel codice committato
- [ ] `npm test` in `backend` (se tocchi `lib/`) + `cd gestionale-app && npm test` + `npm run lint` + `npm run build` senza errori

### Migrazioni — comando ufficiale

| ❌ Non usare come flusso standard | ✅ Usare |
|----------------------------------|----------|
| `node scripts/run-migration.cjs <file>` (singolo file, debug) | Registrare in `MIGRATION_FILES` + `npm run migrate:all` |

`migrate:all` esegue `migrate.js` + `migrate_v2.js` + `run-sql-migrations.js` (vedi `backend/package.json`).

---

*Playbook v3 — appendici esaustive, glossario, test/lint, template escalation — maggio 2026*
