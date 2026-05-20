# Capstone — artefatti Design Engineer

Cartella **didattica** per [Capitolo 10](../cap10-capstone-rifare-schermata.md). Non fa parte del build `gestionale-app/`.

## File

| File | Uso |
|------|-----|
| [TEMPLATE-ADR-VISIVO.md](./TEMPLATE-ADR-VISIVO.md) | Copia e compila per il capstone (o incolla in descrizione PR) |
| `esercizio-<cognome>.md` | Opzionale — ADR consegnato dallo studente (non committare in `main` senza accordo tutor) |

## Flusso consigliato

1. Scegli schermata (cap10 § brief).
2. Duplica il template: `cp TEMPLATE-ADR-VISIVO.md esercizio-rossi.md`
3. Compila **prima** dell’implementazione (problema + vincoli + scelte previste).
4. Aggiorna dopo la PR con trade-off residui e screenshot.
5. Allega link al file nella descrizione PR o in `walkthrough/DESIGN-ENGINEER/capstone/` su branch `feat/capstone-*`.

## Cosa non mettere qui

- Codice applicativo — vive in `gestionale-app/src/`
- Segreti o `.env`
- Screenshot con dati personali reali — usa seed locale o blur
