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
  const state = view(room, tokens[0], 2);
  assert.equal(state.revealedAlbum, 2);
  assert.equal(state.albums?.[0].length, 0);
  assert.equal(state.albums?.[1].length, 0);
  assert.equal(state.albums?.[2].length, 3);
});

test('two players still get a drawing and a guessing turn',()=>{const {room,tokens}=setup(2);act(room,tokens[0],'start',{seconds:60,ending:'auto'},1000);assert.equal(room.totalRounds,3);for(let r=0;r<3;r++){assert.equal(room.round,r);for(const token of tokens)act(room,token,'submit',{round:r,value:r===1?drawing:'um gato'},1000+r);}assert.equal(room.status,'finished');assert.equal(room.albums[0][2].kind,'phrase');});
