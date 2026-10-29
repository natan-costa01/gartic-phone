export const ENIGMA_LIMIT = 6;
export function normalizeEnigma(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').replace(/[^a-z0-9]/g, '');
}
export function enigmaDate(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone:'America/Sao_Paulo', year:'numeric', month:'2-digit', day:'2-digit' }).format(now);
}
export function previousEnigmaDate(date: string) {
  const day = new Date(`${date}T12:00:00Z`);
  day.setUTCDate(day.getUTCDate() - 1);
  return day.toISOString().slice(0, 10);
}
export function enigmaStreak(wins: string[], today: string) {
  const dates = new Set(wins);
  let date = dates.has(today) ? today : previousEnigmaDate(today), streak = 0;
  while (dates.has(date)) { streak++; date = previousEnigmaDate(date); }
  return streak;
}
export type EnigmaResult = {
  id: number; day: string; mode: 'daily'; category: string;
  attempts: { value: string; correct: boolean }[];
  finished: boolean; won: boolean; answer: string | null; score: number;
};
