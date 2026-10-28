import {
  CHARACTER_PRESETS,
  DEFAULT_CHARACTER,
  portraitSprite,
  type Character,
} from "@/lib/characters";
export default function CharacterAvatar({
  character = DEFAULT_CHARACTER,
  size = 52,
  label,
}: {
  character?: Character;
  size?: number;
  label?: string;
}) {
  const sprite = portraitSprite(character.animal);
  const name =
    label ||
    CHARACTER_PRESETS.find(([id]) => id === character.animal)?.[1] ||
    "Personagem";
  return (
    <span
      className="character-avatar portrait-avatar"
      role="img"
      aria-label={name}
      style={{ width: size, height: size, backgroundColor: character.color }}
    >
      <span
        className="portrait-image"
        style={{
          backgroundImage: `url("${sprite.image}")`,
          backgroundPosition: sprite.position,
          backgroundSize: sprite.size ?? "500% 200%",
        }}
      />
    </span>
  );
}
