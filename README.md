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

## App installabile (PWA)

Il sito si installa sul telefono come un'app, con l'icona dell'emblema ELS:

- **Android (Chrome)**: compare l'invito *Installa l'app* nel sito, oppure menu ⋮ → *Installa app*.
- **iPhone (Safari)**: *Condividi* → *Aggiungi alla schermata Home*. Il sito mostra le istruzioni a chi non l'ha ancora installata.

Il service worker di Angular (`ngsw-config.json`) fa aprire l'app all'istante e la fa funzionare anche
senza rete, con l'ultima classifica scaricata. Per `data.json` la strategia è *freshness*: prima la rete,
la copia salvata solo se la rete non risponde entro 6 secondi. Quindi i dati sono sempre aggiornati.

Quando si pubblica una nuova versione del codice, chi ha l'app la riceve alla riapertura successiva.

---

## Estrazione dei Tix

Pagina `#/estrazione`, raggiungibile dal link nel piè di pagina.

- Tutti vedono lo storico dei vincitori e possono fare **estrazioni di prova**, marcate *PROVA*.
- L'**estrazione ufficiale** si sblocca con la password, solo la sera della tappa, una volta per tappa.
- Nel sorteggio entrano gli iscritti che non hanno già vinto due volte; gli assenti si tolgono con −.
- Il vincitore viene scelto con il generatore casuale crittografico del browser, *prima* dell'animazione.

Il sito non può salvare: l'estrazione ufficiale resta memorizzata sul telefono di chi l'ha fatta
(nello storico compare *da registrare*) finché il vincitore non viene scritto nel foglio
**Estrazioni** dell'Excel e il `data.json` aggiornato.

La password non è salvata in chiaro: nel `data.json` c'è solo la sua impronta SHA-256
(cella H5 del foglio Estrazioni). Maiuscole e spazi non contano.

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
| `src/app/pages/estrazione/` | La slot machine per l'estrazione dei Tix |
| `src/app/invito/` | L'invito a installare l'app (Android: pulsante; iPhone: istruzioni) |
| `public/` | Logo, motivo di sfondo, icone dell'app, manifest e `data.json` |
| `ngsw-config.json` | Cosa conserva il service worker e come tratta i dati |

Le scelte di Angular 22 che si vedono nel codice:

- **componenti standalone**, senza NgModule;
- **signals** e `computed()` per tutti i dati derivati;
- **`resource()`** per il caricamento asincrono, con stato di caricamento ed errore già pronti;
- il nuovo **controllo di flusso** nei template: `@if`, `@for`, `@empty`;
- **`input()`** al posto di `@Input()`, alimentato dall'indirizzo grazie a `withComponentInputBinding()`;
- **niente zone.js**: l'aggiornamento della pagina è guidato dai signal;
- **`provideServiceWorker()`** e `host` nei componenti per ascoltare eventi della finestra.
