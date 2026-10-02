import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LeagueData } from '../../league-data';
import { creaSlug, dataEstesa, oTrattino } from '../../util';

@Component({
  selector: 'els-classifica',
  imports: [RouterLink],
  templateUrl: './classifica.html',
})
export class ClassificaPage {
  protected readonly lega = inject(LeagueData);
  protected readonly creaSlug = creaSlug;
  protected readonly dataEstesa = dataEstesa;
  protected readonly oTrattino = oTrattino;

  protected readonly tappeGiocate = computed(() => this.lega.dati.value()?.tappeGiocate ?? 0);
  protected readonly ultimoLcq = computed(() => this.lega.dati.value()?.ultimoPostoLcq ?? 10);

  /** Dalla tappa 2 il bersaglio del giant killer è il capoclassifica. */
  protected readonly bersaglio = computed(() => {
    const e = this.lega.prossimoEvento();
    if (e?.tipo !== 'tappa' || (e.numero ?? 0) < 2) return '';
    return this.lega.capolista()?.giocatore ?? '';
  });

  /** Bersaglio di riserva: il secondo in classifica, se il capoclassifica manca o non perde. */
  protected readonly riserva = computed(() =>
    this.bersaglio() ? (this.lega.classifica()[1]?.giocatore ?? '') : '',
  );
}
