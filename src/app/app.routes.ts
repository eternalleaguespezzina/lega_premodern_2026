import { Routes } from '@angular/router';
import { ClassificaPage } from './pages/classifica/classifica';
import { TappePage } from './pages/tappe/tappe';
import { TappaPage } from './pages/tappa/tappa';
import { GiocatorePage } from './pages/giocatore/giocatore';
import { ScontriPage } from './pages/scontri/scontri';
import { CalendarioPage } from './pages/calendario/calendario';
import { EstrazionePage } from './pages/estrazione/estrazione';

const suffisso = ' · Lega Premodern ELS 2026';

export const routes: Routes = [
  { path: '', component: ClassificaPage, title: 'Classifica' + suffisso },
  { path: 'tappe', component: TappePage, title: 'Tappe' + suffisso },
  // :numero arriva al componente come input() grazie a withComponentInputBinding()
  { path: 'tappe/:numero', component: TappaPage, title: 'Tappa' + suffisso },
  { path: 'giocatore/:slug', component: GiocatorePage, title: 'Giocatore' + suffisso },
  { path: 'calendario', component: CalendarioPage, title: 'Calendario' + suffisso },
  { path: 'scontri', component: ScontriPage, title: 'Scontri diretti' + suffisso },
  { path: 'estrazione', component: EstrazionePage, title: 'Estrazione Tix' + suffisso },
  { path: '**', redirectTo: '' },
];
