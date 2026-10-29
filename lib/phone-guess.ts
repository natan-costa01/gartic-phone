import { DRAWING_IDEAS } from "./drawing-ideas";
import { GUESS_DURATION_MS } from "./guess-scoring";
import { randomInt } from 'node:crypto';
import type { Room } from './game';
export type GuessState = {
  word: string; drawing: string; solved: string[];
  scores: Record<string, number>; lastGuess: Record<string, number>;
  messages: { id: number; playerId: string; text: string; correct: boolean; points: number }[];
  intermission: boolean;
  usedWords?: string[];
};

export const normalizeGuess = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR').replace(/[^a-z0-9]/g,'');
export function guessDrawer(room: Room) { return room.players[room.round % room.players.length].id; }
export function startGuessTurn(room: Room, now: number) {
  const old = room.guess;
  const usedWords = old?.usedWords ?? [];
  const available = DRAWING_IDEAS.filter(word => !usedWords.includes(word));
  const choices = available.length ? available : DRAWING_IDEAS;
  const word = choices[randomInt(choices.length)];
  room.guess = { word, drawing:'', solved:[],
    scores:old?.scores ?? Object.fromEntries(room.players.map(p => [p.id, 0])),
    lastGuess:{}, messages:[], intermission:false, usedWords:[...usedWords, word] };
  room.deadline = now + GUESS_DURATION_MS;
}
export function endGuessTurn(room: Room, now: number) {
  room.guess!.intermission = true;
  room.deadline = now + 8000;
}
export function tickGuess(room: Room, now: number) {
  if (now < room.deadline) return false;
  if (!room.guess!.intermission) endGuessTurn(room,now);
  else {
    room.round++;
    if (room.round >= room.totalRounds) { room.status='finished'; room.deadline=0; }
    else startGuessTurn(room,now);
  }
  return true;
}
export function guessView(room: Room, me: string) {
  const g=room.guess;
  if (!g || room.mode !== 'phoneguess') return null;
  const show = guessDrawer(room)===me || g.solved.includes(me) || g.intermission || room.status==='finished';
  return { drawing:g.drawing, drawerId:guessDrawer(room), word:show ? g.word : null,
    hint:Array.from(g.word).map(c=>c===' '||c==='-'?c:'_').join(' '), solved:g.solved,
    scores:g.scores, messages:g.messages, intermission:g.intermission };
}
