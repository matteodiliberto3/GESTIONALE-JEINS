# Capitolo 8 — React Query: chiavi e cache (appendice)

> **Prerequisito obbligatorio:** [Capitolo 2](./cap02-uccidere-useeffect-react-query.md) — se non hai capito `useQuery` e `invalidateQueries`, torna lì prima di leggere questo file.  
> **Questo capitolo** spiega *come nominare e invalidare* la cache senza duplicare dati o lasciare mock attivi per sbaglio.

---

## 8.1 Regola d’oro — una sola fonte per le chiavi

**Cos’è una `queryKey`?** È l’“etichetta” che React Query usa per sapere se due componenti stanno chiedendo **gli stessi dati**. Stessa chiave → stessa cache → **una sola** richiesta HTTP in volo.

📁 Unico file ammesso: `gestionale-app/src/lib/query/keys.ts`

```ts
export const queryKeys = {
    clients: ['clients'] as const,
    client: (id: string) => ['clients', id] as const,
    tasks: (filters: Record<string, string | undefined>) => ['tasks', filters] as const,
};
```

| Errore del neofita | Effetto |
|--------------------|---------|
| In Page A: `queryKey: ['clients']` | Sembra ok |
| In Page B: `queryKey: ['client-list']` | **Seconda cache** — stesso endpoint, doppio fetch, lista che non si aggiorna dopo save |
| Dopo `create`, invalidate solo `['clients']` | Page B resta stale per sempre |

✅ **Mid-Level:** definisci **una volta** in `keys.ts` e importa ovunque.

---

## 8.2 Filtri dentro la `queryKey` (liste filtrate)

Per tasks/eventi con filtri (`projectId`, `status`):

```ts
queryKeys.tasks({ projectId, status })
```

**Perché:** quando l’utente cambia filtro, React Query deve trattare la richiesta come **nuova query**, non riusare la cache del filtro precedente.

❌ **Junior:**

```ts
useQuery({
  queryKey: ['tasks'],  // chiave fissa
  queryFn: () => tasksAPI.getAll({ projectId, status }),  // filtro fuori dalla chiave
});
```

Se `projectId` cambia nello stato ma la chiave no, vedi ancora i dati vecchi finché non fai refresh manuale.

✅ **Mid-Level:** metti **tutti** i parametri che cambiano il risultato dentro `queryKey`.

---

## 8.3 `invalidateQueries` vs `setQueryData` vs `refetch`

| Strategia | Quando usarla | Spiegazione per neofita |
|-----------|---------------|-------------------------|
| `invalidateQueries` | **Default** dopo create/update/delete | “Segna i dati come vecchi”; React Query rifetcha al prossimo uso |
| `setQueryData` | Board Kanban, toggle ottimistico | Scrivi tu la cache a mano — se il server rifiuta, devi **rollback** |
| `refetch()` | Pulsante “Riprova” su errore | Rilancia solo quella query; non sostituisce `invalidate` dopo un save |

**Dopo un `create` cliente:** quasi sempre:

```ts
qc.invalidateQueries({ queryKey: queryKeys.clients });
qc.invalidateQueries({ queryKey: queryKeys.projects }); // se la lista progetti mostra conteggi clienti
```

Il neofita dimentica la seconda riga e poi dice “il progetto non aggiorna il badge clienti”.

---

## 8.4 Mock (solo dev) — cosa sono e cosa non committare

📁 `gestionale-app/src/lib/api/mock.ts`  
📁 Flag in `lib/api/client.ts` → `shouldUseMockData()`

**Come funziona (in parole semplici):**

1. In **development**, un pannello admin può salvare in `localStorage` chiavi come `useMockData` o `mockDataSections`.
2. Se il mock è attivo per la sezione `clients`, `apiCall` **non chiama il vero backend** e restituisce dati finti da `mock.ts`.
3. In **produzione** (`import.meta.env.PROD`), `shouldUseMockData` ritorna sempre `false` — il mock non esiste in prod.

| ❌ Junior | ✅ Mid-Level |
|-----------|--------------|
| `queryFn: () => Promise.resolve([])` nella Page | `queryFn: () => clientsAPI.getAll()` — sempre |
| PR testata solo col mock acceso | Prima della PR: mock **spento**, refresh, verifica Network |
| Commit che forza `useMockData = true` in `client.ts` | Nessun default mock nel codice condiviso |

### Checklist pre-PR (esegui sul tuo browser)

1. Apri DevTools → scheda **Application** → **Local Storage** → cancella `useMockData` / `mockDataSections` oppure disattiva dal pannello dev.
2. Ricarica la pagina (F5).
3. Scheda **Network** → filtra `Fetch/XHR` → apri lista clienti.
4. Deve comparire una richiesta a `http://localhost:3000/api/clients` (o il tuo `VITE_API_URL`), **non** risposta istantanea senza network.
5. Status **200** (o 401 se non loggato) — dimostra che stai testando l’integrazione reale.

---

## 8.5 Quando estrarre hook di dominio

📁 Oggi molte liste vivono in `features/data/hooks.ts` (`useClients`, `useProjects`, …). Va bene finché il file resta leggibile.

| Situazione | Dove mettere gli hook |
|----------|------------------------|
| CRUD su entità già presenti (clienti, progetti) | Aggiungi in `features/data/hooks.ts` |
| Nuovo dominio grosso (es. “Rimborsi”, “HR candidati”) con 5+ query | Crea `features/<dominio>/hooks.ts` |
| Hook usato da una sola Page piccola | Può restare in `hooks.ts` con prefisso chiaro |

**Esempio struttura dominio nuovo:**

```
features/
  expense/
    hooks.ts      → useExpenseReimbursements, useExpenseMutations
  data/
    hooks.ts      → useClients, useProjects (esistenti)
```

La Page importa:

```ts
import { useExpenseReimbursements } from '../features/expense/hooks';
```

**Non** duplicare `queryKeys` nel file hook — importa sempre da `lib/query/keys.ts`.

---

*Capitolo 8 — v3 — appendice cache e mock*
