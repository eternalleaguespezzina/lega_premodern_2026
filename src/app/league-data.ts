import { Injectable, computed, resource } from '@angular/core';
import { DatiLega, EventoCalendario } from './models';

/**
 * I dati arrivano da data.json. Nell'anteprima a file unico sono incorporati
 * nella pagina in <script id="els-dati">: se ci sono si usano quelli.
 */
async function caricaDati(): Promise<DatiLega> {
  const incorporati = document.getElementById('els-dati');
  if (incorporati?.textContent?.trim()) {
    return JSON.parse(incorporati.textContent) as DatiLega;
  }
  const risposta = await fetch('data.json', { cache: 'no-cache' });
  if (!risposta.ok) {
    throw new Error(`data.json non disponibile (${risposta.status})`);
  }
  return (await risposta.json()) as DatiLega;
}

/** Servizio unico: carica i dati una volta e li espone come signal. */
@Injectable({ providedIn: 'root' })
export class LeagueData {
  /** resource(): stato di caricamento, errore e valore, tutti come signal. */
  readonly dati = resource({ loader: () => caricaDati() });

  readonly classifica = computed(() => this.dati.value()?.classifica ?? []);
  readonly tappe = computed(() => this.dati.value()?.tappe ?? []);
  readonly partite = computed(() => this.dati.value()?.partite ?? []);
  readonly calendario = computed(() => this.dati.value()?.calendario ?? []);
  readonly giocatori = computed(() => this.dati.value()?.giocatori ?? []);

  readonly capolista = computed(() => this.classifica()[0] ?? null);

  /** Primo appuntamento da oggi in avanti. */
  readonly prossimoEvento = computed<EventoCalendario | null>(() => {
    const oggi = new Date().toISOString().slice(0, 10);
    return this.calendario().find((e) => e.data >= oggi) ?? null;
  });
}
