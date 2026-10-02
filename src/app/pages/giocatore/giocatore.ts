import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LeagueData } from '../../league-data';
import { creaSlug, dataBreve } from '../../util';

interface Scontro {
  avversario: string;
  vinte: number;
  perse: number;
}

@Component({
  selector: 'els-giocatore',
  imports: [RouterLink],
  templateUrl: './giocatore.html',
})
export class GiocatorePage {
  /** Parametro :slug dell'indirizzo, es. "marco-doveri". */
  readonly slug = input.required<string>();

  protected readonly lega = inject(LeagueData);
  protected readonly creaSlug = creaSlug;
  protected readonly dataBreve = dataBreve;

  protected readonly nome = computed(
    () => this.lega.giocatori().find((g) => creaSlug(g) === this.slug()) ?? '',
  );
  protected readonly riga = computed(
    () => this.lega.classifica().find((r) => r.giocatore === this.nome()) ?? null,
  );

  protected readonly partite = computed(() =>
    this.lega
      .partite()
      .filter((p) => p.a === this.nome() || p.b === this.nome())
      .map((p) => {
        const casa = p.a === this.nome();
        return {
          tappa: p.tappa,
          turno: p.turno,
          avversario: casa ? p.b : p.a,
          miei: casa ? p.gameA : p.gameB,
          suoi: casa ? p.gameB : p.gameA,
          esito: p.vincitore === this.nome() ? 'V' : p.vincitore === 'Pareggio' ? 'P' : 'S',
        };
      }),
  );

  protected readonly record = computed(() => {
    const ps = this.partite();
    return {
      vinte: ps.filter((p) => p.esito === 'V').length,
      perse: ps.filter((p) => p.esito === 'S').length,
      pari: ps.filter((p) => p.esito === 'P').length,
      gameVinti: ps.reduce((s, p) => s + p.miei, 0),
      gamePersi: ps.reduce((s, p) => s + p.suoi, 0),
    };
  });

  protected readonly perTappa = computed(() =>
    this.lega
      .tappe()
      .filter((t) => t.giocata)
      .map((t) => ({ numero: t.numero, data: t.data, riga: t.righe.find((r) => r.giocatore === this.nome()) ?? null })),
  );

  protected readonly scontri = computed<Scontro[]>(() => {
    const mappa = new Map<string, Scontro>();
    for (const p of this.partite()) {
      const s = mappa.get(p.avversario) ?? { avversario: p.avversario, vinte: 0, perse: 0 };
      if (p.esito === 'V') s.vinte++;
      if (p.esito === 'S') s.perse++;
      mappa.set(p.avversario, s);
    }
    return [...mappa.values()].sort((a, b) => a.avversario.localeCompare(b.avversario));
  });
}
