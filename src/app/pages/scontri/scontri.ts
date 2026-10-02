import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LeagueData } from '../../league-data';
import { creaSlug } from '../../util';

@Component({
  selector: 'els-scontri',
  imports: [RouterLink],
  templateUrl: './scontri.html',
})
export class ScontriPage {
  protected readonly lega = inject(LeagueData);
  protected readonly creaSlug = creaSlug;

  /** Solo chi ha giocato almeno una partita, in ordine di classifica. */
  protected readonly nomi = computed(() => {
    const giocato = new Set(this.lega.partite().flatMap((p) => [p.a, p.b]));
    return this.lega
      .classifica()
      .map((r) => r.giocatore)
      .filter((n) => giocato.has(n));
  });

  /** Vittorie e sconfitte di "a" contro "b". */
  protected cella(a: string, b: string): { v: number; s: number } | null {
    let v = 0;
    let s = 0;
    for (const p of this.lega.partite()) {
      if (p.vincitore === a && (p.a === b || p.b === b)) v++;
      if (p.vincitore === b && (p.a === a || p.b === a)) s++;
    }
    return v + s ? { v, s } : null;
  }

  protected iniziali(nome: string): string {
    return nome
      .split(' ')
      .map((x) => x[0])
      .join('');
  }
}
