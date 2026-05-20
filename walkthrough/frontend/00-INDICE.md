# Frontend Architecture & Onboarding Manual — Gestionale JEINS

**Pubblico:** studente universitario / junior in transizione verso ingegnere che ragiona sui trade-off.  
**Non è:** un corso su sintassi React, TypeScript o Tailwind.  
**È:** un manuale su *modelli mentali*, *scelte architetturali*, *design pattern* e *best practice* dell’infrastruttura frontend di `gestionale-app/`.

**Ingresso neofita:** [FOUNDATIONS PRE-DE-A](../FOUNDATIONS/00-INDICE.md) (dev) → [DESIGN-ENGINEER PRE-DE-B](../DESIGN-ENGINEER/cap00-pre-de-b-fondamenta-design-engineering.md) (craft) — hub [00-PERCORSI.md](../00-PERCORSI.md).

**Convenzioni del manuale**

- Ogni capitolo apre con **contesto** e chiude con **trade-off** + (dove utile) **limiti noti nel repo**.
- I riferimenti al codice puntano a percorsi reali sotto `gestionale-app/src/`.
- Le sezioni *Alternative scartate* e *Esercizi* sono parte del percorso didattico, non optionalità decorative.
- `docs/RBAC.md` e `ARCHITETTURA.md` vanno **referenziati**, non duplicati pedissequamente.

**Struttura didattica consigliata per ogni capitolo redatto**

1. Contesto — problema di business/tecnico  
2. Scelta attuale nel repo — file di ancoraggio  
3. Alternative considerate  
4. Trade-off — cosa si guadagna e cosa si paga  
5. Esercizio — modifica guidata o domanda d’esame  

---

## Modulo 0 — Come usare questo manuale

| Capitolo | Sinossi |
|----------|---------|
| **0.1 Prerequisiti mentali** | Cosa si assume già (React, TypeScript, HTTP): il manuale colma il gap tra tutorial e codice di produzione. |
| **0.2 Mappa del repository** | Albero `src/`: `app/`, `pages/`, `views/`, `features/`, `components/`, `layout/`, `lib/`, `services/`. Perché non c’è una cartella `store/` globale. |
| **0.3 Percorso di onboarding (4 settimane)** | Settimana 1: shell + routing; 2: data layer; 3: UI system; 4: domini critici (auth, RBAC, conflitti). Deliverable attesi per ogni fase. |
| **0.4 Glossario del progetto** | Page vs View vs Feature vs Component; “server state” vs stato UI locale; terminologia allineata al backend (Socio, area, version). |

---

## Modulo 1 — Architettura di base e scelte tecnologiche ✅

📄 `01-architettura-base-e-scelte-tecnologiche.md`

| Capitolo | Sinossi |
|----------|---------|
| **1.1 Visione architetturale** | SPA amministrativa B2B: obiettivi (multi-ruolo, dati condivisi, modifiche concorrenti) e vincoli (team piccolo, deploy su Render, API Express separata). |
| **1.2 Stack e motivazioni** | React 19 + TypeScript strict + Vite 7: perché no Next.js (nessun SSR richiesto), perché no Redux (TanStack Query copre lo stato remoto). Tabella confronto alternative scartate. |
| **1.3 Layering e regole di dipendenza** | Grafo consentito: `pages` → `views` / `features` → `components` → `lib`; `services/api.ts` come façade HTTP. Anti-pattern: import circolari, logica di dominio nei componenti foglia. |
| **1.4 Boundary `app/` — composizione root** | `App.tsx` minimale; `providers.tsx` come unico punto di mounting dei provider globali. Ordine dei provider e effetti collaterali (router dentro Query, tema, notice). |
| **1.5 Build, ambienti e configurazione** | `import.meta.env`, `.env.example`, proxy Vite `/api` in dev vs `VITE_API_URL` in prod. Trade-off same-origin + cookie httpOnly vs Bearer in `localStorage`. |
| **1.6 Strategia di modularizzazione futura** | Quando estrarre un nuovo `feature/`; quando restare in `components/`; segnali che il modulo è “maturo” per essere isolato. |

---

