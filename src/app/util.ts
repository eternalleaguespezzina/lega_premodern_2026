/** Piccole funzioni di supporto condivise dalle pagine. */

/** "Marco Doveri" -> "marco-doveri", usato negli indirizzi delle schede giocatore. */
export function creaSlug(nome: string): string {
  return nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const formatoLungo = new Intl.DateTimeFormat('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
const formatoBreve = new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'short' });

/** "2026-10-01" -> "giovedì 1 ottobre" (mezzogiorno per evitare scivolamenti di fuso). */
export function dataEstesa(iso: string): string {
  return formatoLungo.format(new Date(iso + 'T12:00:00'));
}

/** "2026-10-01" -> "1 ott". */
export function dataBreve(iso: string): string {
  return formatoBreve.format(new Date(iso + 'T12:00:00'));
}

/** Zero mostrato come trattino, per alleggerire le tabelle. */
export function oTrattino(n: number): string | number {
  return n === 0 ? '–' : n;
}
