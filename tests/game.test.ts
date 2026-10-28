import { test } from "node:test";
import assert from "node:assert/strict";
import {
  act,
  albumIndex,
  createRoom,
  join,
  tick,
  view,
  hash,
} from "../lib/game";
const drawing = "data:image/webp;base64,UklGRg==";
function setup(n = 3) {
  const { room, token } = createRoom("Ana");
  const tokens = [token];
  for (let i = 1; i < n; i++) tokens.push(join(room, `Pessoa ${i}`));
  return { room, tokens };
}
test("full game distributes albums to everyone and reveals only at the end", () => {
  const { room, tokens } = setup(4);
  act(room, tokens[0], "start", { seconds: 90, ending: "auto" }, 1000);
  const visits = room.players.map(() => new Set<number>());
  for (let round = 0; round < 4; round++)
    for (let i = 0; i < 4; i++) {
      const v = view(room, tokens[i]);
      assert.equal(v.albums, null);
      assert.equal("secret" in v.players[0], false);
      if (round)
        assert.equal(v.previous?.playerId, room.players[(i + 3) % 4].id);
      visits[i].add(albumIndex(room, room.players[i].id));
      act(
        room,
        tokens[i],
        "submit",
        { round, value: round % 2 ? drawing : `frase ${round} de ${i}` },
        1000 + round * 100,
      );
    }
  assert.equal(room.status, "finished");
  assert.ok(visits.every((v) => v.size === 4));
  assert.equal(view(room, tokens[0]).albums?.length, 4);
  assert.ok(room.albums.every((a) => a.length === 4));
});
test("chosen ending preserves a complete rotation for odd and even groups", () => {
  for (const n of [2, 3, 4, 19, 20])
    for (const ending of ["phrase", "drawing"]) {
      const { room, tokens } = setup(n);
      act(room, tokens[0], "start", { seconds: 60, ending }, 1000);
      assert.ok(room.totalRounds >= n);
      const rounds = room.totalRounds;
      for (let r = 0; r < rounds; r++) tick(room, room.deadline);
      assert.equal(room.status, "finished");
      assert.equal(room.albums[0].at(-1)?.kind, ending);
      assert.ok(room.albums.every((a) => a.length === rounds));
    }
});
test("host controls, duplicate and stale submissions and auth are enforced", () => {
  const { room, tokens } = setup();
  assert.throws(() =>
    act(room, tokens[1], "start", { seconds: 90, ending: "auto" }),
  );
  assert.throws(() => view(room, "fake"));
  act(room, tokens[0], "start", { seconds: 90, ending: "auto" });
  assert.throws(() => join(room, "Late"));
  act(room, tokens[0], "submit", { round: 0, value: "elefante" });
  assert.throws(() =>
    act(room, tokens[0], "submit", { round: 0, value: "again" }),
  );
  assert.throws(() =>
    act(room, tokens[1], "submit", { round: 9, value: "stale" }),
  );
  assert.equal(room.players[0].secret, hash(tokens[0]));
});
test("room limit and input validation", () => {
  const { room, tokens } = setup(20);
  assert.throws(() => join(room, "Overflow"));
  assert.throws(() => createRoom(""));
  act(room, tokens[0], "start", { seconds: 60, ending: "auto" });
  assert.throws(() =>
    act(room, tokens[0], "submit", { round: 0, value: "x".repeat(181) }),
  );
});
test("deadline fills missing moves without replacing already submitted work", () => {
  const { room, tokens } = setup(2);
  act(room, tokens[0], "start", { seconds: 60, ending: "auto" }, 1000);
  act(room, tokens[0], "submit", { round: 0, value: "minha ideia" }, 2000);
  assert.equal(tick(room, 3000), false);
  assert.equal(tick(room, 61000), true);
  assert.equal(room.round, 1);
  assert.equal(room.albums[0][0].value, "minha ideia");
  assert.equal(room.albums[1][0].timedOut, true);
});

test("revealed albums are paginated to keep response sizes bounded", () => {
  const { room, tokens } = setup(3);
  act(room, tokens[0], "start", { seconds: 60, ending: "auto" }, 1000);
  while (room.status === "playing") tick(room, room.deadline);
  for (
    let cursor = 0;
    cursor < room.players.length * room.totalRounds - 1;
    cursor++
  )
    act(room, tokens[0], "reveal", { direction: "next", cursor });
  const state = view(room, tokens[0], 2, true);
  assert.equal(state.revealedAlbum, 2);
  assert.equal(state.albums?.[0].length, 0);
  assert.equal(state.albums?.[1].length, 0);
  assert.equal(state.albums?.[2].length, 3);
});