## Modulo 2 — Routing, layout e esperienza applicativa ✅

📄 `02-routing-layout-e-esperienza-applicativa.md`

| Capitolo | Sinossi |
|----------|---------|
| **2.1 React Router 7 come sistema di navigazione** | Route tree: `/login`, layout autenticato, route utility vuote (`notifiche`, `help`). Perché URL-first invece di stato `activeView` puro. |
| **2.2 Code splitting e lazy loading** | `React.lazy` + `Suspense` in `router.tsx`: impatto su bundle, waterfall da evitare, fallback `PageFallback`. |
| **2.3 `AuthenticatedLayout` — orchestrazione shell** | Ruolo del layout: titoli, `Outlet` context (`activeProjectId`, `user`), viste utility vs pagine reali. |
| **2.4 `AppShell` — modello a tre colonne** | `IconRail` + `ProjectSidebar` + `TopBar` + main: information architecture e perché la sidebar progetti è opzionale (permessi). |
| **2.5 Navigazione ibrida URL / stato locale** | `activeView` sincronizzato con `pathname`; rischio di desync e come il team lo mitiga (`VIEW_PATHS`, `navigate`). |
| **2.6 Transizioni di pagina** | `PageTransition` + Framer Motion: quando animare e quando è rumore; collegamento a `useReducedMotion`. |
| **2.7 Home per ruolo e catch-all** | `HomeRedirect`, `defaultHomePath`, route `*`. |

---

## Modulo 3 — Autenticazione, sessione e autorizzazione UI ✅

📄 `03-autenticazione-sessione-e-permessi-ui.md`

| Capitolo | Sinossi |
|----------|---------|
| **3.1 Modello di sessione** | Cookie httpOnly + refresh + fallback token in `localStorage`: flusso login → verify → refresh su 401; perché non solo JWT in memoria. |
| **3.2 `AuthProvider` come bounded context** | Stato `user`, bootstrap, `logout`, integrazione con `auth:unauthorized`. Cosa **non** deve fare il provider (fetch di liste clienti). |
| **3.3 `lib/api/client.ts` — il client HTTP unico** | `credentials: 'include'`, retry dopo refresh, `ConcurrentModificationError` (409). Perché centralizzare qui e non in ogni pagina. |
| **3.4 RBAC sul frontend: capability, non ruoli sparsi** | `lib/permissions.ts`, `user.permissions` dal backend, `resolvePermissions` come fallback. Filosofia: UI riflette i permessi, il backend li fa rispettare. |
| **3.5 `RequirePermission` e route guards** | Redirect a `defaultHomePath` (`/tasks` per Socio, `/dashboard` per management). Trade-off guard per route vs guard per azione. |
| **3.6 Menu e superficie esposta per ruolo** | Filtro `IconRail` per `perm`; home diversa per persona. Esercizio: progettare un nuovo ruolo “Audit” senza toccare 12 file. |
| **3.7 Login e superficie non autenticata** | `LoginPage` vs `Login.tsx`: separazione pagina/contenuto; cosa resta in `localStorage` dopo login. |

---

## Modulo 4 — State management e data flow ✅

📄 `04-state-management-e-data-flow.md`

| Capitolo | Sinossi |
|----------|---------|
| **4.1 Tassonomia dello stato** | Server state (Query), session state (Auth), UI ephemeral (modali, form draft), URL state (router). Diagramma unidirectional data flow. |
| **4.2 TanStack Query v5 — scelta e configurazione** | `queryClient` in `lib/query/client.ts`; defaults (staleTime, retry); perché Query e non SWR / React 19 `use`. |
| **4.3 Query keys e invalidazione** | `lib/query/keys.ts`; pattern `invalidate` incrociato clienti → progetti → contratti dopo mutazione. Trade-off invalidate ampia vs chirurgica. |
| **4.4 `features/data/hooks.ts` — API del dominio dati** | `useClients`, `useProjectMutations`: confine tra UI e `services/api`. Quando aggiungere un hook vs chiamare API nella page. |
| **4.5 Mutazioni e optimistic updates** | Stato attuale (pessimistic); dove l’optimistic update avrebbe senso (Kanban) e rischi (rollback, 409). |
| **4.6 `services/api.ts` — façade REST** | Raggruppamento per risorsa; contratto implicito con backend; gestione errori e tipi `any` come debito documentato. |
| **4.7 Mock in development** | `lib/api/mock.ts`, import dinamico, `shouldUseMockData`, sezioni per dominio. Perché i mock sono vietati in `PROD` e legati a `/admin` in dev. |
| **4.8 Stato locale “complesso” — eccezioni** | `DashboardView`: fetch parallelo custom, mock task in dev, `useState` multiplo. Quando è giustificato uscire da Query e costo di manutenzione. |

