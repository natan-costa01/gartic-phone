import { guessPoints } from "./guess-scoring";
import { startGuessTurn, tickGuess, guessDrawer, guessView, endGuessTurn, normalizeGuess, type GuessState } from "./phone-guess";
import { parseCharacter, type Character } from "./characters";
import { AUTO_SEND_GRACE_MS, timeOptionsFor } from "./settings";
import { randomBytes, createHash } from "node:crypto";
export type Entry = {
  kind: "phrase" | "drawing";
  value: string;
  playerId: string;
  timedOut?: boolean;
};
export type Player = {
  id: string;
  name: string;
  secret: string;
  avatar?: Character;
};
export type GameMode = "classic" | "chaos" | "lightning" | "phoneguess";
export type Room = {
  guess?: GuessState;
  revealCursor?: number;
  allRevealed?: boolean;
  mode?: GameMode;
  autoSendDrawings?: boolean;
  gameId?: string;
  code: string;
  version: number;
  hostId: string;
  players: Player[];
  status: "lobby" | "playing" | "finished";
  round: number;
  totalRounds: number;
  seconds: number;
  ending: "auto" | "phrase" | "drawing";
  deadline: number;
  albums: Entry[][];
  createdAt: number;
};
export class GameError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export const hash = (token: string) =>
  createHash("sha256").update(token).digest("hex");
