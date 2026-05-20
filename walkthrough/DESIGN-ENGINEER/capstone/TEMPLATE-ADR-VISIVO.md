# Capstone — ADR visivo — [Nome schermata]

**Studente / branch:**  
**Data:**  
**Schermata scelta:** (es. Clienti — `ClientsPage` + `ClientiView`)  
**Link PR:**  

---

## 1. Problema osservato

(2–4 frasi: cosa non funzionava in uso reale — gerarchia, stati, token, permessi, motion.)

- 
- 

---

## 2. Vincoli JEINS rispettati

- [ ] B2B amministrativo — densità dati, non landing marketing
- [ ] Team piccolo — riuso `components/ui/`, no libreria UI nuova
- [ ] SPA / no SSR — stati loading espliciti lato client
- [ ] RBAC — UI allineata a `docs/RBAC.md`
- [ ] Copy utente in **italiano**
- [ ] Nessun cambio schema DB / API (solo UI) — altrimenti link MID-LEVEL cap01 e escalazione

---

## 3. Scelte principali

| Area | Decisione | Alternativa scartata | Perché |
|------|-----------|---------------------|--------|
| Gerarchia | | | |
| Stati (loading / empty / error) | | | |
| Token / colori | | | |
| Motion | | | |
| RBAC (nascosto / disabilitato) | | | |
| Form / modali | | | |

---

## 4. File toccati

| Path | Tipo modifica |
|------|----------------|
| `gestionale-app/src/pages/…` | |
| `gestionale-app/src/views/…` | |
| Altro: | |

**Fuori scope (non toccati):**  
- 

---

## 5. Trade-off residui

(Cosa **non** hai fatto in questo capstone e perché — scope, tempo, debito esistente nel repo.)

- 

---

## 6. Verifica

- [ ] Checklist [cap09](../cap09-review-ui-checklist-pr.md) compilata in PR
- [ ] `npm run lint` + `npm run build` in `gestionale-app/`
- [ ] Screenshot tema **chiaro**
- [ ] Screenshot tema **scuro**
- [ ] Mock dev disattivato per demo
- [ ] Network: richieste API reali visibili (se la schermata carica dati)

---

## 7. Presentazione (10 min) — note

| Slide | Contenuto |
|-------|-----------|
| Prima / dopo | |
| Un trade-off | |
| Escalation al lead | |

---

*Template ADR visivo JEINS — Design Engineer capstone*
