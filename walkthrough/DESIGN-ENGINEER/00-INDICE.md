# Design Engineer Playbook — Gestionale JEINS

**Pubblico:** studente universitario / junior che sa già montare componenti React, ma deve imparare a **ragionare** su UI di produzione: gerarchia visiva, stati, accessibilità, motion con criterio, composizione sul design system esistente.

**Non è:**
- tutorial di sintassi React / Tailwind;
- walkthrough riga-per-riga dell’intero repo;
- manuale infra backend / deploy (→ [BACKEND](../BACKEND/00-INDICE.md), `docs/`);
- sostituto del playbook operativo Mid-Level (→ [MID-LEVEL](../MID-LEVEL/00-INDICE.md)).

**È:** un percorso in stile *craft intenzionale* (chiarezza, ritmo, restraint) — come una review senior onesta, non documentazione enciclopedica.

**In uscita sai:**
- progettare e rifinire feature visive JEINS in autonomia;
- spiegare trade-off (token vs one-off, animare vs statico, nascondere vs disabilitare);
- sapere quando escalare ([MID-LEVEL cap10](../MID-LEVEL/cap10-quando-escalare.md), arch backend).

**Expertise:** da **pre-design-engineer** (React ok, craft UI assente) a **design engineer junior–mid sul prodotto JEINS** — non senior full-stack né lead design systems globale.

Hub ingresso tutti i track: [00-PERCORSI.md](../00-PERCORSI.md).

---

## PRE-DE-A e PRE-DE-B (ordine di lettura)

| Blocco | Cartella / file | Quando |
|--------|-----------------|--------|
| **PRE-DE-A** | [FOUNDATIONS/](../FOUNDATIONS/00-INDICE.md) | Mai git/React/HTTP in repo reale — **prima** di questo playbook |
| **PRE-DE-B** | [cap00-pre-de-b-fondamenta-design-engineering.md](./cap00-pre-de-b-fondamenta-design-engineering.md) | Zero design engineering — **prima** della mappa UI |
| **Cap 0 (mappa)** | [cap00-come-usare-mappa-ui.md](./cap00-come-usare-mappa-ui.md) | Dopo PRE-DE-B (o in parallelo se già orientato) |

```
[PRE-DE-A opzionale] → PRE-DE-B → cap00 mappa → cap1…10
```

Se hai già completato [MID-LEVEL cap00](../MID-LEVEL/cap00-onboarding-mappa-repo.md), PRE-DE-A cap03 è ridondante — salta a PRE-DE-B.

---

## Quando usare quale manuale

| Obiettivo | Leggi |
|-----------|--------|
| **Perché** una scelta UI / architettura FE | [frontend](../frontend/00-INDICE.md) (moduli 1–7) |
| **Come** consegnare feature E2E (DB → API → Page → PR) | [MID-LEVEL](../MID-LEVEL/00-INDICE.md) — cap01, cap04, cap05, cap09 |
| **Craft visivo** su codice reale JEINS | **Questo playbook** |
| Pool, transazioni, RBAC server | [BACKEND](../BACKEND/00-INDICE.md), `docs/RBAC.md` |

---

## Overlap intenzionale (non duplicare la lettura)

Stessi temi, profondità diversa. Usa **una** colonna come fonte primaria; le altre sono approfondimento o checklist operativa.

| Tema | Fonte primaria (craft / decisione) | Operativo JEINS | Teoria / architettura |
|------|-----------------------------------|-----------------|------------------------|
| Token, `index.css`, Tailwind | **DE cap02** | [MID-LEVEL cap05](../MID-LEVEL/cap05-ui-design-system-tailwind-motion.md) | [frontend mod.7](../frontend/07-design-system-e-componenti.md) |
| Primitivi `components/ui/`, `cn` | **DE cap03** | MID-LEVEL cap05 (esempi rapidi) | frontend mod.7 |
| Page vs View, shell | **DE cap04** | [MID-LEVEL cap07](../MID-LEVEL/cap07-frontend-pages-hooks-ui.md) | [frontend mod.2–5](../frontend/00-INDICE.md) |
| Stati loading/empty/error | **DE cap05** | MID-LEVEL cap02 (dati) | [frontend mod.6](../frontend/06-concorrenza-integrita-e-errori.md) |
| Motion, `presets.ts` | **DE cap06** | MID-LEVEL cap05 § motion | frontend mod.7 |
| Form, `AppModal` | **DE cap07** | MID-LEVEL cap01 (CRUD E2E) | — |
| RBAC in UI | **DE cap08** | [MID-LEVEL cap04](../MID-LEVEL/cap04-auth-rbac-blindare-feature.md) | [frontend mod.3](../frontend/03-autenticazione-sessione-e-permessi-ui.md) |
| Review / PR UI | **DE cap09** | [MID-LEVEL cap09](../MID-LEVEL/cap09-pr-review-testing.md) | — |
| Capstone + ADR visivo | **DE cap10** + [capstone/](./capstone/README.md) | — | — |
| Git, React, HTTP (neofita) | — | — | [FOUNDATIONS](../FOUNDATIONS/00-INDICE.md) |

