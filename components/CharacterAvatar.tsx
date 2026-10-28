import { ANIMALS, DEFAULT_CHARACTER, type Character } from "@/lib/characters";
export default function CharacterAvatar({
  character = DEFAULT_CHARACTER,
  size = 52,
  label,
}: {
  character?: Character;
  size?: number;
  label?: string;
}) {
  const a = character.animal,
    c = character.color,
    ink = "#173b3c",
    cream = "#fff0d6";
  const round = [
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
  const triangles = ["cat", "fox", "wolf", "tiger", "raccoon"].includes(a);
  return (
    <svg
      className="character-avatar"
      width={size}
      height={size}
      viewBox="0 0 96 96"
      role="img"
      aria-label={
        label ||
        `${ANIMALS.find(([key]) => key === a)?.[1]}${character.hat === "cap" ? ", com boné" : ""}${character.glasses !== "none" ? ", com óculos" : ""}`
      }
      shapeRendering="crispEdges"
    >
      <rect x="2" y="2" width="92" height="92" rx="12" fill={c} opacity=".16" />
      <path
        d="M25 92V80h8V72h30v8h8v12"
        fill={c}
        stroke={ink}
        strokeWidth="3"
      />
      {a === "lion" && (
        <path
          d="M26 19h44v8h10v12h7v27H77v13H19V66H9V39h7V27h10Z"
          fill="#bd7837"
          stroke={ink}
          strokeWidth="3"
        />
      )}
      {a === "elephant" && (
        <>
          <ellipse
            cx="20"
            cy="49"
            rx="17"
            ry="24"
            fill={c}
            stroke={ink}
            strokeWidth="3"
          />
          <ellipse
            cx="76"
            cy="49"
            rx="17"
            ry="24"
            fill={c}
            stroke={ink}
            strokeWidth="3"
          />
          <path
            d="M15 35v28m66-28v28"
            stroke={cream}
            strokeWidth="5"
            opacity=".5"
          />
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
            strokeWidth="3"
          />
          <circle
            cx="71"
            cy="28"
            r={a === "koala" ? 15 : 11}
            fill={a === "panda" ? ink : c}
            stroke={ink}
            strokeWidth="3"
          />
        </>
      )}
      {triangles && (
        <>
          <path
            d="m20 42-1-27 24 18m14 0 20-18-1 27"
            fill={c}
            stroke={ink}
            strokeWidth="3"
          />
          <path
            d="m25 30 1-8 9 10m30 0 7-10-1 9"
            stroke={cream}
            strokeWidth="4"
          />
        </>
      )}
      {a === "dog" && (
        <>
          <path
            d="M28 25 12 30 7 62l16 10 13-33m32-14 16 5 5 32-16 10-13-33"
            fill="#a76b44"
            stroke={ink}
            strokeWidth="3"
          />
        </>
      )}
      {a === "rabbit" && (
        <>
          <rect
            x="24"
            y="3"
            width="16"
            height="40"
            rx="8"
            fill={c}
            stroke={ink}
            strokeWidth="3"
          />
          <rect
            x="56"
            y="3"
            width="16"
            height="40"
            rx="8"
            fill={c}
            stroke={ink}
            strokeWidth="3"
          />
          <path d="M32 10v22m32-22v22" stroke="#f4a4b4" strokeWidth="5" />
        </>
      )}
      {a === "dinosaur" && (
        <path
          d="m28 31 4-17 11 9 9-16 9 17 13-4 1 18"
          fill="#2e937e"
          stroke={ink}
          strokeWidth="3"
        />
      )}
      {a === "owl" && (
        <path
          d="m16 33 1-19 21 13m20 0 20-13 1 20"
          fill={c}
          stroke={ink}
          strokeWidth="3"
        />
      )}
      {a === "frog" && (
        <>
          <circle
            cx="28"
            cy="31"
            r="14"
            fill={c}
            stroke={ink}
            strokeWidth="3"
          />
          <circle
            cx="68"
            cy="31"
            r="14"
            fill={c}
            stroke={ink}
            strokeWidth="3"
          />
        </>
      )}
      {a === "cow" && (
        <>
          <path
            d="m22 29-9-11-5 10 14 13m52-12 9-11 5 10-14 13"
            fill={cream}
            stroke={ink}
            strokeWidth="3"
          />
        </>
      )}
      <path
        d={
          a === "penguin"
            ? "M34 18h28v7h12v12h5v31H68v11H28V68H17V37h5V25h12Z"
            : "M31 27h34v6h11v12h5v20H71v12H25V65H15V45h5V33h11Z"
        }
        fill={a === "penguin" ? ink : a === "panda" ? "#f6f9eb" : c}
        stroke={ink}
        strokeWidth="3"
      />
      {a === "penguin" && (
        <path d="M31 38h12v8h10v-8h12v28H31Z" fill="#eff8ed" />
      )}
      {a === "raccoon" && <path d="M21 42h54v17H21Z" fill={ink} opacity=".8" />}
      {a === "panda" && (
        <>
          <ellipse cx="32" cy="48" rx="11" ry="13" fill={ink} />
          <ellipse cx="64" cy="48" rx="11" ry="13" fill={ink} />
        </>
      )}
      {a === "monkey" && (
        <path d="M24 40h18l6 8 6-8h18v23H61v9H35v-9H24Z" fill={cream} />
      )}
      {a === "fox" && <path d="m18 51 30 14 30-14-9 22H27Z" fill={cream} />}
      {a === "wolf" && (
        <path d="m19 54 18 3 11 13 11-13 18-3-9 19H28Z" fill={cream} />
      )}
      {a === "tiger" && (
        <path
          d="m19 39 12 6-12 4m58-10-12 6 12 4M36 29l3 9m21-9-3 9"
          stroke={ink}
          strokeWidth="4"
        />
      )}
      {a === "owl" && (
        <>
          <circle cx="32" cy="49" r="16" fill={cream} />
          <circle cx="64" cy="49" r="16" fill={cream} />
        </>
      )}
      {a === "cow" && <path d="M25 30h15v11H27v13H17V43h8Z" fill={ink} />}
      {["dog", "bear", "lion", "otter", "cat", "rabbit"].includes(a) && (
        <ellipse
          cx="48"
          cy="63"
          rx={a === "dog" ? 21 : 17}
          ry="12"
          fill={cream}
        />
      )}
      <rect
        x="28"
        y={a === "frog" ? 33 : 45}
        width="7"
        height="9"
        fill={["panda", "raccoon"].includes(a) ? "#fff" : ink}
      />
      <rect
        x="61"
        y={a === "frog" ? 33 : 45}
        width="7"
        height="9"
        fill={["panda", "raccoon"].includes(a) ? "#fff" : ink}
      />
      <rect
        x="29"
        y={a === "frog" ? 34 : 46}
        width="2"
        height="3"
        fill="#fff"
      />
      <rect
        x="62"
        y={a === "frog" ? 34 : 46}
        width="2"
        height="3"
        fill="#fff"
      />
      {a === "elephant" ? (
        <path
          d="M41 56h14v24h10v-8h8v12H48v-6h-7Z"
          fill={c}
          stroke={ink}
          strokeWidth="3"
        />
      ) : a === "pig" ? (
        <>
          <rect
            x="32"
            y="57"
            width="32"
            height="16"
            rx="6"
            fill="#ea94ad"
            stroke={ink}
            strokeWidth="2"
          />
          <path d="M41 62v6m14-6v6" stroke={ink} strokeWidth="3" />
        </>
      ) : a === "koala" ? (
        <ellipse cx="48" cy="57" rx="10" ry="13" fill={ink} />
      ) : a === "owl" || a === "penguin" ? (
        <path
          d="m40 58 8 12 8-12Z"
          fill="#ffc465"
          stroke={ink}
          strokeWidth="2"
        />
      ) : (
        <>
          <path d="M43 58h10l-5 7Z" fill={ink} />
          <path d="M48 65v5m-7 0h14" stroke={ink} strokeWidth="2" />
        </>
      )}
      {a === "dinosaur" && (
        <>
          <path d="M59 65h20v10H48" fill={c} stroke={ink} strokeWidth="3" />
          <path
            d="m61 66 3 5 4-5 3 5 4-5"
            fill="#fff"
            stroke={ink}
            strokeWidth="1"
          />
        </>
      )}
      {a === "cat" && (
        <path
          d="M21 60H9m13 7H10m64-7h11m-12 7h11"
          stroke={ink}
          strokeWidth="2"
        />
      )}
      {a === "otter" && (
        <>
          <path
            d="M21 61h12m-12 7h12m30-7h12m-12 7h12"
            stroke={ink}
            strokeWidth="2"
          />
          <rect x="43" y="70" width="10" height="6" fill="#fff" />
        </>
      )}
      {character.glasses !== "none" && (
        <g
          stroke={ink}
          strokeWidth="3"
          fill={character.glasses === "sun" ? "#163c51" : "#c7f6ff"}
          fillOpacity={character.glasses === "sun" ? 1 : 0.35}
        >
          {character.glasses === "round" ? (
            <>
              <circle cx="32" cy="49" r="12" />
              <circle cx="64" cy="49" r="12" />
            </>
          ) : (
            <>
              <rect x="19" y="39" width="26" height="19" rx="3" />
              <rect x="51" y="39" width="26" height="19" rx="3" />
            </>
          )}
          <path d="M44 46h8m-34-3h-5m65 0h5" fill="none" />
          {character.glasses === "sun" && (
            <path d="m24 43 5 10m27-10 5 10" stroke="#83d8de" strokeWidth="2" />
          )}
        </g>
      )}
      {character.hat === "cap" && (
        <>
          <path
            d="M27 29V17h7v-6h29v6h7v15H27"
            fill="#3289bc"
            stroke={ink}
            strokeWidth="3"
          />
          <path
            d="M29 30h51v7H29Z"
            fill="#53c9dd"
            stroke={ink}
            strokeWidth="3"
          />
          <rect x="44" y="16" width="9" height="9" fill="#93f0d1" />
        </>
      )}
      {character.hat === "beanie" && (
        <>
          <circle
            cx="48"
            cy="9"
            r="7"
            fill="#d88db7"
            stroke={ink}
            strokeWidth="2"
          />
          <path
            d="M24 29V19h8v-6h32v6h8v10"
            fill="#ad80d4"
            stroke={ink}
            strokeWidth="3"
          />
          <rect
            x="21"
            y="27"
            width="54"
            height="10"
            fill="#d5a5ed"
            stroke={ink}
            strokeWidth="3"
          />
          <path
            d="M31 28v8m12-8v8m12-8v8m11-8v8"
            stroke="#966bc1"
            strokeWidth="2"
          />
        </>
      )}
    </svg>
  );
}