---

## Modulo 5 — Pattern di pagina: Pages, Views e Features ✅

📄 `05-pages-views-e-features.md`

| Capitolo | Sinossi |
|----------|---------|
| **5.1 Page = composizione e wiring** | Esempio `ClientsPage`: query + mutazioni + modali + `useConflictUpdate`. Responsabilità della page in poche righe vs centinaia. |
| **5.2 View = presentazione e interazione pura** | `ClientiView`, `ProgettiView`: props callback, nessuna chiamata API. Testabilità e potenziale Storybook. |
| **5.3 Feature = capacità riusabile** | `features/forms/modals.tsx`: form ADD/EDIT con `expectedVersion`. Quando un form diventa feature vs resta in `components/`. |
| **5.4 Anti-corruption layer verso i tipi** | `types/models.ts` vs payload API; campi opzionali, `version` per locking ottimistico. |
| **5.5 Flusso CRUD tipo “scheda anagrafica”** | Pattern ripetuto: lista → modifica → invalidate → chiusura modale. Checklist per nuova entità (clienti come template). |

---

## Modulo 6 — Concorrenza, integrità dati e UX di errore ✅

📄 `06-concorrenza-integrita-e-errori.md`

| Capitolo | Sinossi |
|----------|---------|
| **6.1 Problema: modifiche simultanee** | Scenario due tab / due utenti; versioning lato server (`expectedVersion`). |
| **6.2 `updateWithConflictHandling` + `ConflictDialog`** | Flusso 409 → dialog → risoluzione yours/server/merged. Trade-off merge manuale vs last-write-wins. |
| **6.3 `useConflictUpdate`** | Hook che incapsula retry e modale; estensione a cliente / progetto / contratto. |
| **6.4 Error boundaries e feedback** | Toast (`useToast`), `NoticeProvider`, eventi `app:notice`. Strategia errori di rete vs validazione vs 403. |
| **6.5 Idempotenza e doppio submit** | Stato `loading` su form; mutazioni Query `isPending`. |

---

## Modulo 7 — Design system, styling e componentizzazione ✅

📄 `07-design-system-e-componenti.md`

| Capitolo | Sinossi |
|----------|---------|
| **7.1 Filosofia del design system interno** | Non Storybook formale: convenzioni Tailwind + primitivi in `components/ui/`. Quando creare un nuovo primitivo vs comporre. |
| **7.2 Tailwind + token semantici** | `index.css`, classi `ink`, `surface`, `line`, gradienti; `design-system/tailwind-theme.ts`. Trade-off utility-first vs CSS modules. |
| **7.3 Primitivi UI** | `Button`, `Card`, `Badge`, `Modal`, `Form`, `Select`: API props, accessibilità minima, varianti. |
| **7.4 `cn()` e composizione classi** | `clsx` + `tailwind-merge`: perché evitare stringhe concatenate manuali. |
| **7.5 Tema chiaro/scuro** | `ThemeProvider`, toggle in `IconRail`, persistenza preferenza. Implicazioni contrasto e chart. |
| **7.6 Componenti “dominio” vs “sistema”** | `PriorityBadge`, `TaskCard` vs `Button`: regole di naming e collocazione. |
| **7.7 Modali: `AppModal` vs `MotionDialog`** | Due astrazioni storiche; criterio per unificarle o convivere. |

---

## Modulo 8 — Motion, interazione avanzata e accessibilità

