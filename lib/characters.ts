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
export const HATS = [
  ["none", "Sem chapéu"],
  ["cap", "Boné"],
  ["beanie", "Gorro"],
] as const;
export const GLASSES = [
  ["none", "Sem óculos"],
  ["round", "Óculos redondos"],
  ["square", "Óculos quadrados"],
  ["sun", "Óculos escuros"],
] as const;
export type Character = {
  animal: Animal;
  color: string;
  hat: (typeof HATS)[number][0];
  glasses: (typeof GLASSES)[number][0];
};
export const DEFAULT_CHARACTER: Character = {
  animal: "dinosaur",
  color: CHARACTER_COLORS[0],
  hat: "none",
  glasses: "none",
};
export function parseCharacter(value: unknown): Character {
  if (value === undefined) return { ...DEFAULT_CHARACTER };
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw Error("Personagem inválido.");
  const v = value as Record<string, unknown>;
  if (
    !ANIMALS.some(([key]) => key === v.animal) ||
    !CHARACTER_COLORS.some((c) => c === v.color) ||
    !HATS.some(([key]) => key === v.hat) ||
    !GLASSES.some(([key]) => key === v.glasses)
  )
    throw Error("Escolha um animal, cor e acessórios válidos.");
  return {
    animal: v.animal as Animal,
    color: v.color as string,
    hat: v.hat as Character["hat"],
    glasses: v.glasses as Character["glasses"],
  };
}