export const id = () => randomBytes(18).toString("hex");
export function nameOf(value: unknown) {
  if (typeof value !== "string" || !value.trim() || value.trim().length > 24)
    throw new GameError("Use um nome de 1 a 24 caracteres.");
  return value.trim();
}
export function characterOf(value: unknown): Character {
  try {
    return parseCharacter(value);
  } catch (e) {
    throw new GameError(
      e instanceof Error ? e.message : "Personagem inválido.",
    );
  }
}
export function createRoom(name: unknown, now = Date.now(), avatar?: unknown) {
  const token = id(),
    player = {
      id: id(),
      name: nameOf(name),
      secret: hash(token),
      avatar: characterOf(avatar),
    };
  const code = Array.from(
    randomBytes(6),
    (b) => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[b % 32],
  ).join("");
  const room: Room = {
    code,
    version: 0,
    hostId: player.id,
    players: [player],
    status: "lobby",
    round: 0,
    totalRounds: 0,
    mode: "classic",
    seconds: 90,
    ending: "auto",
    deadline: 0,
    albums: [],
    createdAt: now,
  };
  return { room, token };
}
export function authenticate(room: Room, token: string) {
  const p = room.players.find((p) => p.secret === hash(token));
  if (!p) throw new GameError("Sua sessão nesta sala não foi encontrada.", 401);
  return p;
}
export function albumIndex(room: Room, playerId: string) {
  const n = room.players.length;
  return (
    (room.players.findIndex((p) => p.id === playerId) - (room.round % n) + n) %
    n
  );
}
export function kindAt(
  round: number,
  mode: GameMode = "classic",
): Entry["kind"] {
  return mode === "chaos" || round % 2 ? "drawing" : "phrase";
}
function advance(room: Room, now: number) {
  room.round++;
  if (room.round >= room.totalRounds) {
    room.status = "finished";
    room.revealCursor = 0;
    room.allRevealed = false;
    room.deadline = 0;
  } else room.deadline = now + room.seconds * 1000;
}
export function roundClosesAt(room: Room) {
  return (
    room.deadline +
    (room.autoSendDrawings && kindAt(room.round, room.mode) === "drawing"
      ? AUTO_SEND_GRACE_MS
      : 0)
  );
}
export function tick(room: Room, now = Date.now()) {
  if (room.status !== "playing") return false;
  if (room.mode === "phoneguess") return tickGuess(room, now);
  if (now < roundClosesAt(room)) return false;
  for (const p of room.players) {
    const a = room.albums[albumIndex(room, p.id)];
    if (a.length === room.round)
      a.push({
        kind: kindAt(room.round, room.mode),
        value:
          kindAt(room.round, room.mode) === "phrase" ? "(Tempo esgotado)" : "",
        playerId: p.id,
        timedOut: true,
      });
  }
  advance(room, now);
  return true;
}
export function act(
  room: Room,
  token: string,
  action: string,
  data: Record<string, unknown>,
  now = Date.now(),
) {
  const player = authenticate(room, token);
  if (action === "liveDrawing" || action === "guess") {
    if (room.mode !== "phoneguess" || room.status !== "playing" || data.round !== room.round || room.guess!.intermission || now >= room.deadline)
      throw new GameError("Esta rodada já terminou.",409);
    const g=room.guess!, drawer=guessDrawer(room);
    if (action === "liveDrawing") {
      if (player.id !== drawer) throw new GameError("Só o desenhista pode desenhar.",403);
      if (typeof data.value !== "string" || !/^data:image\/webp;base64,[A-Za-z0-9+/]+=*$/.test(data.value) || data.value.length>180000) throw new GameError("Desenho inválido.");
      g.drawing=data.value;
    } else {
      if (player.id === drawer || g.solved.includes(player.id)) throw new GameError("Você não pode responder nesta rodada.",403);
      if (typeof data.value !== "string" || !data.value.trim() || Array.from(data.value.trim()).length>50) throw new GameError("Escreva de 1 a 50 caracteres.");
      if (now-(g.lastGuess[player.id] ?? 0)<800) throw new GameError("Aguarde um instante antes de tentar novamente.",429);
      g.lastGuess[player.id]=now;
      const correct=normalizeGuess(data.value)===normalizeGuess(g.word);
      const points=correct ? guessPoints(room.deadline-now) : 0;
      if (correct) { g.solved.push(player.id); g.scores[player.id]=(g.scores[player.id]??0)+points; }
      g.messages.push({id:(g.messages.at(-1)?.id ?? 0)+1, playerId:player.id,text:correct ? "Acertou!" : data.value.trim(),correct,points});
      g.messages=g.messages.slice(-60);
      if (g.solved.length===room.players.length-1) endGuessTurn(room,now);
    }
  } else if (action === "profile") {
    if (data.playerId !== undefined && data.playerId !== player.id)
      throw new GameError("Você só pode editar seu próprio personagem.", 403);
    player.avatar = characterOf(data.avatar);
  } else if (action === "reveal") {
    if (room.status !== "finished" || room.hostId !== player.id)
      throw new GameError("Só o anfitrião pode avançar a revelação.", 403);
    const cursor = room.revealCursor ?? 0;
    if (data.cursor !== cursor)
      throw new GameError(
        "A apresentação já avançou. Aguarde a atualização.",
        409,
      );
    if (data.direction !== "next" && data.direction !== "previous")
      throw new GameError("Direção inválida.");
    const next = cursor + (data.direction === "next" ? 1 : -1),
      last = room.players.length * room.totalRounds - 1;
    if (next < 0 || next > last) throw new GameError("Fim da sequência.");
    room.revealCursor = next;
    if (next === last) room.allRevealed = true;
  } else if (action === "configure") {
    if (room.hostId !== player.id || room.status !== "lobby")
      throw new GameError(
        "Apenas o anfitrião pode configurar a sala de espera.",
        403,
      );
    const mode = data.mode ?? room.mode ?? "classic";
    if (!["classic", "chaos", "lightning", "phoneguess"].includes(String(mode)))
      throw new GameError("Modo inválido.");
    const seconds = Number(data.seconds ?? room.seconds);
    if (!timeOptionsFor(String(mode)).includes(seconds))
      throw new GameError("Tempo inválido.");
    const ending = data.ending ?? room.ending;
    if (!["auto", "phrase", "drawing"].includes(String(ending)))
      throw new GameError("Final inválido.");
    const autoSend = data.autoSendDrawings ?? room.autoSendDrawings ?? false;
    if (typeof autoSend !== "boolean")
      throw new GameError("Envio automático inválido.");
    room.autoSendDrawings = autoSend;
    room.mode = mode as GameMode;
    room.seconds = seconds;
    room.ending = ending as Room["ending"];
  } else if (action === "start") {
    if (room.hostId !== player.id)
      throw new GameError("Só o anfitrião pode iniciar.", 403);
    if (room.status !== "lobby") throw new GameError("A partida já começou.");
    if (room.players.length < 2)
      throw new GameError("Convide pelo menos mais um jogador.");

    if (!["auto", "phrase", "drawing"].includes(String(data.ending)))
      throw new GameError("Final inválido.");
    const mode = data.mode ?? room.mode ?? "classic";
    if (!["classic", "chaos", "lightning", "phoneguess"].includes(String(mode)))
      throw new GameError("Modo inválido.");
    if (!timeOptionsFor(String(mode)).includes(Number(data.seconds)))
      throw new GameError("Tempo inválido.");
    const autoSend = data.autoSendDrawings ?? room.autoSendDrawings ?? false;
    if (typeof autoSend !== "boolean")
      throw new GameError("Envio automático inválido.");
    room.autoSendDrawings = autoSend;
    room.mode = mode as GameMode;
    room.gameId = id();
    room.seconds = Number(data.seconds);
    room.ending =
      room.mode === "chaos" ? "drawing" : (data.ending as Room["ending"]);
    room.totalRounds = Math.max(3, room.players.length);
    if (
      room.ending !== "auto" &&
      kindAt(room.totalRounds - 1, room.mode) !== room.ending
    )
      room.totalRounds++;
    room.guess = undefined;
    if (room.mode === "phoneguess") room.totalRounds = room.players.length;
    room.round = 0;
    room.revealCursor = 0;
    room.allRevealed = false;
    room.albums = room.players.map(() => []);
    room.status = "playing";
    room.deadline = now + room.seconds * 1000;
    if (room.mode === "phoneguess") startGuessTurn(room, now);
  } else if (action === "submit") {
    if (
      room.status !== "playing" ||
      data.round !== room.round ||
      now >= roundClosesAt(room)
    )
      throw new GameError("Esta rodada já terminou. Atualize sua tela.", 409);
    if (room.mode === "phoneguess") throw new GameError("Use as tentativas deste modo.");
    const album = room.albums[albumIndex(room, player.id)];
    if (album.length !== room.round)
      throw new GameError("Sua jogada já foi enviada.", 409);
    const value = data.value,
      kind = kindAt(room.round, room.mode);
    if (typeof value !== "string") throw new GameError("Jogada inválida.");
    if (
      kind === "phrase" &&
      (!value.trim() || Array.from(value.trim()).length > 50)
    )
      throw new GameError("Escreva de 1 a 50 caracteres.");
    if (
      kind === "drawing" &&
      (!/^data:image\/webp;base64,[A-Za-z0-9+/]+=*$/.test(value) ||
        value.length > 180000)
    )
      throw new GameError("Desenho inválido ou muito grande.");
    album.push({
      kind,
      value: kind === "phrase" ? value.trim() : value,
      playerId: player.id,
    });
    if (room.albums.every((a) => a.length > room.round)) advance(room, now);
  } else if (action === "reset") {
    if (room.hostId !== player.id || room.status !== "finished")
      throw new GameError("Aguarde o anfitrião e o fim da partida.", 403);
    room.status = "lobby";
    room.guess = undefined;
    room.albums = [];
    room.round = 0;
    room.totalRounds = 0;
    room.revealCursor = 0;
    room.allRevealed = false;
  } else if (action === "remove") {
    if (room.hostId !== player.id || room.status !== "lobby")
      throw new GameError(
        "Apenas o anfitrião pode remover na sala de espera.",
        403,
      );
    if (data.playerId === player.id) throw new GameError("Você é o anfitrião.");
    room.players = room.players.filter((p) => p.id !== data.playerId);
  } else throw new GameError("Ação inválida.");
}
export function join(room: Room, name: unknown, avatar?: unknown) {
  if (room.status !== "lobby")
    throw new GameError("Esta partida já começou. Entre na próxima!");
  if (room.players.length >= 20)
    throw new GameError("A sala está cheia (20 jogadores).");
  const token = id();
  room.players.push({
    id: id(),
    name: nameOf(name),
    secret: hash(token),
    avatar: characterOf(avatar),
  });
  return token;
}
export function view(
  room: Room,
  token: string,
  selectedAlbum = 0,
  exportAlbum = false,
) {
  const cursor = room.revealCursor ?? 0;
  const revealAlbum = room.totalRounds
    ? Math.floor(cursor / room.totalRounds)
    : 0;
  const revealStep = room.totalRounds ? cursor % room.totalRounds : 0;
  const canExport = room.status === "finished" && !!room.allRevealed;
  if (
    exportAlbum &&
    (!canExport ||
      !Number.isInteger(selectedAlbum) ||
      selectedAlbum < 0 ||
      selectedAlbum >= room.players.length)
  )
    throw new GameError(
      "Aguarde o anfitrião revelar toda a sequência para baixar o PDF.",
      403,
    );
  const visibleAlbum = exportAlbum ? selectedAlbum : revealAlbum;
  const player = authenticate(room, token),
    album =
      room.status === "playing"
        ? room.albums[albumIndex(room, player.id)]
        : null;
  return {
    guess: guessView(room, player.id),
    version: room.version,
    mode: room.mode ?? "classic",
    autoSendDrawings: room.autoSendDrawings ?? false,
    gameId: room.gameId ?? `${room.createdAt}-${room.totalRounds}`,
    taskKind: kindAt(room.round, room.mode),
    code: room.code,
    status: room.status,
    hostId: room.hostId,
    me: player.id,
    players: room.players.map((p) => ({
      id: p.id,
      name: p.name,
      avatar: characterOf(p.avatar),
      submitted:
        room.status === "playing"
          ? room.albums[albumIndex(room, p.id)].length > room.round
          : false,
    })),
    round: room.round,
    totalRounds: room.totalRounds,
    deadline: room.deadline,
    serverNow: Date.now(),
    seconds: room.seconds,
    ending: room.ending,
    submitted: !!album && album.length > room.round,
    completed:
      room.status === "playing"
        ? room.albums.filter((a) => a.length > room.round).length
        : 0,
    previous: album && room.round > 0 ? album[room.round - 1] : null,
    revealCursor: cursor,
    revealStep,
    canExport,
    revealComplete:
      room.status === "finished" &&
      cursor === room.players.length * room.totalRounds - 1,
    revealedAlbum: visibleAlbum,
    albums:
      room.status === "finished"
        ? room.albums.map((entries, i) =>
            i === visibleAlbum
              ? entries.slice(0, exportAlbum ? entries.length : revealStep + 1)
              : [],
          )
        : null,
  };
}
export type RoomView = ReturnType<typeof view>;
