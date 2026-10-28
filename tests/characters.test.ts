import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import CharacterAvatar from "../components/CharacterAvatar";
import {
  PORTRAITS,
  CHARACTER_PRESETS,
  DEFAULT_CHARACTER,
  parseCharacter,
  portraitSprite,
} from "../lib/characters";
import { act, createRoom, join, view } from "../lib/game";
test("22 illustrated presets include Vitor, the anime roster and both public figures", () => {
  assert.equal(PORTRAITS.length, 22);
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
      "rudeus",
      "yuji",
      "zenitsu",
      "hinata",
      "levi",
      "mikasa",
      "ichigo",
      "vegeta",
      "killua",
      "kakashi",
      "lula",
      "bolsonaro",
    ],
  );
  const variants = CHARACTER_PRESETS.map(([animal]) =>
    renderToStaticMarkup(
      createElement(CharacterAvatar, {
        character: { ...DEFAULT_CHARACTER, animal },
      }),
    ),
  );
  assert.equal(new Set(variants).size, 22);
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
  assert.equal(avatar.animal, "portrait");
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
    animal: "rudeus" as const,
  };
  const { room, token } = createRoom("Ana", Date.now(), avatar);
  const guest = join(room, "Bruno", { ...DEFAULT_CHARACTER, animal: "yuji" });
  assert.deepEqual(view(room, guest).players[0].avatar, avatar);
  act(room, guest, "profile", { avatar: { ...avatar, animal: "zenitsu" } });
  assert.equal(view(room, token).players[1].avatar.animal, "zenitsu");
  assert.equal(view(room, token).players[0].avatar.animal, "rudeus");
  assert.throws(
    () => act(room, guest, "profile", { playerId: room.hostId, avatar }),
    /próprio/,
  );
  assert.throws(() =>
    act(room, guest, "profile", { avatar: { ...avatar, hat: "invalid" } }),
  );
  assert.equal(view(room, token).players[1].avatar.animal, "zenitsu");
  act(room, token, "start", { seconds: 60, ending: "auto" });
  act(room, guest, "profile", { avatar });
  assert.equal(view(room, token).players[1].avatar.animal, "rudeus");
  assert.equal("secret" in view(room, token).players[1], false);
});

test("retired animals migrate to the default portrait while preserving background color", () => {
  for (const animal of [
    "dinosaur",
    "dog",
    "elephant",
    "cat",
    "rabbit",
    "fox",
    "bear",
    "panda",
    "tiger",
    "lion",
    "frog",
    "owl",
    "penguin",
    "monkey",
    "pig",
    "cow",
    "koala",
    "raccoon",
    "wolf",
    "otter",
  ])
    assert.deepEqual(parseCharacter({ animal, color: "#74bfff" }), {
      animal: "portrait",
      color: "#74bfff",
    });
});
test("portrait sheets keep the original portraits stable and map each new portrait to its proper grid cell", () => {
  assert.deepEqual(portraitSprite("portrait"), {
    image: "/characters/portraits.png",
    position: "0% 0%",
  });
  assert.deepEqual(portraitSprite("tanjiro"), {
    image: "/characters/portraits.png",
    position: "100% 100%",
  });
  assert.deepEqual(portraitSprite("rudeus"), {
    image: "/characters/portraits-extra.png",
    position: "0% 0%",
  });
  assert.deepEqual(portraitSprite("hinata"), {
    image: "/characters/portraits-extra.png",
    position: "75% 0%",
  });
  assert.deepEqual(portraitSprite("kakashi"), {
    image: "/characters/portraits-extra.png",
    position: "100% 100%",
  });
});

test("Vitor display name and public figure portraits have correct dedicated sheet positions", () => {
  assert.equal(
    PORTRAITS.find(([id]) => id === "portrait")?.[1],
    "Vitor Carneiro",
  );
  for (const animal of ["lula", "bolsonaro"] as const)
    assert.equal(
      parseCharacter({ ...DEFAULT_CHARACTER, animal }).animal,
      animal,
    );
  assert.deepEqual(portraitSprite("lula"), {
    image: "/characters/public-figures.png",
    position: "0% 50%",
    size: "200% 100%",
  });
  assert.deepEqual(portraitSprite("bolsonaro"), {
    image: "/characters/public-figures.png",
    position: "100% 50%",
    size: "200% 100%",
  });
});