test("two players still get a drawing and a guessing turn", () => {
  const { room, tokens } = setup(2);
  act(room, tokens[0], "start", { seconds: 60, ending: "auto" }, 1000);
  assert.equal(room.totalRounds, 3);
  for (let r = 0; r < 3; r++) {
    assert.equal(room.round, r);
    for (const token of tokens)
      act(
        room,
        token,
        "submit",
        { round: r, value: r === 1 ? drawing : "um gato" },
        1000 + r,
      );
  }
  assert.equal(room.status, "finished");
  assert.equal(room.albums[0][2].kind, "phrase");
});

test("50-character boundary is enforced on both phrases and guesses including emoji", () => {
  const { room, tokens } = setup(2);
  act(room, tokens[0], "start", { seconds: 60, ending: "phrase" });
  assert.throws(
    () => act(room, tokens[0], "submit", { round: 0, value: "a".repeat(51) }),
    /50/,
  );
  act(room, tokens[0], "submit", { round: 0, value: "😀".repeat(50) });
  act(room, tokens[1], "submit", { round: 0, value: "a".repeat(50) });
  for (const token of tokens)
    act(room, token, "submit", { round: 1, value: drawing });
  assert.throws(
    () => act(room, tokens[0], "submit", { round: 2, value: "😀".repeat(51) }),
    /50/,
  );
  act(room, tokens[0], "submit", { round: 2, value: "b".repeat(50) });
  act(room, tokens[1], "submit", { round: 2, value: "adivinhei" });
  assert.equal(room.status, "finished");
});
test("chaos starts with drawings and rotates only drawings for 2 to 20 players", () => {
  for (const n of [2, 3, 20]) {
    const { room, tokens } = setup(n);
    act(room, tokens[0], "configure", {
      mode: "chaos",
      seconds: 60,
      ending: "phrase",
    });
    act(room, tokens[0], "start", { seconds: 60, ending: "phrase" }, 1000);
    assert.equal(room.ending, "drawing");
    const visited = room.players.map(() => new Set<number>());
    for (let r = 0; r < room.totalRounds; r++)
      for (let i = 0; i < n; i++) {
        const v = view(room, tokens[i]);
        assert.equal(v.taskKind, "drawing");
        assert.equal(v.albums, null);
        if (r) assert.equal(v.previous?.kind, "drawing");
        visited[i].add(albumIndex(room, room.players[i].id));
        assert.throws(() =>
          act(room, tokens[i], "submit", { round: r, value: "uma frase" }),
        );
        act(room, tokens[i], "submit", { round: r, value: drawing }, 1000 + r);
      }
    assert.equal(room.status, "finished");
    assert.ok(visited.every((v) => v.size === n));
    assert.ok(room.albums.every((a) => a.every((e) => e.kind === "drawing")));
  }
});
test("lightning respects configured 30s deadlines with classic alternation", () => {
  const { room, tokens } = setup();
  act(
    room,
    tokens[0],
    "start",
    { mode: "lightning", seconds: 30, ending: "auto" },
    1000,
  );
  assert.equal(room.seconds, 30);
  assert.equal(room.deadline, 31000);
  assert.equal(tick(room, 30999), false);
  assert.equal(tick(room, 31000), true);
  assert.equal(view(room, tokens[0]).taskKind, "drawing");
  assert.equal(room.deadline, 61000);
  tick(room, 61000);
  assert.equal(view(room, tokens[0]).taskKind, "phrase");
  tick(room, 91000);
  assert.equal(room.status, "finished");
});
test("mode settings require the lobby host and reject unsupported values", () => {
  const { room, tokens } = setup();
  assert.throws(() => act(room, tokens[1], "configure", { mode: "chaos" }));
  assert.throws(() => act(room, tokens[0], "configure", { mode: "unknown" }));
  assert.equal(room.mode, "classic");
  act(room, tokens[0], "configure", {
    mode: "lightning",
    seconds: 30,
    ending: "phrase",
  });
  assert.equal(view(room, tokens[1]).mode, "lightning");
  act(room, tokens[0], "start", { seconds: 30, ending: "phrase" });
  assert.throws(() => act(room, tokens[0], "configure", { mode: "classic" }));
});

