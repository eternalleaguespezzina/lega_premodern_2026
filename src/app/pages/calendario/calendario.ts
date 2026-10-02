import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LeagueData } from '../../league-data';
import { EventoCalendario } from '../../models';
import { dataEstesa } from '../../util';

@Component({
  selector: 'els-calendario',
  imports: [RouterLink],
  templateUrl: './calendario.html',
})
export class CalendarioPage {
  protected readonly lega = inject(LeagueData);
  protected readonly dataEstesa = dataEstesa;

  protected passato(e: EventoCalendario): boolean {
    return e.data < new Date().toISOString().slice(0, 10);
  }

  protected prossimo(e: EventoCalendario): boolean {
    return this.lega.prossimoEvento()?.data === e.data;
  }
}