| Capitolo | Sinossi |
|----------|---------|
| **8.1 Strategia motion** | `motion/presets.ts`, `BentoCell`, `StaggerList`: motion come enhancement, non requisito. |
| **8.2 `useReducedMotion` e inclusività** | Rispetto `prefers-reduced-motion`; fallback statici in `IconRail` e dialog. |
| **8.3 Drag & drop — Kanban (`@dnd-kit`)** | Architettura `KanbanBoard` + `TaskCard`; sync con API `PATCH move`; performance con liste lunghe. |
| **8.4 Calendario ed eventi** | `Calendar.tsx`: RSVP, call link, stato partecipante; accoppiamento con API events. |
| **8.5 Accessibilità pragmatica** | `SkipLink`, `AccessibleButton`, ruoli ARIA su tab e dialog. Cosa manca (focus trap completo, live regions) e backlog. |

---

## Modulo 9 — Performance, rendering e osservabilità

| Capitolo | Sinossi |
|----------|---------|
| **9.1 Modello di rendering React 19** | Client-only SPA: nessun hydration mismatch; implicazioni per SEO (non obiettivo). |
| **9.2 Anatomia del bundle Vite** | Chunk per pagina lazy; dipendenze pesanti (recharts, framer-motion, dnd-kit). Strategie di splitting futuro. |
| **9.3 Fetch waterfall e parallelizzazione** | `DashboardView` `Promise.all` vs sequenziale; uso di `enabled` in Query per evitare chiamate inutili (es. progetti per Socio). |
| **9.4 Liste e tabelle** | Rendering client-side completo; soglie per virtualizzazione; impatto di re-render su select inline in tabelle. |
| **9.5 Grafici (`recharts`)** | `SprintVelocity`, `SimpleChart`: costo mount; quando differire il render. |
| **9.6 Diagnostica in development** | `AdminPanel`, `DiagnosticsModal`, override API URL: strumenti per onboarding, non per utenti finali. |

---

## Modulo 10 — Domini funzionali (case study verticali)

| Capitolo | Sinossi |
|----------|---------|
| **10.1 Dashboard operativa** | Composizione widget, Kanban, feed attività; accoppiamento progetto attivo dalla sidebar. |
| **10.2 CRM leggero (Clienti)** | Tabella, status inline, conflict on edit. |
| **10.3 Progetti e todo di progetto** | Card espandibili, todo locali al progetto vs task kanban globali. |
| **10.4 Contabilità / Fatturato** | KPI derivati client-side; permessi Commerciale / Tesoreria. |
| **10.5 Inbox e messaggistica** | `InboxPage`, API chats; stato attuale e gap real-time. |
| **10.6 Report** | `ReportsPage`: aggregazioni da Query; limiti dei dati mockati. |
| **10.7 My Tasks (percorso Socio)** | `MyTasks.tsx` vs dashboard; API `mytasks`; UX semplificata. |
| **10.8 Recruiting e Admin (dev-only)** | Superfici legacy/isolate; confine prod vs dev (`import.meta.env.PROD`). |

---

## Modulo 11 — Qualità, testing e workflow ingegneristico

| Capitolo | Sinossi |
|----------|---------|
| **11.1 Piramide dei test nel progetto** | Vitest unit (`client.test.ts`), Playwright smoke E2E, assenza (per ora) di test componente estensivi. |
| **11.2 Cosa testare prima** | Client HTTP, permissions resolver, conflict handler; cosa non ha ROI (snapshot di ogni card). |
| **11.3 ESLint e convenzioni** | `eslint.config.js`, regole hooks; warning accettati vs da eliminare. |
| **11.4 TypeScript strict e debito `any`** | `services/api.ts`, eventi dashboard: piano di restringimento tipi senza bloccare feature. |
| **11.5 CI locale e pre-push** | `build`, `test`, `lint`, `test:e2e` con preview server; allineamento con GitHub Actions. |

---

## Modulo 12 — Deploy, sicurezza frontend e operatività

