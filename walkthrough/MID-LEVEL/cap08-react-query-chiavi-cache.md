# Capitolo 8 — React Query: chiavi e cache (appendice)

> **Prerequisito obbligatorio:** [Capitolo 2](./cap02-uccidere-useeffect-react-query.md)  
> Questo file copre solo dettagli **avanzati** sulle chiavi; non ripete il flusso base.

---

## 5.1 Regola d’oro

**Tutte** le chiavi passano da `queryKeys`. Mai stringhe magiche sparse.

📁 `gestionale-app/src/lib/query/keys.ts`

```ts
export const queryKeys = {
    clients: ['clients'] as const,
    client: (id: string) => ['clients', id] as const,
    tasks: (filters: Record<string, string | undefined>) => ['tasks', filters] as const,
};
```

❌ Junior: `['client-list-v2']` e `['clients']` per lo stesso endpoint → cache doppia.

---

## 5.2 Filtri in `queryKey`

Per liste filtrate (tasks, events):

```ts
queryKeys.tasks({ projectId, status })
```

Quando il filtro cambia, React Query tratta come **query diversa** — corretto.

❌ Junior: chiave fissa `['tasks']` con `queryFn` che legge filtro da closure stale.

---

## 5.3 `invalidate` vs `setQueryData`

| Strategia | Quando |
|-----------|--------|
| `invalidateQueries` | **default** dopo create/update/delete |
| `setQueryData` | update ottimistico (board Kanban) — solo se gestisci rollback su errore |
| `refetch()` manuale | pulsante “Riprova”; raro come unico meccanismo |

---

## 5.4 Mock (solo dev)

📁 `lib/api/mock.ts` — attivabile in **development** tramite `shouldUseMockData` in `lib/api/client.ts` (flag in `localStorage`: `useMockData`, `mockDataSections`). In **produzione** (`import.meta.env.PROD`) il mock è sempre disattivato.

| ❌ Junior | ✅ Mid-Level |
|-----------|--------------|
| `return []` o dati finti hardcoded nel `queryFn` | `queryFn` chiama sempre `*API` reale; mock solo via layer `apiCall` |
| Lasciare mock attivo e aprire PR “funziona” | Prima della PR: disattiva mock nel pannello dev e verifica con backend locale |
| Committare `useMockData = true`, override in `client.ts`, o `.env` che forza mock | Nessuna modifica committata che abilita mock di default per tutti |
| Screenshot/PR testati solo con mock | Passi “Come testare” nella PR con API reale |

**Checklist pre-PR:** mock off → refresh → Network tab mostra chiamate a `VITE_API_URL`, non risposte da `mock.ts`.

❌ Junior: `return []` hardcoded nel `queryFn`.

---

*Capitolo 8 — appendice v2*
