import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LeagueData } from './league-data';
import { dataEstesa } from './util';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
})
export class App {
  protected readonly lega = inject(LeagueData);
  protected readonly dataEstesa = dataEstesa;
}
