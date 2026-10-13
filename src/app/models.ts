/** Tipi dei dati pubblicati in data.json (generato dall'Excel della classifica). */

export type Zona = 'finale' | 'lcq' | '';

export interface RigaClassifica {
  pos: number;
  giocatore: string;
  punti: number;
  matchVinti: number;
  gameVinti: number;
  serateVinte: number;
  giantKiller: number;
  presenze: number;
  assenze: number;
  zona: Zona;
  /** Pari merito che gli scontri diretti non risolvono. */
  parita: boolean;
}

export interface RigaTappa {
  pos: number;
  giocatore: string;
  punti: number;
  matchVinti: number;
  matchPersi: number;
  pareggi: number;
  gameVinti: number;
  gamePersi: number;
  /** Primo iscritto della serata secondo l'ordine di Melee. */
  primo: boolean;
  giantKiller: boolean;
  mazzo: string;
}

export interface Tappa {
  numero: number;
  data: string;
  giocata: boolean;
  bersaglioGk: string;
  righe: RigaTappa[];
}

export interface Partita {
  tappa: number;
  turno: number;
  a: string;
  gameA: number;
  gameB: number;
  b: string;
  /** Nome del vincitore, oppure "Pareggio". */
  vincitore: string;
}

export interface EventoCalendario {
  tipo: 'tappa' | 'lcq' | 'finale' | 'cena';
  numero?: number;
  data: string;
  titolo: string;
  formato: string;
}

/** Estrazione ufficiale dei Tix (foglio Estrazioni dell'Excel). */
export interface Estrazione {
  tappa: number;
  data: string;
  vincitore: string;
}

export interface DatiLega {
  stagione: string;
  aggiornato: string;
  tappeGiocate: number;
  ultimoPostoLcq: number;
  giocatori: string[];
  classifica: RigaClassifica[];
  tappe: Tappa[];
  partite: Partita[];
  calendario: EventoCalendario[];
  estrazioni: Estrazione[];
  /** Impronta SHA-256 della password per l'estrazione ufficiale; vuota = non impostata. */
  passwordEstrazioneHash: string;
}
