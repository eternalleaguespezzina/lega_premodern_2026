import { Component, ElementRef, computed, effect, inject, signal, viewChild } from '@angular/core';
import { LeagueData } from '../../league-data';
import { dataEstesa } from '../../util';

/** Altezza di una riga del rullo, in pixel: deve coincidere con lo stile .rullo__voce. */
const RIGA = 64;
const DURATA_MS = 5600;
const SBLOCCO = 'els-estrazione-sbloccata';

interface Risultato {
  vincitore: string;
  ufficiale: boolean;
  tappa: number | null;
  quando: Date;
}

interface Giocatore {
  nome: string;
  presenze: number;
  vittorie: number;
}

/** Indice casuale uniforme con il generatore crittografico del browser (senza distorsioni). */
function indiceCasuale(n: number): number {
  const limite = Math.floor(0x100000000 / n) * n;
  const buf = new Uint32Array(1);
  do {
    crypto.getRandomValues(buf);
  } while (buf[0] >= limite);
  return buf[0] % n;
}

/** Mescola solo per l'effetto visivo del rullo: il vincitore è già stato scelto. */
function mescola<T>(lista: T[]): T[] {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Un nome a caso del pool, diverso da quelli indicati (se possibile). */
function altroNome(pool: string[], ...esclusi: string[]): string {
  const candidati = pool.filter((n) => !esclusi.includes(n));
  const lista = candidati.length ? candidati : pool;
  return lista[Math.floor(Math.random() * lista.length)];
}

/**
 * Il nastro del rullo: tanti giri mescolati, senza mai lo stesso nome due volte di fila,
 * con il vincitore in fondo e due nomi diversi da lui sotto.
 */
function costruisciNastro(pool: string[], vincitore: string): { nastro: string[]; posizione: number } {
  const nastro: string[] = [];
  while (nastro.length < 60) {
    const giro = mescola(pool);
    if (pool.length > 1 && nastro.length && giro[0] === nastro[nastro.length - 1]) {
      [giro[0], giro[1]] = [giro[1], giro[0]];
    }
    nastro.push(...giro);
  }
  if (pool.length > 1 && nastro[nastro.length - 1] === vincitore) {
    nastro[nastro.length - 1] = altroNome(pool, vincitore, nastro[nastro.length - 2]);
  }
  const posizione = nastro.length;
  const sotto = altroNome(pool, vincitore);
  nastro.push(vincitore, sotto, altroNome(pool, sotto, vincitore));
  return { nastro, posizione };
}

/** Impronta SHA-256 della password (maiuscole e spazi ignorati, per non sbagliare da telefono). */
async function impronta(testo: string): Promise<string> {
  const byte = new TextEncoder().encode(testo.trim().toLowerCase());
  const h = await crypto.subtle.digest('SHA-256', byte);
  return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function leggi(chiave: string): string | null {
  try {
    return localStorage.getItem(chiave);
  } catch {
    return null;
  }
}

function scrivi(chiave: string, valore: string): void {
  try {
    localStorage.setItem(chiave, valore);
  } catch {
    /* archiviazione non disponibile */
  }
}

const cognome = (nome: string) => nome.split(' ').slice(-1)[0];

const oggiIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

@Component({
  selector: 'els-estrazione',
  templateUrl: './estrazione.html',
})
export class EstrazionePage {
  protected readonly lega = inject(LeagueData);
  protected readonly dataEstesa = dataEstesa;
  protected readonly altezzaRiga = RIGA;

  // ---------------------------------------------------------------- tappa della serata
  /** La tappa di oggi (o di ieri, se si estrae dopo mezzanotte). */
  protected readonly tappaCorrente = computed(() => {
    const oggi = new Date(oggiIso() + 'T12:00:00').getTime();
    const t = this.lega
      .tappe()
      .find((x) => {
        const giorni = (oggi - new Date(x.data + 'T12:00:00').getTime()) / 86400000;
        return giorni >= 0 && giorni <= 1;
      });
    return t?.numero ?? null;
  });

  /** Estrazione ufficiale fatta su questo telefono ma non ancora registrata nell'Excel. */
  private readonly ufficialiLocali = signal(this.leggiUfficialiLocali());

  protected readonly estrazioniUfficiali = computed(() => {
    const registrate = this.lega.estrazioni().map((e) => ({ ...e, daRegistrare: false }));
    for (const loc of this.ufficialiLocali()) {
      if (!registrate.some((e) => e.tappa === loc.tappa)) {
        registrate.push({ tappa: loc.tappa, data: loc.data, vincitore: loc.vincitore, daRegistrare: true });
      }
    }
    return registrate.sort((a, b) => b.tappa - a.tappa);
  });

  protected readonly giaEstrattaStasera = computed(() => {
    const t = this.tappaCorrente();
    return t === null ? null : (this.estrazioniUfficiali().find((e) => e.tappa === t) ?? null);
  });

  // ---------------------------------------------------------------- giocatori e liste
  private readonly giocatori = computed<Giocatore[]>(() => {
    const presenze = new Map(this.lega.classifica().map((r) => [r.giocatore, r.presenze]));
    const vittorie = new Map<string, number>();
    for (const e of this.estrazioniUfficiali()) vittorie.set(e.vincitore, (vittorie.get(e.vincitore) ?? 0) + 1);
    return this.lega
      .giocatori()
      .map((nome) => ({ nome, presenze: presenze.get(nome) ?? 0, vittorie: vittorie.get(nome) ?? 0 }))
      // meno presenze in cima, poi per cognome come nell'Excel
      .sort((a, b) => a.presenze - b.presenze || cognome(a.nome).localeCompare(cognome(b.nome), 'it') || a.nome.localeCompare(b.nome, 'it'));
  });

  private readonly chiaveAssenti = `els-estrazione-assenti-${oggiIso()}`;
  protected readonly assenti = signal<Set<string>>(new Set(JSON.parse(leggi(this.chiaveAssenti) ?? '[]')));

  protected readonly eleggibili = computed(() => this.giocatori().filter((g) => g.vittorie < 2));
  protected readonly inEstrazione = computed(() => this.eleggibili().filter((g) => !this.assenti().has(g.nome)));
  protected readonly fuori = computed(() => this.eleggibili().filter((g) => this.assenti().has(g.nome)));
  protected readonly esclusi = computed(() => this.giocatori().filter((g) => g.vittorie >= 2));

  /** Pulsante "Chiudi" del risultato: riceve il focus, così la carta è sempre in vista. */
  private readonly pulsanteChiudi = viewChild<ElementRef<HTMLButtonElement>>('chiudi');

  constructor() {
    // il telefono si ricorda gli assenti della serata, nel caso la pagina venga ricaricata
    effect(() => scrivi(this.chiaveAssenti, JSON.stringify([...this.assenti()])));
    effect(() => this.pulsanteChiudi()?.nativeElement.focus());
    // sblocco già fatto in questa sessione del browser, con la password attuale
    effect(() => {
      const attesa = this.lega.dati.value()?.passwordEstrazioneHash ?? '';
      let salvata: string | null = null;
      try {
        salvata = sessionStorage.getItem(SBLOCCO);
      } catch {
        /* archiviazione non disponibile */
      }
      if (attesa && salvata === attesa) this.sbloccato.set(true);
    });
  }

  protected togli(nome: string): void {
    this.assenti.update((s) => new Set(s).add(nome));
  }

  protected rimetti(nome: string): void {
    this.assenti.update((s) => {
      const n = new Set(s);
      n.delete(nome);
      return n;
    });
  }

  // ---------------------------------------------------------------- password
  protected readonly passwordImpostata = computed(() => !!this.lega.dati.value()?.passwordEstrazioneHash);
  protected readonly sbloccato = signal(false);
  protected readonly passwordErrata = signal(false);

  protected async sblocca(valore: string): Promise<void> {
    const attesa = this.lega.dati.value()?.passwordEstrazioneHash ?? '';
    const ok = !!attesa && (await impronta(valore)) === attesa;
    this.sbloccato.set(ok);
    this.passwordErrata.set(!ok);
    // ricordato finché il browser resta aperto, così una ricarica non chiede di riscriverla
    if (ok) {
      try {
        sessionStorage.setItem(SBLOCCO, attesa);
      } catch {
        /* archiviazione non disponibile */
      }
    }
  }

  protected readonly ufficialePossibile = computed(
    () =>
      this.passwordImpostata() &&
      this.sbloccato() &&
      this.tappaCorrente() !== null &&
      !this.giaEstrattaStasera() &&
      this.inEstrazione().length > 0,
  );

  // ---------------------------------------------------------------- rullo
  protected readonly nastro = signal<string[]>([]);
  protected readonly spostamento = signal(0);
  protected readonly transizione = signal('none');
  protected readonly inCorsa = signal(false);
  protected readonly risultato = signal<Risultato | null>(null);

  /** Scintille dell'esplosione finale: direzione e ritardo fissi, calcolati una volta. */
  protected readonly scintille = Array.from({ length: 28 }, (_, i) => {
    const angolo = (i / 28) * Math.PI * 2;
    const distanza = 110 + (i % 4) * 28;
    return { x: Math.cos(angolo) * distanza, y: Math.sin(angolo) * distanza, ritardo: (i % 5) * 40 };
  });

  protected estrai(ufficiale: boolean): void {
    const pool = this.inEstrazione().map((g) => g.nome);
    if (!pool.length || this.inCorsa()) return;
    if (ufficiale && !this.ufficialePossibile()) return;

    const vincitore = pool[indiceCasuale(pool.length)]; // il sorteggio vero avviene qui
    const { nastro, posizione } = costruisciNastro(pool, vincitore);

    this.risultato.set(null);
    this.transizione.set('none');
    this.spostamento.set(0);
    this.nastro.set(nastro);
    this.inCorsa.set(true);

    // due fotogrammi: prima il rullo torna in cima senza animazione, poi parte la corsa
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        this.transizione.set(`transform ${DURATA_MS}ms cubic-bezier(0.1, 0.55, 0.08, 1)`);
        this.spostamento.set(-(posizione - 1) * RIGA);
      }),
    );

    setTimeout(() => {
      const tappa = this.tappaCorrente();
      const quando = new Date();
      this.inCorsa.set(false);
      this.risultato.set({ vincitore, ufficiale, tappa, quando });
      if (ufficiale && tappa !== null) {
        const record = { tappa, data: oggiIso(), vincitore, quando: quando.toISOString() };
        scrivi(`els-estrazione-ufficiale-${tappa}`, JSON.stringify(record));
        this.ufficialiLocali.update((l) => [...l.filter((x) => x.tappa !== tappa), record]);
      }
    }, DURATA_MS + 150);
  }

  protected chiudiRisultato(): void {
    this.risultato.set(null);
  }

  protected ora(d: Date): string {
    return d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  }

  private leggiUfficialiLocali(): { tappa: number; data: string; vincitore: string }[] {
    const trovate = [];
    for (let t = 1; t <= 10; t++) {
      const v = leggi(`els-estrazione-ufficiale-${t}`);
      if (!v) continue;
      try {
        const r = JSON.parse(v);
        if (r?.vincitore) trovate.push(r);
      } catch {
        /* dato rovinato: si ignora */
      }
    }
    return trovate;
  }
}
