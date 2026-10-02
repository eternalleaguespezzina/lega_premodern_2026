import { Component, computed, signal } from '@angular/core';

/** Evento di Chrome/Android che permette di mostrare il proprio pulsante "Installa". */
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const CHIAVE = 'els-invito-installazione-chiuso';

function giaInstallata(): boolean {
  const aSchermoIntero =
    typeof window.matchMedia === 'function' && window.matchMedia('(display-mode: standalone)').matches;
  return aSchermoIntero || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

function suIos(): boolean {
  const ua = navigator.userAgent;
  // gli iPad recenti si presentano come Mac: li riconosciamo dal touch
  return /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function giaChiuso(): boolean {
  try {
    return localStorage.getItem(CHIAVE) === '1';
  } catch {
    return false;
  }
}

/**
 * Invito a installare l'app.
 * Android: pulsante "Installa" (evento beforeinstallprompt).
 * iPhone: istruzioni, perché Safari non ha un avviso automatico.
 * Non compare se l'app è già installata o se l'invito è stato chiuso.
 */
@Component({
  selector: 'els-invito-installazione',
  templateUrl: './invito-installazione.html',
  host: {
    '(window:beforeinstallprompt)': 'quandoInstallabile($event)',
    '(window:appinstalled)': 'segnaInstallata()',
  },
})
export class InvitoInstallazione {
  private readonly richiesta = signal<BeforeInstallPromptEvent | null>(null);
  protected readonly installata = signal(giaInstallata());
  protected readonly chiuso = signal(giaChiuso());
  private readonly ios = suIos();

  protected readonly mostraPulsante = computed(() => !!this.richiesta() && !this.installata() && !this.chiuso());
  protected readonly mostraIstruzioniIos = computed(() => this.ios && !this.installata() && !this.chiuso());

  protected quandoInstallabile(evento: Event): void {
    evento.preventDefault(); // al posto dell'avviso automatico di Chrome usiamo il nostro pulsante
    this.richiesta.set(evento as BeforeInstallPromptEvent);
  }

  protected async installa(): Promise<void> {
    const richiesta = this.richiesta();
    if (!richiesta) return;
    await richiesta.prompt();
    const scelta = await richiesta.userChoice;
    this.richiesta.set(null);
    if (scelta.outcome === 'accepted') this.installata.set(true);
  }

  protected segnaInstallata(): void {
    this.installata.set(true);
  }

  protected chiudi(): void {
    this.chiuso.set(true);
    try {
      localStorage.setItem(CHIAVE, '1');
    } catch {
      /* archiviazione non disponibile: l'invito ricomparirà alla prossima visita */
    }
  }
}
