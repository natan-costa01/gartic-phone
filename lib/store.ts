import { Room, RoomView, GameError, hash } from "./game";
const globalStore = globalThis as typeof globalThis & {
  phoneartRooms?: Map<string, Room>;
};
const memory = (globalStore.phoneartRooms ??= new Map());
function config() {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (url && token) return { url, token };
  if (process.env.NODE_ENV === "production")
    throw new GameError(
      "Configure o Redis na Vercel para ativar as salas online.",
      503,
    );
  return null;
}
async function redis(command: unknown[]) {
  const c = config()!;
  const res = await fetch(c.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${c.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok)
    throw new GameError("Não foi possível conectar ao serviço de salas.", 503);
  const result = await res.json();
  if (result.error) {
    console.error("Redis command failed");
    throw new GameError("O serviço de salas está indisponível.", 503);
  }
  return result.result;
}
const key = (code: string) => `phoneart:room:${code}`;
export async function insert(room: Room) {
  if (!config()) {
    if (memory.has(room.code)) return false;
    memory.set(room.code, structuredClone(room));
    return true;
  }
  return (
    (await redis([
      "SET",
      key(room.code),
      JSON.stringify(room),
      "EX",
      86400,
      "NX",
    ])) === "OK"
  );
}
export async function load(code: string): Promise<Room> {
  const raw = config() ? await redis(["GET", key(code)]) : memory.get(code);
  if (!raw)
    throw new GameError(
      "Sala não encontrada ou expirada. Confira o código.",
      404,
    );
  const room =
    typeof raw === "string"
      ? (JSON.parse(raw) as Room)
      : (structuredClone(raw) as Room);
  if (room.createdAt + 86400000 < Date.now())
    throw new GameError("Esta sala expirou. Crie outra sala.", 404);
  return room;
}
export async function mutate<T>(
  code: string,
  fn: (room: Room) => T,
): Promise<{ room: Room; result: T }> {
  for (let i = 0; i < 10; i++) {
    const room = await load(code),
      version = room.version;
    const result = fn(room);
    room.version++;
    if (!config()) {
      if (memory.get(code)?.version !== version) continue;
      memory.set(code, structuredClone(room));
      return { room, result };
    }
    const ok = await redis([
      "EVAL",
      "local raw=redis.call('GET',KEYS[1]); if not raw then return 0 end; local room=cjson.decode(raw); if room.version~=tonumber(ARGV[1]) then return 0 end; redis.call('SET',KEYS[1],ARGV[2],'KEEPTTL'); return 1",
      1,
      key(code),
      version,
      JSON.stringify(room),
    ]);
    if (ok === 1) return { room, result };
  }
  throw new GameError("Muitas jogadas ao mesmo tempo. Tente novamente.", 409);
}

// Keep image payloads out of room CAS operations. Each request hydrates only
// the current task or the selected revealed album (well below Vercel's limit).
export async function saveDrawing(room: Room, value: string): Promise<string> {
  if (!config()) return value;
  const ref = `asset:${room.code}:${hash(value)}`;
  await redis([
    "SET",
    `phoneart:${ref}`,
    value,
    "EX",
    Math.max(1, Math.ceil((room.createdAt + 86400000 - Date.now()) / 1000)),
  ]);
  return ref;
}
export async function hydrate(state: RoomView): Promise<RoomView> {
  const entries = [
    ...(state.guess?.drawing ? [{ get value() { return state.guess!.drawing; }, set value(v: string) { state.guess!.drawing=v; } }] : []),
    ...(state.previous ? [state.previous] : []),
    ...(state.albums?.flat() ?? []),
  ];
  const refs = [
    ...new Set(
      entries.filter((e) => e.value.startsWith("asset:")).map((e) => e.value),
    ),
  ];
  if (!refs.length) return state;
  const values = await redis(["MGET", ...refs.map((ref) => `phoneart:${ref}`)]);
  const images = new Map(
    refs.map((ref, i) => [ref, values[i] as string | null]),
  );
  for (const entry of entries)
    if (images.has(entry.value)) entry.value = images.get(entry.value) ?? "";
  return state;
}
