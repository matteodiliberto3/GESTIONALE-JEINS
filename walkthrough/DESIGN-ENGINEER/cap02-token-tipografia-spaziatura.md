# Capitolo 2 — Token, tipografia, spaziatura

---

## Contesto

Il modo più veloce per rovinare la coerenza JEINS è introdurre un grigio o un padding “giusto per questa card”. I token esistono perché **tema chiaro/scuro** e **review** restino prevedibili: cambi `--surface` una volta, non 40 file.

Questo capitolo collega `index.css` (sorgente semantica) a `tailwind.config.js` (API in JSX).

---

## Codice ancoraggio — variabili CSS

📁 `gestionale-app/src/index.css`

```8:18:gestionale-app/src/index.css
  :root {
    --surface:        250 252 251;
    --surface-raised: 255 255 255;
    --surface-sunken: 244 248 246;
    --surface-inset:  236 242 239;
    --ink:            12 20 16;
    --ink-muted:      55 72 64;
    --ink-subtle:     100 118 108;
    --line:           214 226 220;
    --line-strong:    186 202 194;
  }
```

Tema scuro: stesse chiavi, valori diversi sotto `.dark` (classe su `html`, vedi `theme/ThemeProvider.tsx`).

**Body e focus globale:**

```36:63:gestionale-app/src/index.css
  body {
    @apply bg-surface text-ink font-sans antialiased;
    font-feature-settings: 'cv11', 'ss01', 'ss03';
  }
  ...
  :focus-visible {
    outline: 2px solid rgb(26 122 85 / 0.55);
    outline-offset: 2px;
  }
```

Non rimuovere `:focus-visible` per “pulizia” — è il baseline accessibilità del progetto.

---

## Codice ancoraggio — mapping Tailwind

📁 `gestionale-app/tailwind.config.js`

```13:49:gestionale-app/tailwind.config.js
      colors: {
        surface: {
          DEFAULT: 'rgb(var(--surface) / <alpha-value>)',
          raised:  'rgb(var(--surface-raised) / <alpha-value>)',
          ...
        },
        ink: {
          DEFAULT: 'rgb(var(--ink) / <alpha-value>)',
          muted:   'rgb(var(--ink-muted) / <alpha-value>)',
          subtle:  'rgb(var(--ink-subtle) / <alpha-value>)',
        },
        line: {
          DEFAULT: 'rgb(var(--line) / <alpha-value>)',
          strong:  'rgb(var(--line-strong) / <alpha-value>)',
        },
```

**Pattern d’uso in JSX:**

| Intent | Classi |
|--------|--------|
| Sfondo pagina | `bg-surface` (già su `body`) |
| Card / pannello | `card`, `bg-surface-raised`, `border-line/70` |
| Testo principale | `text-ink` |
| Label secondarie | `text-ink-muted` |
| Hint / metadati | `text-ink-subtle` |
| Separatori | `border-line`, `border-line/60` |
| Brand / CTA | `primary-600`, `brand-*` (scala fissa in config) |

Classi componenti in `@layer components` — es. `.card`, `.icon-btn`, `.nav-rail-btn` — **preferiscile** a duplicare 8 classi in ogni file.

---

## Tipografia e ritmo

| Elemento | Convenzione JEINS |
|----------|-------------------|
| Font | Inter (`index.css` import + `fontFamily.sans` in Tailwind) |
| Titolo pagina | spesso da `TopBar` / heading in View — `text-lg`–`text-xl`, `font-semibold`, `text-ink` |
| Corpo | `text-sm` / `text-base` su tabelle e form |
| Ritmo verticale | multipli di 4px Tailwind (`py-5` main, `gap-4`/`gap-6` tra sezioni) |
| Densità B2B | tabelle `text-sm`; non ingrandire tutto per “aria più moderna” |

📁 `gestionale-app/src/design-system/tailwind-theme.ts` — estensioni tema; consultare prima di aggiungere chiavi duplicate in config.

---

## Diagramma — flusso token

```mermaid
flowchart TB
    CSS[index.css :root / .dark]
    TW[tailwind.config.js extend.colors]
    JSX[className bg-surface text-ink]
    COMP[@layer components .card]
    CSS --> TW
    TW --> JSX
    CSS --> COMP
    COMP --> JSX
```

---

## Alternative scartate

| ❌ Junior | ✅ Design engineer |
|-----------|-------------------|
| `#1a1a1a`, `bg-gray-800` | `bg-surface`, `text-ink` |
| `style={{ padding: 13 }}` | `p-4`, `px-6` |
| Nuovo colore in un solo file | estensione token + review |
| Copiare palette da sito marketing | brand JEINS è verde amministrativo, non neon |

---

## Trade-off

| Scelta | Pro | Contro |
|--------|-----|--------|
| CSS variables + Tailwind rgb | tema istantaneo | sintassi `rgb(var(--x) / <alpha-value>)` da rispettare |
| Classi `.card` condivise | coerenza ombre/bordi | meno flessibilità per card “unica” |
| `brand`/`accent` fissi in config | grafici e badge leggibili | non è un tema “generativo” tipo Radix |
| Alpha su `border-line/60` | gerarchia senza nuovi colori | troppi alpha diversi → caos (max 2–3 opacità per feature) |

---

## Esercizio valutabile

Apri `gestionale-app/src/views/ClientiView.tsx` (o altra View assegnata dal tutor).

1. Elenca **ogni** classe colore/sfondo/bordo che **non** usa token `surface`/`ink`/`line`/`primary`.
2. Proponi sostituzione token-per-token (tabella: prima → dopo).
3. Implementa **solo** le sostituzioni su branch — nessun cambio layout strutturale.

**Valutazione:** `npm run build` ok; screenshot chiaro/scuro affiancati; zero hex nuovi nel diff.

---

## Limiti nel repo

- **`EmptyState`**, alcuni widget dashboard: ancora `neutral-*` — migrazione graduale, non blocker se non tocchi il file.
- **`error-*` / `success-*` scale** in Tailwind: usare per stati semantici, non per sfondi pagina.
- **Scrollbar custom** in `index.css` — non replicare per ogni pannello scrollabile.
- Approfondimento operativo Mid-Level: [cap05 UI](../MID-LEVEL/cap05-ui-design-system-tailwind-motion.md) (overlap voluto — qui focus token).

---

*Prossimo: [Capitolo 3 — Primitivi e composizione](./cap03-primitivi-composizione.md)*
