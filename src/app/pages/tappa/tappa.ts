import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LeagueData } from '../../league-data';
import { creaSlug, dataEstesa } from '../../util';

@Component({
  selector: 'els-tappa',
  imports: [RouterLink],
  templateUrl: './tappa.html',
})
export class TappaPage {
  /** Parametro :numero dell'indirizzo. */
  readonly numero = input.required<string>();

  protected readonly lega = inject(LeagueData);
  protected readonly creaSlug = creaSlug;
  protected readonly dataEstesa = dataEstesa;

  protected readonly n = computed(() => Number(this.numero()));
  protected readonly tappa = computed(() => this.lega.tappe().find((t) => t.numero === this.n()) ?? null);
  protected readonly vincitore = computed(() => this.tappa()?.righe.find((r) => r.primo)?.giocatore ?? '');
  protected readonly giantKiller = computed(() => this.tappa()?.righe.find((r) => r.giantKiller)?.giocatore ?? '');

  /** Partite raggruppate per turno. */
  protected readonly turni = computed(() => {
    const partite = this.lega.partite().filter((p) => p.tappa === this.n());
    const numeri = [...new Set(partite.map((p) => p.turno))].sort((a, b) => a - b);
    return numeri.map((turno) => ({ turno, partite: partite.filter((p) => p.turno === turno) }));
  });
}
