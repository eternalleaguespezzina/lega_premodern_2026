# Lega Premodern ELS 2026 — sito

Sito in sola lettura con classifica, tappe, schede giocatore, calendario e scontri diretti
della Lega Premodern della Eternal League Spezzina. Fatto con Angular 22.

Tutti i dati stanno in **un solo file: `public/data.json`**, generato dall'Excel della classifica.
Il sito si limita a leggerlo.

---

## Mettere online la prima volta

1. **Crea un repository** su GitHub, per esempio `els-lega`.
   Deve essere **pubblico**: con un account gratuito GitHub Pages funziona solo sui repository pubblici.

2. **Carica il contenuto di questa cartella** (i file, non la cartella che li contiene).
   Il modo più sicuro è con git, perché carica anche la cartella nascosta `.github`:

   ```bash
   git init
   git add .
   git commit -m "Sito della lega"
   git branch -M main
   git remote add origin https://github.com/TUO-UTENTE/els-lega.git
   git push -u origin main
   ```

3. **Attiva Pages**: nel repository vai su *Settings → Pages → Build and deployment*
   e alla voce *Source* scegli **GitHub Actions**.

4. Apri la scheda **Actions**: parte il flusso *Pubblica il sito*. Dopo un paio di minuti
   il sito è online all'indirizzo:

   ```
   https://TUO-UTENTE.github.io/els-lega/
   ```

---

## Aggiornare il sito ogni settimana

Dopo ogni tappa si sostituisce solo `public/data.json`:

1. Nel repository apri la cartella `public`.
2. *Add file → Upload files* e trascina il nuovo `data.json`: sostituisce quello vecchio.
3. Scrivi un messaggio (es. "Tappa 2") e premi *Commit changes*.

La pubblicazione riparte da sola: in un paio di minuti il sito è aggiornato.
Si può controllare l'avanzamento nella scheda *Actions*.

---

## Lavorarci in locale

Serve Node 24 (c'è il file `.nvmrc`, quindi con nvm basta `nvm use`).

```bash
npm ci        # installa le dipendenze
npm start     # sito di sviluppo su http://localhost:4200
npm run build # versione di produzione in dist/els-lega/browser
```

---

## Com'è fatto (per chi studia Angular)

| File | Cosa contiene |
|---|---|
| `src/app/models.ts` | I tipi dei dati di `data.json` |
| `src/app/league-data.ts` | Il servizio che carica i dati con `resource()` e li espone come signal |
| `src/app/app.routes.ts` | Le pagine e i loro indirizzi |
| `src/app/app.config.ts` | Router con indirizzi `#/…` (funzionano su GitHub Pages senza configurare il server) e parametri passati ai componenti come `input()` |
| `src/app/pages/…` | Una cartella per pagina: classifica, tappe, tappa, giocatore, calendario, scontri |
| `src/styles.scss` | Tutto lo stile del sito: colori del logo, caratteri, impaginazione |
| `public/` | Logo, motivo di sfondo, icona e `data.json` |

Le scelte di Angular 22 che si vedono nel codice:

- **componenti standalone**, senza NgModule;
- **signals** e `computed()` per tutti i dati derivati;
- **`resource()`** per il caricamento asincrono, con stato di caricamento ed errore già pronti;
- il nuovo **controllo di flusso** nei template: `@if`, `@for`, `@empty`;
- **`input()`** al posto di `@Input()`, alimentato dall'indirizzo grazie a `withComponentInputBinding()`;
- **niente zone.js**: l'aggiornamento della pagina è guidato dai signal.
