# Capitolo 9 — Review UI e checklist PR

---

## Contesto

Un design engineer JEINS in uscita **reviewa** come un senior: non chiede “ti piace il verde?” ma “gerarchia leggibile? stati espliciti? regressione tema scuro? permesso coerente?”.

Questo capitolo allinea la checklist visiva a [MID-LEVEL cap09](../MID-LEVEL/cap09-pr-review-testing.md) — qui focus **UI/a11y/regressioni visive**, lì DoD E2E completo.

---

## Mindset review (craft)

1. **Prima scansione 5 secondi** — capisco dove guardare e qual è l’azione primaria?  
2. **Stati** — loading/empty/error provati mentalmente.  
3. **Token** — diff colori: sospetto hex e `gray-*` nuovi.  
4. **Motion** — c’è rispetto reduced motion?  
5. **Permessi** — menu + CTA + route allineati?  
6. **Copy** — italiano, tono professionale.  

---

## Checklist PR — UI (copia in descrizione PR)

### Gerarchia e layout

- [ ] Un focal point per schermata; CTA primaria non compete con sidebar
- [ ] Spaziatura coerente (`gap-4`/`gap-6`, padding `main` rispettato)
- [ ] Nessun overflow orizzontale su viewport 1280px e mobile ragionevole
- [ ] View senza fetch; stati in Page

### Token e componenti

- [ ] Colori: `surface` / `ink` / `line` / `primary` — no palette parallela
- [ ] Nuovi stili usano `cn` e primitivi `components/ui/`
- [ ] Nessun primitivo duplicato (secondo `Button` custom)

### Stati e feedback

- [ ] Loading non è schermo vuoto (`Skeleton`/`Spinner` o equivalente)
- [ ] Lista vuota → `EmptyState` o pattern equivalente
- [ ] Errori rete con messaggio IT; 409 → conflict flow, non toast generico
- [ ] Submit: `isLoading` / `disabled` anti doppio click

### Motion

- [ ] Nuove animazioni usano `motion/presets.ts`
- [ ] `useReducedMotion` o CSS `prefers-reduced-motion` applicato
- [ ] Nessuna animazione su liste > ~50 righe senza motivo

### Form e modali

- [ ] CRUD usa `AppModal` + form in `features/forms/` se dominio esistente
- [ ] Chiusura con `aria-label` su bottone X
- [ ] Tab order logico; `:focus-visible` non rimosso

### RBAC e sicurezza UI

- [ ] Route protetta con `RequirePermission` se nuovo modulo
- [ ] Menu/CTA coerenti con `docs/RBAC.md`
- [ ] Mock dev disattivato per demo review

### Accessibilità pragmatica (baseline JEINS)

- [ ] Contrasto testo principale su `surface` accettabile (tema chiaro + scuro)
- [ ] Icone decorative `aria-hidden` dove serve
- [ ] Controlli icon-only hanno nome accessibile (`aria-label` o testo visibile)
- [ ] `SkipLink` non rimosso da layout globali
- [ ] Non usare solo colore per stato critico (aggiungere testo/icona)

### Verifica tecnica

- [ ] `cd gestionale-app && npm run lint && npm run build`
- [ ] Screenshot prima/dopo allegati per cambi visivi significativi
- [ ] Tema chiaro **e** scuro controllati manualmente

---

## Regressioni visive — cosa guardare nel diff

| Segnale nel diff | Rischio |
|-----------------|---------|
| `className` lunghissimo in View | class soup, merge errori |
| Rimozione `dark:` variant | regressione tema scuro |
| `z-index` nuovo | modale sotto overlay |
| Cambio `max-w-*` modale | form tagliati su laptop |
| Import `framer-motion` in Page | sposta in wrapper motion |

**Strumenti:** occhio + build; opzionale Playwright smoke se il team lo richiede ([MID-LEVEL cap09](../MID-LEVEL/cap09-pr-review-testing.md)).

---

## Come dare feedback (stile review senior)

| ❌ Feedback vago | ✅ Feedback actionable |
|-----------------|------------------------|
| “Non mi piace” | “CTA secondaria compete con primaria — usa `ghost`” |
| “Sistemare CSS” | “Sostituire `text-gray-500` con `text-ink-muted` in riga 42” |
| “Aggiungere animazioni” | “Rail già animato; qui lista refetch — no motion” |

---

## Tre PR “sbagliate” commentate (esempi didattici)

Fragmenti **fittizi** per allenare la review — pattern che la checklist cap09 deve intercettare. Non sono PR reali del repo.

### Esempio 1 — Token paralleli e class soup

**Diff (semplificato) — `views/ProgettiView.tsx`:**

```tsx
<div className="bg-[#1e1e1e] text-white p-3 rounded-lg shadow-xl border border-gray-700">
  <h2 className="text-2xl font-bold text-gray-100">Progetti</h2>
  <button className="bg-green-500 hover:bg-green-400 px-4 py-2">Nuovo</button>
</div>
```