| Capitolo | Sinossi |
|----------|---------|
| **12.1 Build di produzione** | `tsc && vite build`, output `dist/`, `_redirects` SPA su static host. |
| **12.2 Variabili e segreti** | Cosa può stare nel frontend (nessun secret); `VITE_*` pubbliche. |
| **12.3 CORS, cookie e domini** | Checklist deploy coordinato backend (`FRONTEND_URL`) + frontend. |
| **12.4 Hardening superficie** | Disabilitazione mock/admin in prod; non esporre stack trace all’utente. |

---

## Modulo 13 — Decision records e exercitia (capacità di ragionare)

| Capitolo | Sinossi |
|----------|---------|
| **13.1 ADR template** | Come scrivere Architecture Decision Records per nuove scelte nel gestionale. |
| **13.2 Esercizio: aggiungere un modulo “Fornitori”** | Tracciare decisioni su cartelle, Query keys, permessi, view/page split. |
| **13.3 Esercizio: refactor Dashboard su Query** | Pro/contro rimozione fetch manuale; piano incrementale. |
| **13.4 Esercizio: unificare modali** | Valutazione costi/benefici consolidamento `AppModal` / `MotionDialog`. |
| **13.5 Checklist review PR frontend** | 15 punti (permessi, invalidate, a11y, no mock in prod, tipi, lazy route). |

---

## Appendici

| Appendice | Sinossi |
|-----------|---------|
| **A — Diagramma architettura (layer + data flow)** | Figura unica da tenere aggiornata a ogni major refactor. |
| **B — Tabella file “source of truth”** | Dove si trova auth, permessi, API, theme, router. |
| **C — Mapping endpoint ↔ hook ↔ pagina** | Riferimento rapido per onboarding (giorno 3). |
| **D — Debito tecnico catalogato** | `DashboardView` ibrido, doppio sistema modali, `any` in API, componenti legacy (`MyTasks` styling). |
| **E — Letture esterne selezionate** | TanStack Query docs, React Router, WCAG baseline — solo capitoli rilevanti. |

---

## Stato redazione

| Modulo | Stato |
|--------|--------|
| Modulo 1 | ✅ `01-architettura-base-e-scelte-tecnologiche.md` |
| Modulo 2 | ✅ `02-routing-layout-e-esperienza-applicativa.md` |
| Modulo 3 | ✅ `03-autenticazione-sessione-e-permessi-ui.md` |
| Modulo 4 | ✅ `04-state-management-e-data-flow.md` |
| Modulo 5 | ✅ `05-pages-views-e-features.md` |
| Modulo 6 | ✅ `06-concorrenza-integrita-e-errori.md` |
| Modulo 7 | ✅ `07-design-system-e-componenti.md` |
| Moduli 8–13 | 📋 Da redigere |
| Appendici | 📋 Da redigere on demand |

**Prossimo capitolo suggerito:** Modulo 8 (Motion, interazione avanzata e accessibilità).

---

## Riferimenti nel monorepo

| Area | Percorso |
|------|----------|
| Applicazione | `gestionale-app/` |
| Entry + provider | `gestionale-app/src/App.tsx`, `gestionale-app/src/app/providers.tsx` |
| Router | `gestionale-app/src/app/router.tsx` |
| Auth | `gestionale-app/src/app/AuthProvider.tsx` |
| Permessi UI | `gestionale-app/src/lib/permissions.ts` |
| HTTP client | `gestionale-app/src/lib/api/client.ts` |
| Query | `gestionale-app/src/lib/query/` |
| RBAC (backend + doc) | `docs/RBAC.md`, `backend/lib/permissions.js` |
| Manuale backend (parallelo) | `walkthrough/BACKEND/00-INDICE.md` |
| Playbook operativo Mid-Level (feature E2E, PR) | [walkthrough/MID-LEVEL/00-INDICE.md](../MID-LEVEL/00-INDICE.md) |
| Fondamenta dev (PRE-DE-A) | [walkthrough/FOUNDATIONS/00-INDICE.md](../FOUNDATIONS/00-INDICE.md) |
| Hub percorsi walkthrough | [walkthrough/00-PERCORSI.md](../00-PERCORSI.md) |
| Design Engineer (PRE-DE-B + craft DS JEINS) | [walkthrough/DESIGN-ENGINEER/00-INDICE.md](../DESIGN-ENGINEER/00-INDICE.md) |
