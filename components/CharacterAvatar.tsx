import {
  PORTRAITS,
  CHARACTER_PRESETS,
  DEFAULT_CHARACTER,
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
  const portraitIndex = PORTRAITS.findIndex(([id]) => id === character.animal);
  const name =
    label ||
    CHARACTER_PRESETS.find(([id]) => id === character.animal)?.[1] ||
    "Personagem";
  if (portraitIndex >= 0)
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
            backgroundPosition: `${(portraitIndex % 5) * 25}% ${portraitIndex < 5 ? 0 : 100}%`,
          }}
        />
      </span>
    );
  const a = character.animal,
    c = character.color,
    ink = "#3f4d58",
    cream = "#fff2df";
  const pointed = ["cat", "fox", "wolf", "tiger", "raccoon"].includes(a),
    round = [
      "bear",
      "panda",
      "koala",
      "otter",
      "monkey",
      "pig",
      "cow",
      "lion",
      "tiger",
    ].includes(a);
  return (
    <svg
      className="character-avatar animal-avatar"
      width={size}
      height={size}
      viewBox="0 0 96 96"
      role="img"
      aria-label={name}
    >
      <circle cx="48" cy="48" r="47" fill={c} opacity=".18" />
      <path d="M23 94c0-17 9-24 25-24s25 7 25 24" fill={c} />
      {a === "lion" && <circle cx="48" cy="47" r="37" fill="#bd8248" />}
      {a === "elephant" && (
        <>
          <ellipse
            cx="21"
            cy="48"
            rx="18"
            ry="24"
            fill={c}
            stroke={ink}
            strokeWidth="2"
          />
          <ellipse
            cx="75"
            cy="48"
            rx="18"
            ry="24"
            fill={c}
            stroke={ink}
            strokeWidth="2"
          />
        </>
      )}
      {pointed && (
        <>
          <path
            d="M20 43 18 14q17 4 24 20m12 0q7-16 24-20l-2 29"
            fill={c}
            stroke={ink}
            strokeWidth="2"
          />
          <path d="m25 30-1-8 11 11m26 0 11-11-1 8" fill="#e6b7b2" />
        </>
      )}
      {round && (
        <>
          <circle
            cx="25"
            cy="28"
            r={a === "koala" ? 15 : 11}
            fill={a === "panda" ? ink : c}
            stroke={ink}
            strokeWidth="2"
          />
          <circle
            cx="71"
            cy="28"
            r={a === "koala" ? 15 : 11}
            fill={a === "panda" ? ink : c}
            stroke={ink}
            strokeWidth="2"
          />
        </>
      )}
      {a === "dog" && (
        <>
          <ellipse
            cx="20"
            cy="45"
            rx="13"
            ry="26"
            fill="#ac805c"
            transform="rotate(16 20 45)"
          />
          <ellipse
            cx="76"
            cy="45"
            rx="13"
            ry="26"
            fill="#ac805c"
            transform="rotate(-16 76 45)"
          />
        </>
      )}
      {a === "rabbit" && (
        <>
          <ellipse
            cx="32"
            cy="21"
            rx="10"
            ry="23"
            fill={c}
            stroke={ink}
            strokeWidth="2"
          />
          <ellipse
            cx="64"
            cy="21"
            rx="10"
            ry="23"
            fill={c}
            stroke={ink}
            strokeWidth="2"
          />
          <path
            d="M32 7v22m32-22v22"
            stroke="#eaa8b8"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </>
      )}
      {a === "dinosaur" && (
        <path
          d="m27 37 5-18 11 9 9-15 9 17 12-5 3 17"
          fill="#4baf91"
          stroke={ink}
          strokeWidth="2"
        />
      )}
      {a === "owl" && (
        <path
          d="m19 35-2-19 21 13m20 0 21-13-2 19"
          fill={c}
          stroke={ink}
          strokeWidth="2"
        />
      )}
      {a === "frog" && (
        <>
          <circle
            cx="28"
            cy="32"
            r="14"
            fill={c}
            stroke={ink}
            strokeWidth="2"
          />
          <circle
            cx="68"
            cy="32"
            r="14"
            fill={c}
            stroke={ink}
            strokeWidth="2"
          />
        </>
      )}
      {a === "cow" && (
        <path
          d="M22 34Q8 29 13 17q0 13 14 10m43 7q14-5 9-17 0 13-14 10"
          fill={cream}
          stroke={ink}
          strokeWidth="2"
        />
      )}
      <ellipse
        cx="48"
        cy="51"
        rx={a === "elephant" ? 27 : 32}
        ry={a === "penguin" ? 35 : 28}
        fill={a === "panda" ? "#f5f7f3" : a === "penguin" ? ink : c}
        stroke={ink}
        strokeWidth="2"
      />
      {a === "penguin" && (
        <path d="M28 48q7-22 20-8 13-14 20 8v22H28Z" fill="#f7faf8" />
      )}
      {a === "raccoon" && (
        <ellipse cx="48" cy="49" rx="28" ry="12" fill={ink} opacity=".8" />
      )}
      {a === "panda" && (
        <>
          <ellipse
            cx="32"
            cy="47"
            rx="11"
            ry="13"
            fill={ink}
            transform="rotate(15 32 47)"
          />
          <ellipse
            cx="64"
            cy="47"
            rx="11"
            ry="13"
            fill={ink}
            transform="rotate(-15 64 47)"
          />
        </>
      )}
      {a === "monkey" && (
        <path d="M24 44q5-14 24 1 19-15 24-1v18q-24 26-48 0Z" fill={cream} />
      )}
      {a === "fox" && (
        <path
          d="M18 52q16 1 30 14 14-13 30-14-8 29-30 27Q26 81 18 52Z"
          fill={cream}
        />
      )}
      {a === "wolf" && (
        <path
          d="m20 54 17 5 11 13 11-13 17-5q-10 24-28 25-18-1-28-25Z"
          fill={cream}
        />
      )}
      {a === "tiger" && (
        <path
          d="m18 40 13 5-12 4m59-9-13 5 12 4M37 26l2 11m20-11-2 11"
          stroke={ink}
          strokeWidth="3"
          strokeLinecap="round"
        />
      )}
      {a === "owl" && (
        <>
          <circle cx="32" cy="48" r="15" fill={cream} />
          <circle cx="64" cy="48" r="15" fill={cream} />
        </>
      )}
      {a === "cow" && <ellipse cx="30" cy="39" rx="13" ry="15" fill={ink} />}
      {["dog", "bear", "lion", "otter", "cat", "rabbit"].includes(a) && (
        <ellipse
          cx="48"
          cy="63"
          rx={a === "dog" ? 21 : 17}
          ry="12"
          fill={cream}
        />
      )}
      <ellipse
        cx="32"
        cy={a === "frog" ? 33 : 47}
        rx="3.5"
        ry="4.5"
        fill={["panda", "raccoon", "cow"].includes(a) ? "#fff" : ink}
      />
      <ellipse
        cx="64"
        cy={a === "frog" ? 33 : 47}
        rx="3.5"
        ry="4.5"
        fill={["panda", "raccoon"].includes(a) ? "#fff" : ink}
      />
      {a === "elephant" ? (
        <path
          d="M42 55v23q0 12 17 10 11-2 8-12"
          fill={c}
          stroke={ink}
          strokeWidth="9"
          strokeLinecap="round"
        />
      ) : a === "pig" ? (
        <>
          <ellipse
            cx="48"
            cy="64"
            rx="17"
            ry="10"
            fill="#e99fb2"
            stroke={ink}
            strokeWidth="1.5"
          />
          <circle cx="42" cy="64" r="2.5" fill={ink} />
          <circle cx="54" cy="64" r="2.5" fill={ink} />
        </>
      ) : a === "koala" ? (
        <ellipse cx="48" cy="57" rx="9" ry="13" fill={ink} />
      ) : a === "owl" || a === "penguin" ? (
        <path d="m41 57 7 11 7-11Z" fill="#efbb72" />
      ) : (
        <>
          <path d="M43 59q5-4 10 0l-5 6Z" fill={ink} />
          <path
            d="M48 65v4m-7 0q7 6 14 0"
            fill="none"
            stroke={ink}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </>
      )}
      {a === "dinosaur" && (
        <>
          <path
            d="M50 64q10-6 28-1v13H48"
            fill={c}
            stroke={ink}
            strokeWidth="2"
          />
          <path d="m60 64 4 6 4-6 4 6 4-6" fill="white" />
        </>
      )}
      {["cat", "otter"].includes(a) && (
        <path
          d="m21 60 11 2m-11 6 11-2m32-4 11-2m-11 6 11 2"
          stroke={ink}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}
