import { randomInt } from 'node:crypto';
import type { Room } from './game';
export type GuessState = {
  word: string; drawing: string; solved: string[];
  scores: Record<string, number>; lastGuess: Record<string, number>;
  messages: { id: number; playerId: string; text: string; correct: boolean; points: number }[];
  intermission: boolean;
};
const WORDS = ['elefante','bicicleta','astronauta','castelo','girassol','pipoca','dinossauro','sereia','cachoeira','helicóptero','sorvete','tartaruga','foguete','guarda-chuva','violão','abacaxi','pinguim','montanha','borboleta','pirata','churrasco','jacaré','vulcão','robô','camelo','polvo','canguru','geladeira','espantalho','caranguejo','palhaço','escada','tesoura','coração','travesseiro','coroa','sanduíche','tubarão','morcego','zumbi'];
export const normalizeGuess = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR').replace(/[^a-z0-9]/g,'');
export function guessDrawer(room: Room) { return room.players[room.round % room.players.length].id; }
export function startGuessTurn(room: Room, now: number) {
  const old = room.guess;
  room.guess = { word: WORDS[randomInt(WORDS.length)], drawing:'', solved:[], scores:old?.scores ?? {}, lastGuess:{}, messages:[], intermission:false };
  room.deadline = now + 90000;
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