test("all extended durations are validated on the server and retained in view", () => {
  for (const seconds of [15, 20, 30, 45, 60, 90, 120, 180, 240, 300, 600]) {
    const { room, tokens } = setup(2);
    act(
      room,
      tokens[0],
      "start",
      { seconds, ending: "auto", mode: "classic" },
      1000,
    );
    assert.equal(room.deadline, 1000 + seconds * 1000);
    assert.equal(view(room, tokens[1]).seconds, seconds);
  }
  for (const seconds of [0, 14, 21, 601, NaN]) {
    const { room, tokens } = setup();
    assert.throws(
      () => act(room, tokens[0], "start", { seconds, ending: "auto" }),
      /Tempo/,
    );
  }
  for (const seconds of [15, 20, 30, 45, 60]) {
    const { room, tokens } = setup();
    act(
      room,
      tokens[0],
      "start",
      { seconds, ending: "auto", mode: "lightning" },
      1000,
    );
    assert.equal(room.seconds, seconds);
  }
  const { room, tokens } = setup();
  assert.throws(
    () =>
      act(room, tokens[0], "start", {
        seconds: 90,
        ending: "auto",
        mode: "lightning",
      }),
    /Tempo/,
  );
});
test("automatic drawing grace accepts a final snapshot before fallback and never changes phrase deadlines", () => {
  const { room, tokens } = setup(2);
  act(room, tokens[0], "configure", {
    seconds: 15,
    mode: "chaos",
    autoSendDrawings: true,
  });
  assert.equal(view(room, tokens[1]).autoSendDrawings, true);
  act(
    room,
    tokens[0],
    "start",
    { seconds: 15, mode: "chaos", ending: "auto" },
    1000,
  );
  assert.equal(tick(room, 16000), false);
  act(room, tokens[0], "submit", { round: 0, value: drawing }, 16500);
  assert.equal(tick(room, 20999), false);
  assert.equal(tick(room, 21000), true);
  assert.equal(room.albums[0][0].value, drawing);
  assert.equal(room.albums[0][0].timedOut, undefined);
  assert.equal(room.albums[1][0].timedOut, true);
  assert.throws(
    () => act(room, tokens[0], "submit", { round: 0, value: drawing }, 21001),
    /terminou/,
  );
  const classic = setup(2);
  act(
    classic.room,
    classic.tokens[0],
    "start",
    { seconds: 15, ending: "auto", autoSendDrawings: true },
    1000,
  );
  assert.equal(tick(classic.room, 16000), true);
});
test("automatic drawing submission remains optional and host-controlled", () => {
  const { room, tokens } = setup();
  assert.equal(view(room, tokens[0]).autoSendDrawings, false);
  assert.throws(() =>
    act(room, tokens[1], "configure", { autoSendDrawings: true }),
  );
  assert.throws(() =>
    act(room, tokens[0], "configure", { autoSendDrawings: "yes" }),
  );
  act(
    room,
    tokens[0],
    "start",
    { seconds: 15, mode: "chaos", ending: "auto" },
    1000,
  );
  assert.equal(tick(room, 16000), true);
  assert.ok(room.albums.every((album) => album[0].timedOut));
});

test("only the host controls a synchronized, step-by-step reveal without album query bypass", () => {
  const { room, tokens } = setup(3);
  act(room, tokens[0], "start", { seconds: 60, ending: "auto" }, 1000);
  while (room.status === "playing") tick(room, room.deadline);
  const first = view(room, tokens[1], 2);
  assert.equal(first.revealedAlbum, 0);
  assert.equal(first.revealStep, 0);
  assert.equal(first.albums?.[0].length, 1);
  assert.equal(first.albums?.[2].length, 0);
  assert.equal(first.canExport, false);
  assert.throws(
    () => act(room, tokens[1], "reveal", { direction: "next", cursor: 0 }),
    /anfitrião/,
  );
  assert.equal(room.revealCursor, 0);
  assert.throws(() => view(room, tokens[1], 2, true), /PDF/);
  act(room, tokens[0], "reveal", { direction: "next", cursor: 0 });
  assert.equal(
    view(room, tokens[0]).revealCursor,
    view(room, tokens[1]).revealCursor,
  );
  assert.equal(view(room, tokens[1]).albums?.[0].length, 2);
  assert.throws(
    () => act(room, tokens[0], "reveal", { direction: "next", cursor: 0 }),
    /avançou/,
  );
  for (let cursor = 1; cursor < 8; cursor++)
    act(room, tokens[0], "reveal", { direction: "next", cursor });
  assert.equal(view(room, tokens[1]).revealComplete, true);
  assert.equal(view(room, tokens[1]).canExport, true);
  assert.equal(view(room, tokens[1], 1, true).albums?.[1].length, 3);
  assert.throws(
    () => act(room, tokens[0], "reveal", { direction: "next", cursor: 8 }),
    /Fim/,
  );
  act(room, tokens[0], "reveal", { direction: "previous", cursor: 8 });
  assert.equal(view(room, tokens[1]).canExport, true);
  act(room, tokens[0], "reset", {});
  assert.equal(view(room, tokens[1]).canExport, false);
  assert.equal(room.revealCursor, 0);
});
test("participant readiness is public without exposing submitted content", () => {
  const { room, tokens } = setup(2);
  act(room, tokens[0], "start", { seconds: 60, ending: "auto" }, 1000);
  act(room, tokens[0], "submit", { round: 0, value: "segredo criativo" }, 2000);
  const guest = view(room, tokens[1]);
  assert.equal(guest.players[0].submitted, true);
  assert.equal(guest.players[1].submitted, false);
  assert.equal(guest.previous, null);
  assert.equal(JSON.stringify(guest).includes("segredo criativo"), false);
});
