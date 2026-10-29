import { randomInt } from 'node:crypto';
import { enigmaDate, normalizeEnigma, ENIGMA_LIMIT, type EnigmaResult } from './enigma';
// This answer bank is imported only by server routes.
const PUZZLES = [
  ['gato', 'Animal', ['gatinho', 'gata']],
  ['maçã', 'Fruta', []],
  ['chave de fenda', 'Ferramenta', []],
  ['computador', 'Tecnologia', ['pc', 'computador de mesa']],
  ['bicicleta', 'Transporte', ['bike']],
  ['foguete', 'Espaço', []],
  ['sorvete', 'Comida', ['casquinha', 'sorvete de casquinha']],
  ['elefante', 'Animal', []],
  ['guarda-chuva', 'Objeto', ['sombrinha']],
  ['violão', 'Instrumento musical', []],
  ['pizza', 'Comida', ['fatia de pizza', 'pedaço de pizza']],
  ['castelo', 'Construção', []],
] as const;
export function dailyEnigmaId(day: string) {
  const days = Math.floor(Date.parse(`${day}T12:00:00Z`) / 86400000);
  return ((days * 5 + 7) % PUZZLES.length + PUZZLES.length) % PUZZLES.length;
}
export function evaluateEnigma(input: Record<string, unknown>, now = new Date()): EnigmaResult {
  if (input.mode !== 'daily' && input.mode !== 'free') throw Error('Modo inválido.');
  const day = enigmaDate(now);
  const id = input.mode === 'daily' ? dailyEnigmaId(day)
    : input.id === undefined ? randomFreeId(input.exclude) : Number(input.id);
  if (!Number.isInteger(id) || id < 0 || id >= PUZZLES.length) throw Error('Desafio inválido.');
  if (input.mode === 'daily' && input.day !== undefined && input.day !== day)
    throw Error('Um novo desafio do dia chegou. Recarregue a página.');
  const guesses = input.guesses ?? [];
  if (!Array.isArray(guesses) || guesses.length > ENIGMA_LIMIT || guesses.some(g => typeof g !== 'string' || !g.trim() || Array.from(g).length > 50))
    throw Error('Use até 6 tentativas de 1 a 50 caracteres.');
  const [answer, category, aliases] = PUZZLES[id];
  const accepted = [answer, ...aliases].map(normalizeEnigma);
  const attempts: EnigmaResult['attempts'] = [];
  for (const value of guesses as string[]) {
    const correct = accepted.includes(normalizeEnigma(value));
    attempts.push({ value:value.trim(), correct });
    if (correct) break;
  }
  const won = attempts.some(a => a.correct), finished = won || attempts.length === ENIGMA_LIMIT;
  return { id, day, mode:input.mode, category, attempts, won, finished, answer:finished ? answer : null,
    score:won ? (7 - attempts.length) * 100 : 0 };
}
function randomFreeId(exclude: unknown) {
  const choices = PUZZLES.map((_, i) => i).filter(i => i !== exclude);
  return choices[randomInt(choices.length)];
}
