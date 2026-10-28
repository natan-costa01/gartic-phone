import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import CharacterAvatar from "../components/CharacterAvatar";
import { ANIMALS, DEFAULT_CHARACTER, parseCharacter } from "../lib/characters";
import { act, createRoom, join, view } from "../lib/game";
test("20 animal presets render distinct SVG characters, including hat and glasses", () => {
  assert.equal(ANIMALS.length, 20);
  const variants = ANIMALS.map(([animal]) =>
    renderToStaticMarkup(
      createElement(CharacterAvatar, {
        character: { ...DEFAULT_CHARACTER, animal },
      }),
    ),
  );
  assert.equal(new Set(variants).size, 20);
  assert.ok(variants.every((s) => s.includes("<svg")));
  const gear = renderToStaticMarkup(
    createElement(CharacterAvatar, {
      character: { ...DEFAULT_CHARACTER, hat: "cap", glasses: "sun" },
    }),
  );
  assert.notEqual(gear, variants[0]);
});
test("invalid character input is rejected and only structured preset data is accepted", () => {
  assert.deepEqual(parseCharacter(undefined), DEFAULT_CHARACTER);
  for (const input of [
    null,
    [],
    {},
    "cat",
    { ...DEFAULT_CHARACTER, animal: "dragon" },
    { ...DEFAULT_CHARACTER, color: "url(https://bad.test)" },
    { ...DEFAULT_CHARACTER, hat: "script" },
    { ...DEFAULT_CHARACTER, glasses: "unknown" },
  ])
    assert.throws(() => parseCharacter(input));
});
test("create, join and own profile editing preserve validated character and permissions", () => {
  const avatar = {
    ...DEFAULT_CHARACTER,
    animal: "elephant" as const,
    hat: "cap" as const,
    glasses: "round" as const,
  };
  const { room, token } = createRoom("Ana", Date.now(), avatar);
  const guest = join(room, "Bruno", { ...DEFAULT_CHARACTER, animal: "dog" });
  assert.deepEqual(view(room, guest).players[0].avatar, avatar);
  act(room, guest, "profile", { avatar: { ...avatar, animal: "cat" } });
  assert.equal(view(room, token).players[1].avatar.animal, "cat");
  assert.equal(view(room, token).players[0].avatar.animal, "elephant");
  assert.throws(
    () => act(room, guest, "profile", { playerId: room.hostId, avatar }),
    /próprio/,
  );
  assert.throws(() =>
    act(room, guest, "profile", { avatar: { ...avatar, hat: "invalid" } }),
  );
  assert.equal(view(room, token).players[1].avatar.animal, "cat");
  act(room, token, "start", { seconds: 60, ending: "auto" });
  act(room, guest, "profile", { avatar });
  assert.equal(view(room, token).players[1].avatar.animal, "elephant");
  assert.equal("secret" in view(room, token).players[1], false);
});
