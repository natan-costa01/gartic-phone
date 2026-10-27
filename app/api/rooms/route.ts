import { NextRequest, NextResponse } from "next/server";
import {
  act,
  authenticate,
  createRoom,
  GameError,
  join,
  tick,
  view,
} from "@/lib/game";
import { hydrate, insert, load, mutate, saveDrawing } from "@/lib/store";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
function codeOf(value: unknown) {
  if (typeof value !== "string" || !/^[A-Z2-9]{6}$/.test(value))
    throw new GameError("O código da sala tem 6 letras ou números.");
  return value;
}
function tokenOf(req: NextRequest) {
  const token = req.headers.get("x-player-token");
  if (!token || !/^[a-f0-9]{36}$/.test(token))
    throw new GameError("Entre na sala para continuar.", 401);
  return token;
}
function failure(error: unknown) {
  if (error instanceof GameError)
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  console.error(
    "PhoneArt request failed",
    error instanceof Error ? error.message : "unknown",
  );
  return NextResponse.json(
    { error: "Não foi possível concluir. Tente novamente." },
    { status: 500 },
  );
}
export async function GET(req: NextRequest) {
  try {
    const code = codeOf(req.nextUrl.searchParams.get("code")),
      token = tokenOf(req);
    let room = await load(code);
    authenticate(room, token);
    if (room.status === "playing" && Date.now() >= room.deadline)
      room = (
        await mutate(code, (r) => {
          authenticate(r, token);
          tick(r);
        })
      ).room;
    const album = Number(req.nextUrl.searchParams.get("album") || 0);
    if (!Number.isInteger(album) || album < 0 || album >= room.players.length)
      throw new GameError("Álbum inválido.");
    return NextResponse.json(
      { room: await hydrate(view(room, token, album)) },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return failure(e);
  }
}
export async function POST(req: NextRequest) {
  try {
    const origin = req.headers.get("origin");
    if (origin && new URL(origin).host !== req.headers.get("host"))
      throw new GameError("Origem inválida.", 403);
    const raw = await req.text();
    if (raw.length > 190000) throw new GameError("Jogada muito grande.", 413);
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      throw new GameError("Requisição inválida.");
    }
    if (!data || typeof data !== "object" || Array.isArray(data))
      throw new GameError("Requisição inválida.");
    if (data.action === "create") {
      for (let i = 0; i < 5; i++) {
        const { room, token } = createRoom(data.name);
        if (await insert(room))
          return NextResponse.json({
            token,
            room: await hydrate(view(room, token)),
          });
      }
      throw new GameError("Tente criar a sala novamente.", 503);
    }
    const code = codeOf(data.code);
    if (data.action === "join") {
      const { room, result: token } = await mutate(code, (r) =>
        join(r, data.name),
      );
      return NextResponse.json({
        token,
        room: await hydrate(view(room, token)),
      });
    }
    const token = tokenOf(req);
    let drawingRef: string | null = null;
    if (
      data.action === "submit" &&
      typeof data.value === "string" &&
      /^data:image\/webp;base64,[A-Za-z0-9+/]+=*$/.test(data.value) &&
      data.value.length <= 180000
    ) {
      const initial = await load(code);
      authenticate(initial, token);
      drawingRef = await saveDrawing(initial, data.value);
    }
    const { room } = await mutate(code, (r) => {
      authenticate(r, token);
      tick(r);
      act(r, token, data.action, data);
      if (drawingRef)
        for (const album of r.albums)
          for (const entry of album)
            if (entry.kind === "drawing" && entry.value === data.value)
              entry.value = drawingRef;
    });
    return NextResponse.json({ room: await hydrate(view(room, token)) });
  } catch (e) {
    return failure(e);
  }
}
