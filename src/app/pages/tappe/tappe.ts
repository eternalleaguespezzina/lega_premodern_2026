import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LeagueData } from '../../league-data';
import { Tappa } from '../../models';
import { dataEstesa } from '../../util';

@Component({
  selector: 'els-tappe',
  imports: [RouterLink],
  templateUrl: './tappe.html',
})
export class TappePage {
  protected readonly lega = inject(LeagueData);
  protected readonly dataEstesa = dataEstesa;

  protected vincitore(t: Tappa): string {
    return t.righe.find((r) => r.primo)?.giocatore ?? '';
  }

  protected giantKiller(t: Tappa): string {
    return t.righe.find((r) => r.giantKiller)?.giocatore ?? '';
  }
}
