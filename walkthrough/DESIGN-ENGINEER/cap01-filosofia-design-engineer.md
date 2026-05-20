# Capitolo 1 — Filosofia design engineer (vincoli JEINS)

---

## Contesto

“Design engineer” qui non significa pixel-perfect in isolation. Significa: **tradurre vincoli di prodotto e ingegneria in superfici che reggono l’uso quotidiano** — multi-ruolo, dati che cambiano sotto altri, sessioni lunghe, errori di rete.

Il riferimento stilistico è il *craft* intenzionale (chiarezza, ritmo, restraint) — non un personaggio con “60 anni di esperienza”, ma decisioni che potresti difendere in review: *perché questo spazio, perché questo stato, perché zero animazione qui*.

---

## Vincoli che modellano ogni scelta UI

| Vincolo | Implicazione visiva |
|---------|---------------------|
| **B2B amministrativo** | densità informativa > marketing; azioni primarie evidenti; meno decorazione |
| **Team piccolo** | un design system interno, non libreria esterna da temare |
| **SPA su Render, API Express separata** | no SSR, no skeleton “streaming” — stati loading **espliciti** lato client |
| **RBAC reale** | UI non mostra ciò che l’API nega; differenza tra nascondere e disabilitare ([cap08](./cap08-rbac-ui-difensiva.md)) |
| **Modifiche concorrenti (409)** | feedback diverso da errore generico — [MID-LEVEL cap03](../MID-LEVEL/cap03-gestione-conflitti-dati-concorrenti.md) |
| **i18n: italiano in UI** | copy professionale, non stringhe inglesi sparse |

Stack FE (contesto, non tutorial): React 19 + Vite + TanStack Query + Tailwind — motivazioni in [frontend mod.1](../frontend/01-architettura-base-e-scelte-tecnologiche.md).

---

## Codice ancoraggio — restraint nella shell

La shell non compete con il contenuto: superficie `bg-surface`, testo `text-ink`, bordi `border-line`:

```28:52:gestionale-app/src/layout/AppShell.tsx
    return (
        <div className="h-screen flex bg-surface text-ink overflow-hidden">
            <IconRail activeView={activeView} setActiveView={setActiveView} />
            {showProjectSidebar && (
                <ProjectSidebar
                    ...
                />
            )}
            <div className="flex-1 flex flex-col min-w-0">
                <TopBar ... />
                <main className="dashboard-canvas flex-1 overflow-y-auto px-4 md:px-6 lg:px-8 py-5">
                    <PageTransition>{children}</PageTransition>
                </main>
            </div>
        </div>
    );
```

**Lettura design:** padding responsive sul `main`, `min-w-0` per evitare overflow orizzontale — pattern da preservare nelle View, non rifare layout da zero.

Motion tokens centralizzati — non numeri magici sparsi:

```6:11:gestionale-app/src/motion/presets.ts
export const DURATION = {
    instant: 0.12,
    fast: 0.18,
    normal: 0.28,
    slow: 0.42,
} as const;
```

---

## Gerarchia visiva — regole operative

1. **Un focal point per viewport** — es. tabella clienti: titolo + CTA “Aggiungi” + righe; sidebar progetti è contesto secondario.
2. **Tre livelli di testo** — `text-ink`, `text-ink-muted`, `text-ink-subtle` (non quattro grigi custom).
3. **Azioni** — primaria (`Button` variant `primary`), secondarie `ghost`/`outline`, distruttive `danger` con conferma.
4. **Superfici** — `card` / `card-inset` da `index.css` per pannelli; non ombreggiature random.
5. **Stati** — loading ≠ empty ≠ error — sempre distinguibili ([cap05](./cap05-stati-feedback.md)).

---

## Alternative scartate

| Alternativa | Motivo |
|-------------|--------|
| Importare MUI / Chakra “per andare veloci” | secondo tema, bundle, mismatch con token JEINS |
| Redesign globale in branch lungo | team piccolo; iterare per schermata ([cap10](./cap10-capstone-rifare-schermata.md)) |
| Animare ogni hover “perché è moderno” | rumore + accessibilità + costo GPU ([cap06](./cap06-motion.md)) |
| UI = solo CSS, dati = solo backend | stati e permessi **sono** UX; il design engineer legge `pages/` e `lib/permissions.ts` |

---

## Trade-off

| Decisione | Guadagno | Costo |
|-----------|----------|-------|
| Design system interno leggero | coerenza, PR veloci | niente Storybook catalogo completo |
| Utility-first Tailwind | iterazione rapida | rischio class soup senza `cn` ([cap03](./cap03-primitivi-composizione.md)) |
| Craft minimo (restraint) | app “professionale”, non demo | meno wow factor in screenshot |
| Allineamento stretto a MID-LEVEL | feature shippabili | meno libertà estetica personale |

---

## Esercizio valutabile

Scegli **una** schermata che usi spesso (es. Clienti o Dashboard).

1. Scatta o annota la gerarchia attuale (1–5 elementi per livello di attenzione).
2. Scrivi **tre** vincoli JEINS dalla tabella sopra che **limitano** un redesign fantasioso.
3. Proponi **una** modifica di restraint (es. ridurre animazione, unificare CTA) — max mezza pagina, con trade-off.

**Valutazione:** la proposta deve citare un file reale (`ClientiView.tsx`, `DashboardView.tsx`, …) e non richiedere SSR né nuova libreria UI.

---

## Limiti nel repo

- **Dashboard ibrida:** `DashboardView.tsx` mescola fetch custom e mock — eccezione architetturale, non modello visivo ([frontend mod.4](../frontend/04-state-management-e-data-flow.md)).
- **Componenti legacy** con palette diversa — non estendere senza piano di convergenza.
- **Escalation:** nuova libreria UI pesante, redesign RBAC globale → [MID-LEVEL cap10](../MID-LEVEL/cap10-quando-escalare.md) **prima** di codare.

---

*Prossimo: [Capitolo 2 — Token, tipografia, spaziatura](./cap02-token-tipografia-spaziatura.md)*
