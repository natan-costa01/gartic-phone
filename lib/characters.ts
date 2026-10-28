export const ANIMALS = [
  ["dinosaur", "Dinossauro"],
  ["dog", "Cachorro"],
  ["elephant", "Elefante"],
  ["cat", "Gato"],
  ["rabbit", "Coelho"],
  ["fox", "Raposa"],
  ["bear", "Urso"],
  ["panda", "Panda"],
  ["tiger", "Tigre"],
  ["lion", "Leão"],
  ["frog", "Sapo"],
  ["owl", "Coruja"],
  ["penguin", "Pinguim"],
  ["monkey", "Macaco"],
  ["pig", "Porco"],
  ["cow", "Vaca"],
  ["koala", "Coala"],
  ["raccoon", "Guaxinim"],
  ["wolf", "Lobo"],
  ["otter", "Lontra"],
] as const;
export type Animal = (typeof ANIMALS)[number][0];
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
  ["portrait", "Rapaz da foto"],
  ["naruto", "Naruto"],
  ["goku", "Goku"],
  ["sasuke", "Sasuke"],
  ["sakura", "Sakura"],
  ["luffy", "Luffy"],
  ["nami", "Nami"],
  ["nezuko", "Nezuko"],
  ["gojo", "Gojo"],
  ["tanjiro", "Tanjiro"],
] as const;
export const CHARACTER_PRESETS = [...PORTRAITS, ...ANIMALS] as const;
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
  if (
    !CHARACTER_PRESETS.some(([key]) => key === v.animal) ||
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
  return { animal: v.animal as CharacterId, color: v.color as string };
}