**Regola:** se sei su DESIGN-ENGINEER cap N, non saltare a MID-LEVEL cap05 per lo stesso argomento nello stesso giorno — consolidare con l’esercizio del cap DE.

---

## Struttura cartella

In `walkthrough/DESIGN-ENGINEER/`:

- `00-INDICE.md` — percorso, prerequisiti, link incrociati  
- `cap00-…` … `cap10-…` — capitoli (prefisso `capNN` = numero capitolo)
- `capstone/` — template ADR visivo per [cap10](./cap10-capstone-rifare-schermata.md) (opzionale in repo, non in produzione)

Schema fisso di ogni capitolo:

1. **Contesto** — problema visivo / UX in JEINS  
2. **Codice ancoraggio** — estratti brevi da `gestionale-app/src/`  
3. **Alternative scartate** — cosa non fare e perché  
4. **Trade-off** — guadagni e costi  
5. **Esercizio valutabile** — deliverable verificabile  
6. **Limiti nel repo** — debito noto, eccezioni

---

## Prerequisiti

| Assunto | Dove colmare il gap |
|---------|---------------------|
| Git, React, HTTP, avvio repo (zero pratico) | [FOUNDATIONS PRE-DE-A](../FOUNDATIONS/00-INDICE.md) |
| Fondamenta design (gerarchia, stati, feedback) | [PRE-DE-B](./cap00-pre-de-b-fondamenta-design-engineering.md) |
| React 19, TypeScript, hook base | FOUNDATIONS cap01 o corso uni — non ripetuto qui |
| Avvio repo, `npm run dev` | [MID-LEVEL cap00](../MID-LEVEL/cap00-onboarding-mappa-repo.md) o FOUNDATIONS cap03 |
| React Query, invalidate | [MID-LEVEL cap02](../MID-LEVEL/cap02-uccidere-useeffect-react-query.md), [cap08](../MID-LEVEL/cap08-react-query-chiavi-cache.md) |
| RBAC e `RequirePermission` | [MID-LEVEL cap04](../MID-LEVEL/cap04-auth-rbac-blindare-feature.md), `docs/RBAC.md` |
| Teoria Page / View / shell | [frontend mod. 2–5](../frontend/00-INDICE.md) |

**Convenzioni progetto (obbligatorie in PR UI):**

