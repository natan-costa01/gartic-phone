// Retained only to migrate earlier profiles and active rooms. Not selectable.
const LEGACY_ANIMAL_IDS = [
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
] as const;
export const CHARACTER_COLORS = [
  "#62d6a4",
  "#74bfff",
  "#c59bff",
  "#ffb578",
  "#f490ba",
  "#ffe28a",
  "#cedce7",
  "#92d5d2",
] as const;
export const PORTRAITS = [
  ["portrait", "Vitor Carneiro"],
  ["naruto", "Naruto"],
  ["goku", "Goku"],
  ["sasuke", "Sasuke"],
  ["sakura", "Sakura"],
  ["luffy", "Luffy"],
  ["nami", "Nami"],
  ["nezuko", "Nezuko"],
  ["gojo", "Gojo"],
  ["tanjiro", "Tanjiro"],
  ["rudeus", "Rudeus Greyrat"],
  ["yuji", "Yuji Itadori"],
  ["zenitsu", "Zenitsu"],
  ["hinata", "Hinata Hyuga"],
  ["levi", "Levi"],
  ["mikasa", "Mikasa"],
  ["ichigo", "Ichigo"],
  ["vegeta", "Vegeta"],
  ["killua", "Killua"],
  ["kakashi", "Kakashi"],
  ["lula", "Lula"],
  ["bolsonaro", "Bolsonaro"],
  ["ciro", "Ciro Gomes"],
] as const;
export const CHARACTER_PRESETS = PORTRAITS;
export type CharacterId = (typeof CHARACTER_PRESETS)[number][0];
export type Character = { animal: CharacterId; color: string };
export const DEFAULT_CHARACTER: Character = {
  animal: "portrait",
  color: CHARACTER_COLORS[6],
};
export function parseCharacter(value: unknown): Character {
  if (value === undefined) return { ...DEFAULT_CHARACTER };
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw Error("Personagem inválido.");
  const v = value as Record<string, unknown>;
  const characterId = LEGACY_ANIMAL_IDS.some((id) => id === v.animal)
    ? DEFAULT_CHARACTER.animal
    : v.animal;
  if (
    !CHARACTER_PRESETS.some(([key]) => key === characterId) ||
    !CHARACTER_COLORS.some((c) => c === v.color)
  )
    throw Error("Escolha um personagem e uma cor válidos.");
  // Accept and discard the former accessory fields so existing saved avatars
  // and active rooms remain readable, without exposing accessory controls.
  if (v.hat !== undefined && !["none", "cap", "beanie"].includes(String(v.hat)))
    throw Error("Personagem inválido.");
  if (
    v.glasses !== undefined &&
    !["none", "round", "square", "sun"].includes(String(v.glasses))
  )
    throw Error("Personagem inválido.");
  return { animal: characterId as CharacterId, color: v.color as string };
}

export function portraitSprite(id: CharacterId): {
  image: string;
  position: string;
  size?: string;
} {
  if (id === "ciro")
    return {
      image: "/characters/ciro.png",
      position: "50% 50%",
      size: "100% 100%",
    };
  if (id === "lula" || id === "bolsonaro")
    return {
      image: "/characters/public-figures.png",
      position: id === "lula" ? "0% 50%" : "100% 50%",
      size: "200% 100%",
    };
  const found = PORTRAITS.findIndex(([key]) => key === id),
    index = found < 0 ? 0 : found;
  const cell = index % 10;
  return {
    image:
      index < 10
        ? "/characters/portraits.png"
        : "/characters/portraits-extra.png",
    position: `${(cell % 5) * 25}% ${cell < 5 ? 0 : 100}%`,
  };
}
