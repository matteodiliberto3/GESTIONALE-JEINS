# FOUNDATIONS — PRE-DE-A (fondamenta sviluppo)

**Ruolo:** **PRE-DE-A** — portare chi ha poca o nessuna esperienza pratica (git, React in repo reale, HTTP verso API, avvio JEINS) al punto in cui può seguire [MID-LEVEL cap00](../MID-LEVEL/cap00-onboarding-mappa-repo.md), [DESIGN-ENGINEER PRE-DE-B](../DESIGN-ENGINEER/cap00-pre-de-b-fondamenta-design-engineering.md) o entrambi **senza bloccarsi**.

**Non è:**
- sostituto di un corso universitario su algoritmi e strutture dati;
- duplicato del [MID-LEVEL playbook](../MID-LEVEL/00-INDICE.md) (feature E2E complete);
- manuale design engineering (→ PRE-DE-B in DESIGN-ENGINEER).

**È:** percorso **autosufficiente** per il neofita dev su JEINS — stesso schema dei capitoli DESIGN-ENGINEER (contesto → codice → alternative → trade-off → esercizio → limiti).

**Hub generale:** [00-PERCORSI.md](../00-PERCORSI.md)

---

## Da quale expertise a quale

| Ingresso | Uscita dopo FOUNDATIONS (tutti i cap + esercizi) |
|----------|--------------------------------------------------|
| Mai usato git / mai scritto React in un repo | Workflow git; legge e scrive componenti TS; traccia HTTP fino a `apiCall`; avvia FE+BE; modifica una View; **non** ancora mid né design engineer |
| Solo CodeSandbox / tutorial isolati | Orientamento monorepo; flusso Page→hook→API→route; build e lint senza panico |

**Dopo FOUNDATIONS diventi:** sviluppatore **pronto per i track JEINS** (MID-LEVEL, DESIGN-ENGINEER, frontend teoria).

---

## Schema di ogni capitolo

1. **Contesto** — perché serve al neofita su JEINS  
2. **Codice ancoraggio** — estratti da repo reale  
3. **Perché (ragionamento)** — decisioni che il team si aspette  
4. **Alternative scartate**  
5. **Trade-off**  
6. **Esercizio valutabile** — passi numerati + rubrica  
7. **Limiti / prossimo passo**

---

## Struttura (PRE-DE-A)

| Cap. | File | Contenuto |
|------|------|-----------|
| **0** | [cap00-git-workflow-e-repo.md](./cap00-git-workflow-e-repo.md) | Git, branch, commit, PR, `.gitignore` mentale |
| **1** | [cap01-react-typescript-minimo.md](./cap01-react-typescript-minimo.md) | Moduli, JSX, props, state, errori TS, `npm run build` |
| **2** | [cap02-http-json-api-client.md](./cap02-http-json-api-client.md) | HTTP, `apiCall`, mock dev, traccia Clienti in Network |
| **3** | [cap03-avvio-jeins-e-mappa.md](./cap03-avvio-jeins-e-mappa.md) | Setup due terminali, mappa E2E, esercizio Clienti (allineato MID-LEVEL cap00) |
| **4** | [cap04-prima-modifica-in-view.md](./cap04-prima-modifica-in-view.md) | Page vs View, props down, prima PR visiva minima |

```
cap00 → cap01 → cap02 → cap03 → cap04 → MID-LEVEL cap00 (rinforzo) → track scelto
```

**Durata indicativa:** 3–5 settimane a ~8–10 h/settimana (con correzione esercizi).

**Obbligatorio dopo cap03:** leggere almeno una volta [MID-LEVEL cap00 §0.4](../MID-LEVEL/cap00-onboarding-mappa-repo.md#04-primo-giorno--esercizio-obbligatorio-traccia-clienti-non-rimborsi) — verifica mock e `console.log` backend.

---

## Rubrica globale (tutor / autovalutazione)

| Cap | Sufficiente (minimo) | Ottimo |
|-----|----------------------|--------|
| **0** | Branch `feat/…`, 1 commit sensato, PR draft con descrizione | + nessun file `.env`/`node_modules` in stage |
| **1** | `FoundationsHello.tsx` compila; build ok; spiega props vs state a voce | + corregge 1 errore TS guidato senza `any` |
| **2** | Tabella Network + funzione TS corretta; capisce 401 vs 403 | + spiega perché `credentials: 'include'` |
| **3** | Health OK, login OK, richiesta `/api/clients` visibile, mock off | + esercizio 6 passi MID-LEVEL cap00 completato |
| **4** | Modifica solo View; Page passa props; build+lint ok | + PR con screenshot prima/dopo |

**Insufficiente comune:** saltare cap04 e aprire MID-LEVEL cap01 senza aver mai modificato una View.

---

## Dopo FOUNDATIONS

| Obiettivo | Prossimo passo |
|-----------|----------------|
| Craft UI / design engineering | [PRE-DE-B](../DESIGN-ENGINEER/cap00-pre-de-b-fondamenta-design-engineering.md) → [DESIGN-ENGINEER](../DESIGN-ENGINEER/00-INDICE.md) |
| Feature E2E (DB, route, Page) | [MID-LEVEL](../MID-LEVEL/00-INDICE.md) cap00 (rinforzo) → cap01 |
| Teoria architettura FE | [frontend](../frontend/00-INDICE.md) mod 0–1 |

---

## Source of truth rapida (dev)

| Tema | Path |
|------|------|
| HTTP client | `gestionale-app/src/lib/api/client.ts` |
| API dominio | `gestionale-app/src/services/api.ts` |
| Hook dati | `gestionale-app/src/features/data/hooks.ts` |
| Esempio Page | `gestionale-app/src/pages/ClientsPage.tsx` |
| Esempio View | `gestionale-app/src/views/ClientiView.tsx` |
| Route BE | `backend/routes/clients.js` |
| Env backend | `backend/.env.example` |
| Env frontend | `gestionale-app/.env` (`VITE_API_URL`) |

---

*FOUNDATIONS PRE-DE-A v2 — maggio 2026*