- Messaggi utente in **italiano** (toast, empty, label form).
- Token colore `surface` / `ink` / `line` — no hex sparsi in feature.
- Mock solo dev — [MID-LEVEL cap08 §8.4](../MID-LEVEL/cap08-react-query-chiavi-cache.md#84-mock-solo-dev---cosa-sono-e-cosa-non-committare).

---

## Percorso consigliato (4–6 settimane)

| Settimana | Focus | Capitoli | Deliverable |
|-----------|--------|----------|-------------|
| **1** | PRE-DE-B + mappa UI + filosofia | [PRE-DE-B](./cap00-pre-de-b-fondamenta-design-engineering.md), [0](./cap00-come-usare-mappa-ui.md), [1](./cap01-filosofia-design-engineer.md) | Esercizio gerarchia/stati; diagramma shell; vincoli B2B |
| **2** | Token, primitivi, composizione | [2](./cap02-token-tipografia-spaziatura.md), [3](./cap03-primitivi-composizione.md) | Refactor visivo di un widget esistente senza nuovi colori |
| **3** | Layout, stati, feedback | [4](./cap04-layout-information-architecture.md), [5](./cap05-stati-feedback.md) | Stati loading/empty/error coerenti su una lista |
| **4** | Motion + form/modali | [6](./cap06-motion.md), [7](./cap07-form-modali.md) | Motion solo da `presets.ts`; un form CRUD allineato |
| **5** | RBAC UI + review | [8](./cap08-rbac-ui-difensiva.md), [9](./cap09-review-ui-checklist-pr.md) | Checklist PR compilata su branch reale |
| **6** | Capstone | [10](./cap10-capstone-rifare-schermata.md) | Redesign documentato di una schermata esistente |

```
[PRE-DE-A?] → PRE-DE-B → Cap 0 mappa → 1 (mindset) → 2 → 3 (sistema visivo) → 4 → 5 (IA + stati)
            → 6 → 7 (polish + form) → 8 → 9 (sicurezza UI + review) → 10 (capstone)
```

Parallelo consigliato: mentre studi cap 2–5, segui [MID-LEVEL cap01](../MID-LEVEL/cap01-metodo-jeins-feature-end-to-end.md) sulla prima feature piccola del team.

---

## Tabella capitoli

| Cap. | File | Contenuto |
|------|------|-----------|
| **PRE-DE-B** | [cap00-pre-de-b-fondamenta-design-engineering.md](./cap00-pre-de-b-fondamenta-design-engineering.md) | Gerarchia, affordance, stati, restraint — zero craft precedente |
| **0** | [cap00-come-usare-mappa-ui.md](./cap00-come-usare-mappa-ui.md) | Manuale, mappa `gestionale-app/src`, source of truth |
| **1** | [cap01-filosofia-design-engineer.md](./cap01-filosofia-design-engineer.md) | Design engineer vs “solo CSS”; vincoli B2B, team piccolo, Render, no SSR |
| **2** | [cap02-token-tipografia-spaziatura.md](./cap02-token-tipografia-spaziatura.md) | `index.css`, `tailwind.config.js`, gerarchia tipografica |
| **3** | [cap03-primitivi-composizione.md](./cap03-primitivi-composizione.md) | `components/ui/`, `cn`, varianti, barrel export |
| **4** | [cap04-layout-information-architecture.md](./cap04-layout-information-architecture.md) | `AppShell`, `IconRail`, Page vs View, URL vs `activeView` |
| **5** | [cap05-stati-feedback.md](./cap05-stati-feedback.md) | Skeleton, `EmptyState`, errori, toast / notice |
| **6** | [cap06-motion.md](./cap06-motion.md) | `motion/presets.ts`, `useReducedMotion`, quando non animare |
| **7** | [cap07-form-modali.md](./cap07-form-modali.md) | `AppModal`, `features/forms/modals.tsx`, pattern CRUD |
| **8** | [cap08-rbac-ui-difensiva.md](./cap08-rbac-ui-difensiva.md) | `RequirePermission`, disabilitato vs nascosto, menu |
| **9** | [cap09-review-ui-checklist-pr.md](./cap09-review-ui-checklist-pr.md) | Review UI, a11y pragmatica, regressioni visive |
| **10** | [cap10-capstone-rifare-schermata.md](./cap10-capstone-rifare-schermata.md) | Rifare una schermata — ADR: [capstone/TEMPLATE-ADR-VISIVO.md](./capstone/TEMPLATE-ADR-VISIVO.md) |

---

## Source of truth rapida (UI)

| Tema | Path |
|------|------|
| Token CSS + classi componenti | `gestionale-app/src/index.css` |
| Mappa Tailwind | `gestionale-app/tailwind.config.js` |
| Primitivi UI | `gestionale-app/src/components/ui/` |
| `cn` | `gestionale-app/src/utils/cn.ts` |
| Shell | `gestionale-app/src/layout/AppShell.tsx` |
| Router + guard | `gestionale-app/src/app/router.tsx`, `RequirePermission.tsx` |
| Permessi | `gestionale-app/src/lib/permissions.ts` |
| Motion | `gestionale-app/src/motion/` |
| Modale CRUD | `gestionale-app/src/components/AppModal.tsx` |
| Template Page | `gestionale-app/src/pages/ClientsPage.tsx` |
| RBAC doc | `docs/RBAC.md` |

---

## Definition of Done — design engineer JEINS

- [ ] Nessun colore/layout one-off se esiste token o primitivo
- [ ] Loading / empty / error espliciti (non schermo bianco)
- [ ] `prefers-reduced-motion` rispettato su animazioni nuove
- [ ] Azioni senza permesso: nascoste **o** disabilitate con motivo — coerente col modulo
- [ ] Testi utente in italiano
- [ ] Cap 9 checklist compilata prima della PR
- [ ] Se tocchi permessi: `docs/RBAC.md` + [MID-LEVEL cap04](../MID-LEVEL/cap04-auth-rbac-blindare-feature.md)

---

*Playbook Design Engineer v2 — maggio 2026*