| Review | Tipo problema | Fix JEINS |
|--------|---------------|-----------|
| `ProgettiView.tsx` — hex `#1e1e1e` e `gray-*` | Palette parallela, tema scuro rotto | `bg-surface-raised`, `text-ink`, `border-line/60` ([cap02](./cap02-token-tipografia-spaziatura.md)) |
| Due CTA visive (toolbar + card) senza gerarchia | Nessun focal point | Una primaria `primary`, secondarie `ghost` ([cap01](./cap01-filosofia-design-engineer.md)) |
| `text-2xl` su titolo tabella | Densità B2B | `text-lg font-semibold` in View ([cap02](./cap02-token-tipografia-spaziatura.md) § tipografia) |

**Perché respingere il merge:** ogni schermata con palette custom → impossibile tema chiaro/scuro coerente e review infinita.

---

### Esempio 2 — Stati assenti + fetch nella View

**Diff — `views/ClientiView.tsx`:**

```tsx
import { useEffect, useState } from 'react';
import { clientsAPI } from '../services/api';

export function ClientiView() {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    clientsAPI.getAll().then(setRows);
  }, []);
  return rows.length ? <table>...</table> : null;
}
```

| Review | Tipo problema | Fix JEINS |
|--------|---------------|-----------|
| `useEffect` + fetch in **View** | Violazione layering | `useClients()` in `ClientsPage`, props `clients` / `isLoading` / `error` ([FOUNDATIONS cap04](../../FOUNDATIONS/cap04-prima-modifica-in-view.md)) |
| `return null` mentre carica | Schermo bianco / layout jump | `Skeleton` o spinner in Page ([cap05](./cap05-stati-feedback.md)) |
| Lista vuota = `null` | Empty non distinguibile da errore | `EmptyState` con CTA in italiano |
| Nessun handling errore | Rete/403 invisibili | `isError` + messaggio + refetch in Page |

**Perché respingere il merge:** duplica logica in ogni View, bypassa React Query e mock dev, impossibile testare la View con props fisse.

---

### Esempio 3 — RBAC solo “cosmetico” + motion rumorosa

**Diff — `pages/BillingPage.tsx` + `components/ui/Button.tsx` (fork):**

```tsx
// BillingPage — bottone sempre visibile
<Button onClick={exportPdf}>Esporta PDF</Button>

// Nuovo BillingButton.tsx — copia di Button con framer-motion su ogni riga
<motion.tr whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
```

**Commenti review:**

| File | Problema | Fix |
|------|----------|-----|
| `BillingPage` | CTA visibile senza `RequirePermission` / check permesso export | Nascondi o disabilita con motivo — [cap08](./cap08-rbac-ui-difensiva.md), `docs/RBAC.md` |
| `BillingButton.tsx` | Primitivo duplicato | Estendi `components/ui/Button` con variante, non fork |
| `motion.tr` su tabella | Motion su N righe, no `useReducedMotion` | Statico o `presets` su container — [cap06](./cap06-motion.md) |
| Export senza test 403 | “tanto il backend blocca” | UI difensiva + test manuale utente senza permesso |

**Perché respingere il merge:** inganna l’utente (click → errore), performance degradata, secondo design system da mantenere.

---

### Esercizio extra (dopo aver letto i 3 esempi)

Per ciascun esempio, scrivi **una** riga di commento PR nel formato:

`file:riga — problema — fix suggerito`

Poi confronta con la tabella sopra. In review reale, almeno un commento deve citare **token**, **stati** o **permessi** — non solo estetica.

---

## Alternative scartate come reviewer

- Approvare solo perché “build passa”  
- Richiedere pixel-perfect Figma non allineato a token JEINS  
- Bloccare PR per mancanza Storybook se non è standard team  
- Ignorare RBAC perché “tanto il backend blocca”

---

## Trade-off

| Scelta | Pro | Contro |
|--------|-----|--------|
| Checklist in PR | review ripetibile | overhead 5 min |
| Screenshot obbligatori | meno regressioni | tempo autore |
| a11y pragmatica vs audit WCAG full | shippable | gap documentati |
| Due manuali (MID + DESIGN) | ruoli chiari | overlap cap05 — accettabile |

---

## Esercizio valutabile

1. Leggi i [tre esempi PR sbagliate](#tre-pr-sbagliate-commentate-esempi-didattici) sopra.  
2. Apri una PR recente del repo (o branch del compagno) **oppure** usa gli esempi 1–3 come drill.  
3. Compila la checklist sopra in commento markdown (anche su copia locale).  
4. Scrivi **almeno 3** commenti stile `file:riga — problema — fix suggerito` (uno per tema: token, stati/layering, RBAC o motion).  
5. Indica **1** item escalabile a Tech Lead ([MID-LEVEL cap10](../MID-LEVEL/cap10-quando-escalare.md)).

**Valutazione:** almeno un commento su token/stati/permessi; nessun commento solo estetico soggettivo; se usi solo gli esempi fittizi, tutti e 3 i commenti devono mappare alle tabelle “Fix JEINS”.

---

## Limiti nel repo

- Nessuna pipeline visual regression automatica.  
- a11y audit completo non in scope team piccolo.  
- ESLint non copre contrasto colori — review umana.

---

*Prossimo: [Capitolo 10 — Capstone](./cap10-capstone-rifare-schermata.md)*
