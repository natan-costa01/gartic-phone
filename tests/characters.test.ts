import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import CharacterAvatar from "../components/CharacterAvatar";
import {
  ANIMALS,
  PORTRAITS,
  CHARACTER_PRESETS,
  DEFAULT_CHARACTER,
  parseCharacter,
} from "../lib/characters";
import { act, createRoom, join, view } from "../lib/game";
test("30 smooth presets include the photo-inspired avatar and all requested anime characters", () => {
  assert.equal(ANIMALS.length, 20);
  assert.equal(PORTRAITS.length, 10);
  assert.deepEqual(
    PORTRAITS.map(([id]) => id),
    [
      "portrait",
      "naruto",
      "goku",
      "sasuke",
      "sakura",
      "luffy",
      "nami",
      "nezuko",
      "gojo",
      "tanjiro",
    ],
  );
  const variants = CHARACTER_PRESETS.map(([animal]) =>
    renderToStaticMarkup(
      createElement(CharacterAvatar, {
        character: { ...DEFAULT_CHARACTER, animal },
      }),
    ),
  );
  assert.equal(new Set(variants).size, 30);
  assert.ok(variants.every((s) => !s.includes("crispEdges")));
  for (const [animal] of PORTRAITS) {
    const markup = renderToStaticMarkup(
      createElement(CharacterAvatar, {
        character: { ...DEFAULT_CHARACTER, animal },
      }),
    );
    assert.ok(markup.includes("portrait-image"));
  }
});
test("legacy accessories are removed from saved characters and existing room views", () => {
  assert.deepEqual(
    parseCharacter({ ...DEFAULT_CHARACTER, hat: "cap", glasses: "sun" }),
    DEFAULT_CHARACTER,
  );
  const { room, token } = createRoom("Ana");
  room.players[0].avatar = JSON.parse(
    JSON.stringify({
      ...DEFAULT_CHARACTER,
      animal: "cat",
      hat: "beanie",
      glasses: "round",
    }),
  );
  const avatar = view(room, token).players[0].avatar;
  assert.equal(avatar.animal, "cat");
  assert.equal("hat" in avatar, false);
  assert.equal("glasses" in avatar, false);
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
