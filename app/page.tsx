"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Copy,
  Eraser,
  Heart,
  Lightbulb,
  LoaderCircle,
  Paintbrush,
  Pencil,
  Play,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  Users,
  X,
} from "lucide-react";
import type { RoomView } from "@/lib/game";
type Session = { code: string; token: string };
const colors = [
  "#27243a",
  "#8b5cf6",
  "#ef6a93",
  "#f4ad45",
  "#f5d96c",
  "#64bb95",
  "#61a8dd",
  "#ffffff",
];
const avatarColors = [
  "#e9deff",
  "#ffdfcc",
  "#d8eee8",
  "#ffe4ee",
  "#dce9ff",
  "#fff0bd",
];
function Avatar({
  name,
  i = 0,
  small = false,
}: {
  name: string;
  i?: number;
  small?: boolean;
}) {
  return (
    <span
      className={`avatar ${small ? "small" : ""}`}
      style={{ background: avatarColors[i % 6] }}
    >
      <span>{["✿", "◕", "✦", "☻", "❋", "★"][i % 6]}</span>
      <b>{name.slice(0, 1).toUpperCase()}</b>
    </span>
  );
}
function Illustration() {
  return (
    <svg
      className="hero-art"
      viewBox="0 0 560 440"
      role="img"
      aria-label="Uma ideia se transforma em desenho e em uma nova história"
    >
      <defs>
        <pattern id="dots" width="18" height="18" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="#d6c9ed" />
        </pattern>
      </defs>
      <circle cx="290" cy="215" r="180" fill="#eee7fb" />
      <circle cx="290" cy="215" r="175" fill="url(#dots)" />
      <path
        d="M95 169 Q30 286 150 330 M435 114 Q530 154 474 281"
        fill="none"
        stroke="#bba4e0"
        strokeWidth="3"
        strokeDasharray="7 9"
      />
      <path
        d="m142 315 12 20-24-3m329-61 10 17 13-17"
        fill="none"
        stroke="#bba4e0"
        strokeWidth="3"
      />
      <g transform="translate(62 54) rotate(-9 110 64)">
        <rect x="0" y="0" width="218" height="114" rx="18" fill="#d9c9f3" />
        <rect
          x="0"
          y="-7"
          width="218"
          height="114"
          rx="18"
          fill="white"
          stroke="#e5dcf2"
          strokeWidth="2"
        />
        <text x="22" y="28" fontSize="12" fontWeight="700" fill="#9a83b7">
          ERA UMA VEZ...
        </text>
        <text x="22" y="58" fontSize="16" fontWeight="700" fill="#514264">
          Um gatinho viajando
        </text>
        <text x="22" y="82" fontSize="16" fontWeight="700" fill="#514264">
          pelo espaço ✨
        </text>
      </g>
      <g transform="translate(228 126) rotate(9 118 113)">
        <rect width="234" height="224" rx="16" fill="#cbb4ec" />
        <rect
          y="-8"
          width="234"
          height="224"
          rx="16"
          fill="#fff"
          stroke="#e3d7f1"
          strokeWidth="2"
        />
        <rect x="12" y="5" width="210" height="183" rx="9" fill="#f7f2ff" />
        <circle cx="117" cy="88" r="56" fill="#e8dcfa" />
        <path
          d="m81 80-7-33 30 17m29 1 29-18-7 38"
          fill="#f4c993"
          stroke="#655177"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <ellipse
          cx="118"
          cy="91"
          rx="43"
          ry="35"
          fill="#f4c993"
          stroke="#655177"
          strokeWidth="3"
        />
        <path
          d="M94 91h6m35 0h6m-26 12 4 3 4-3m-4 4v5m-26-10-19-3m18 11-18 5m70-13 19-3m-19 11 18 4"
          fill="none"
          stroke="#655177"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="m88 120 3 30 55 0 4-30"
          fill="#c2afe6"
          stroke="#655177"
          strokeWidth="3"
        />
        <ellipse
          cx="119"
          cy="152"
          rx="47"
          ry="9"
          fill="#e0d1f3"
          stroke="#655177"
          strokeWidth="3"
        />
        <path
          d="m52 49 4 9 10 2-8 6 1 10-8-6-9 4 3-10-6-7 11 1m130 59 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1"
          fill="#eac76f"
        />
        <circle cx="178" cy="39" r="4" fill="#bca6dc" />
        <circle cx="52" cy="137" r="3" fill="#bca6dc" />
        <text x="18" y="207" fill="#a391ba" fontSize="10">
          um desenho, mil interpretações
        </text>
      </g>
      <g transform="translate(55 306) rotate(-6)">
        <rect
          width="229"
          height="81"
          rx="17"
          fill="white"
          stroke="#e5dcf2"
          strokeWidth="2"
        />
        <text x="18" y="29" fontSize="11" fontWeight="700" fill="#9a83b7">
          EU ACHO QUE É...
        </text>
        <text x="18" y="56" fontSize="16" fontWeight="700" fill="#514264">
          O primeiro gato astronauta!
        </text>
      </g>
      <g transform="translate(441 306) rotate(25)">
        <rect x="0" width="19" height="92" rx="5" fill="#a182d0" />
        <path d="m0 85 9 23 10-23" fill="#efd9b7" />
        <path d="m6 100 3 8 4-8" fill="#514264" />
        <rect y="8" width="19" height="9" fill="#cfbceb" />
      </g>
      <path
        d="m412 50 5 13 14 3-12 8-1 14-10-10-14 3 6-13-7-12 14 2"
        fill="#e8bf65"
      />
      <path
        d="m61 251 4 9 10 2-8 6-1 10-7-7-10 2 4-9-5-8 10 1"
        fill="#baa0de"
      />
    </svg>
  );
}
function Drawing({
  onSubmit,
  busy,
}: {
  onSubmit: (value: string) => void;
  busy: boolean;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const down = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const history = useRef<ImageData[]>([]);
  const [color, setColor] = useState(colors[0]);
  const [size, setSize] = useState(5);
  const [erase, setErase] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const c = canvas.current!;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, c.width, c.height);
  }, []);
  function remember() {
    const c = canvas.current!;
    history.current.push(
      c.getContext("2d")!.getImageData(0, 0, c.width, c.height),
    );
    if (history.current.length > 15) history.current.shift();
  }
  function point(e: React.PointerEvent<HTMLCanvasElement>) {
    const c = canvas.current!,
      r = c.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) * c.width) / r.width,
      y: ((e.clientY - r.top) * c.height) / r.height,
    };
  }
  function paint(e: React.PointerEvent<HTMLCanvasElement>, start = false) {
    if (!down.current && !start) return;
    const ctx = canvas.current!.getContext("2d")!,
      p = point(e),
      from = last.current ?? p;
    ctx.strokeStyle = erase ? "#ffffff" : color;
    ctx.fillStyle = ctx.strokeStyle;
    ctx.lineWidth = erase ? size * 4 : size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    if (start) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, ctx.lineWidth / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    last.current = p;
    setDirty(true);
  }
  function send() {
    const value = canvas.current!.toDataURL("image/webp", 0.65);
    if (value.length > 180000) {
      setError(
        "Este desenho ficou muito detalhado. Apague alguns traços para enviar.",
      );
      return;
    }
    onSubmit(value);
  }
  return (
    <div className="drawing-area">
      <div className="canvas-wrap">
        <canvas
          ref={canvas}
          width={900}
          height={560}
          aria-label="Área de desenho. Use o mouse ou toque para desenhar."
          onPointerDown={(e) => {
            if (busy) return;
            remember();
            down.current = true;
            last.current = null;
            e.currentTarget.setPointerCapture(e.pointerId);
            paint(e, true);
          }}
          onPointerMove={(e) => paint(e)}
          onPointerUp={() => {
            down.current = false;
            last.current = null;
          }}
          onPointerCancel={() => {
            down.current = false;
            last.current = null;
          }}
        />
      </div>
      <div className="tools">
        <div className="swatches">
          {colors.map((c) => (
            <button
              key={c}
              aria-label={`Cor ${c}`}
              aria-pressed={!erase && color === c}
              className={`swatch ${!erase && color === c ? "selected" : ""}`}
              style={{ background: c }}
              onClick={() => {
                setColor(c);
                setErase(false);
              }}
            />
          ))}
        </div>
        <div className="tool-group">
          <button
            className={`icon-button ${erase ? "active" : ""}`}
            title="Borracha"
            aria-label="Borracha"
            onClick={() => setErase(!erase)}
          >
            <Eraser size={19} />
          </button>
          <input
            aria-label="Espessura do pincel"
            type="range"
            min="2"
            max="24"
            value={size}
            onChange={(e) => setSize(+e.target.value)}
          />
          <button
            className="icon-button"
            aria-label="Desfazer"
            title="Desfazer"
            onClick={() => {
              const previous = history.current.pop();
              if (previous)
                canvas.current!.getContext("2d")!.putImageData(previous, 0, 0);
            }}
          >
            <RotateCcw size={18} />
          </button>
          <button
            className="icon-button"
            title="Limpar desenho"
            aria-label="Limpar desenho"
            onClick={() => {
              remember();
              const c = canvas.current!;
              c.getContext("2d")!.fillStyle = "#fff";
              c.getContext("2d")!.fillRect(0, 0, c.width, c.height);
            }}
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
      {error && <p className="error">{error}</p>}
      <button
        className="primary submit"
        disabled={!dirty || busy}
        onClick={send}
      >
        {busy ? (
          <LoaderCircle className="spin" size={18} />
        ) : (
          <Check size={18} />
        )}{" "}
        Enviar desenho
      </button>
    </div>
  );
}
export default function Page() {
  const [session, setSession] = useState<Session | null>(null),
    [room, setRoom] = useState<RoomView | null>(null),
    [name, setName] = useState(""),
    [code, setCode] = useState(""),
    [mode, setMode] = useState<"create" | "join">("create"),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [connection, setConnection] = useState(""),
    [phrase, setPhrase] = useState(""),
    [seconds, setSeconds] = useState(90),
    [ending, setEnding] = useState("auto"),
    [now, setNow] = useState(Date.now()),
    [copied, setCopied] = useState(false),
    [album, setAlbum] = useState(0),
    [offset, setOffset] = useState(0);
  const current = useRef<Session | null>(null);
  useEffect(() => {
    const invite = new URLSearchParams(location.search).get("sala");
    if (invite) {
      setCode(invite.toUpperCase().slice(0, 6));
      setMode("join");
    }
    try {
      const saved = JSON.parse(
        localStorage.getItem("phoneart-session") || "null",
      );
      if (saved?.code && saved?.token) {
        current.current = saved;
        setSession(saved);
      }
      setName(localStorage.getItem("phoneart-name") || "");
    } catch {}
  }, []);
  const accept = useCallback((r: RoomView) => {
    setRoom((previous) =>
      previous?.code === r.code && previous.version > r.version ? previous : r,
    );
    setOffset(r.serverNow - Date.now());
    setConnection("");
  }, []);
  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      try {
        const res = await fetch(
          `/api/rooms?code=${session.code}&album=${album}`,
          { headers: { "x-player-token": session.token }, cache: "no-store" },
        );
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          if ([401, 404].includes(res.status)) {
            localStorage.removeItem("phoneart-session");
            setSession(null);
            current.current = null;
            setRoom(null);
            setError(data.error);
            return;
          }
          throw Error(data.error);
        }
        accept(data.room);
      } catch (e) {
        if (!cancelled)
          setConnection(e instanceof Error ? e.message : "Reconectando…");
      }
      if (!cancelled) timer = setTimeout(poll, 2000);
    };
    poll();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [session, accept, album]);
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    setPhrase("");
    setError("");
  }, [room?.round, room?.status]);
  async function action(
    actionName: string,
    extra: Record<string, unknown> = {},
  ) {
    setBusy(true);
    setError("");
    try {
      const s = current.current;
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(s ? { "x-player-token": s.token } : {}),
        },
        body: JSON.stringify({ action: actionName, code: s?.code, ...extra }),
      });
      const data = await res.json();
      if (!res.ok) throw Error(data.error);
      if (data.token) {
        const next = { code: data.room.code, token: data.token };
        localStorage.setItem("phoneart-session", JSON.stringify(next));
        localStorage.setItem("phoneart-name", name);
        current.current = next;
        setSession(next);
      }
      accept(data.room);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Algo deu errado. Tente novamente.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(
        `${location.origin}?sala=${room!.code}`,
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setError(`Compartilhe o código ${room!.code} com seus amigos.`);
    }
  }
  function leave() {
    if (
      room?.status === "playing" &&
      !confirm(
        "Sair apaga sua sessão neste navegador. Não será possível voltar para esta partida. Deseja sair?",
      )
    )
      return;
    setRoom(null);
    setSession(null);
    current.current = null;
    localStorage.removeItem("phoneart-session");
    setError("");
    history.replaceState(null, "", location.pathname);
  }
  const remaining = room
    ? Math.max(0, Math.ceil((room.deadline - now - offset) / 1000))
    : 0;
  return (
    <>
      <header className="site-header">
        <button
          className="brand"
          onClick={() => {
            if (room) leave();
          }}
          aria-label="PhoneArt início"
        >
          <span className="brand-icon">
            <Paintbrush size={23} />
          </span>
          Phone<span>Art</span>
          <span className="brand-dot">✦</span>
        </button>
        <div className="header-right">
          <span className="online-dot" /> Feito para jogar junto{" "}
          <span className="header-separator" />
          <span className="little-tag">BETA</span>
        </div>
      </header>
      <main>
        {!room ? (
          <>
            <section className="hero">
              <div className="hero-copy">
                <span className="eyebrow">
                  <Sparkles size={14} /> TELEFONE SEM FIO, COM UM TOQUE DE ARTE
                </span>
                <h1>
                  Sua ideia.
                  <br />
                  Outro desenho.
                  <br />
                  <span>Uma boa confusão.</span>
                  <svg viewBox="0 0 380 16" aria-hidden="true">
                    <path
                      d="M4 10 Q160 -2 373 8M50 14Q220 5 330 13"
                      fill="none"
                      stroke="#cbb5ec"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </svg>
                </h1>
                <p>
                  Uma frase vira desenho. Um desenho vira outra história.
                  <br className="desktop" /> Reúna os amigos e descubra onde a
                  imaginação vai parar.
                </p>
                <div className="hero-badges">
                  <span>
                    <Users size={16} /> 2 a 20 jogadores
                  </span>
                  <span>
                    <Paintbrush size={16} /> Talento é opcional
                  </span>
                  <span>
                    <Heart size={15} /> Risadas garantidas
                  </span>
                </div>
              </div>
              <Illustration />
            </section>
            <section className="entry-section">
              <div className="room-card">
                <div className="card-heading">
                  <span className="mini-icon">
                    <Play size={18} />
                  </span>
                  <div>
                    <h2>Todo mundo tem uma história pra estragar.</h2>
                    <p>No melhor sentido possível. Vamos jogar?</p>
                  </div>
                </div>
                <div className="tabs">
                  <button
                    className={mode === "create" ? "selected" : ""}
                    onClick={() => setMode("create")}
                  >
                    <Plus size={16} /> Criar uma sala
                  </button>
                  <button
                    className={mode === "join" ? "selected" : ""}
                    onClick={() => setMode("join")}
                  >
                    <Users size={16} /> Entrar em uma sala
                  </button>
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    action(mode === "create" ? "create" : "join", {
                      name,
                      code: code.toUpperCase(),
                    });
                  }}
                >
                  <div className="entry-fields">
                    <label>
                      COMO PODEMOS TE CHAMAR?
                      <div className="name-input">
                        <span>☺</span>
                        <input
                          required
                          maxLength={24}
                          autoComplete="nickname"
                          placeholder="Seu apelido"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                    </label>
                    {mode === "join" && (
                      <label>
                        CÓDIGO DA SALA
                        <input
                          className="code-input"
                          required
                          minLength={6}
                          maxLength={6}
                          placeholder="ABC123"
                          value={code}
                          onChange={(e) =>
                            setCode(
                              e.target.value
                                .toUpperCase()
                                .replace(/[^A-Z2-9]/g, ""),
                            )
                          }
                        />
                      </label>
                    )}
                    <button className="primary" disabled={busy}>
                      {busy ? (
                        <LoaderCircle className="spin" size={18} />
                      ) : mode === "create" ? (
                        <>
                          Criar minha sala <ArrowRight size={18} />
                        </>
                      ) : (
                        <>
                          Entrar na sala <ArrowRight size={18} />
                        </>
                      )}
                    </button>
                  </div>
                  <p className="card-note">
                    <span className="online-dot" />{" "}
                    {mode === "create"
                      ? "Sua sala é privada. Só entra quem tem o código."
                      : "Peça o código para quem criou a sala."}
                  </p>
                </form>
              </div>
              <div className="tip-card">
                <span className="tip-doodle">
                  <Lightbulb size={27} />
                </span>
                <h3>Não sabe desenhar?</h3>
                <p>
                  Perfeito. Os melhores desenhos
                  <br />
                  são os que ninguém entende.
                </p>
                <span className="tip-script">confia no processo ↗</span>
              </div>
            </section>
            <section className="how" id="como-jogar">
              <div className="section-title">
                <span /> <h2>Uma ideia, muitas versões</h2> <span />
              </div>
              <p className="section-subtitle">
                É simples de jogar. Impossível prever o resultado.
              </p>
              <div className="steps">
                <article>
                  <span className="step-icon pink">
                    <Pencil size={25} />
                    <b>1</b>
                  </span>
                  <h3>Solte a imaginação</h3>
                  <p>
                    Cada um escreve uma frase original.
                    <br />
                    Quanto mais criativa, melhor.
                  </p>
                </article>
                <span className="step-arrow">⤳</span>
                <article>
                  <span className="step-icon purple">
                    <Paintbrush size={25} />
                    <b>2</b>
                  </span>
                  <h3>Transforme em rabisco</h3>
                  <p>
                    Você recebe uma frase e desenha.
                    <br />
                    Vale caprichar. Vale improvisar.
                  </p>
                </article>
                <span className="step-arrow">⤳</span>
                <article>
                  <span className="step-icon green">
                    <Users size={25} />
                    <b>3</b>
                  </span>
                  <h3>Adivinhe e passe adiante</h3>
                  <p>
                    O próximo adivinha seu desenho.
                    <br />E a história continua mudando.
                  </p>
                </article>
                <span className="step-arrow">⤳</span>
                <article>
                  <span className="step-icon yellow">
                    <Sparkles size={25} />
                    <b>4</b>
                  </span>
                  <h3>Revelem o caos</h3>
                  <p>
                    No final, vejam todos os álbuns.
                    <br />
                    Da primeira ideia à última surpresa.
                  </p>
                </article>
              </div>
            </section>
          </>
        ) : (
          <section className="game-shell">
            <div className="game-top">
              <button className="text-button" onClick={leave}>
                <ChevronLeft size={17} /> Início
              </button>
              <div className="room-code">
                SALA <b>{room.code}</b>
                <button
                  className="icon-button"
                  onClick={copy}
                  aria-label="Copiar convite"
                >
                  {copied ? <Check size={17} /> : <Copy size={17} />}
                </button>
              </div>
              <span className="player-count">
                <Users size={17} />
                {room.players.length}/20
              </span>
            </div>
            {connection && (
              <div className="connection">
                <LoaderCircle className="spin" size={16} /> {connection} —
                tentando reconectar.
              </div>
            )}
            {room.status === "lobby" && (
              <>
                <div className="game-heading">
                  <span className="eyebrow">A BOA CONFUSÃO COMEÇA AQUI</span>
                  <h1>
                    A turma está chegando<span>…</span>
                  </h1>
                  <p>
                    Compartilhe o convite, escolha o ritmo e deixe a imaginação
                    entrar.
                  </p>
                </div>
                <div className="lobby-grid">
                  <div className="panel">
                    <div className="panel-heading">
                      <h2>Quem vai criar essa história?</h2>
                      <span>{room.players.length} jogadores</span>
                    </div>
                    <div className="players">
                      {room.players.map((p, i) => (
                        <div className="player" key={p.id}>
                          <Avatar name={p.name} i={i} />
                          <div>
                            <strong>
                              {p.name}
                              {p.id === room.me ? " (você)" : ""}
                            </strong>
                            <small>
                              {p.id === room.hostId
                                ? "✦ Anfitrião"
                                : "Pronto para imaginar"}
                            </small>
                          </div>
                          {room.me === room.hostId && p.id !== room.me && (
                            <button
                              className="icon-button remove"
                              title="Remover jogador"
                              aria-label={`Remover ${p.name}`}
                              disabled={busy}
                              onClick={() =>
                                action("remove", { playerId: p.id })
                              }
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                      {room.players.length < 20 && (
                        <button className="invite-player" onClick={copy}>
                          <span>
                            <Plus size={22} />
                          </span>
                          Convide um amigo
                        </button>
                      )}
                    </div>
                    <button className="secondary wide" onClick={copy}>
                      {copied ? <Check size={17} /> : <Copy size={17} />}{" "}
                      {copied ? "Convite copiado!" : "Copiar link de convite"}
                    </button>
                  </div>
                  <div className="panel settings">
                    <h2>Do seu jeito</h2>
                    <label>
                      Tempo por rodada
                      <select
                        value={seconds}
                        disabled={room.me !== room.hostId}
                        onChange={(e) => setSeconds(+e.target.value)}
                      >
                        <option value={60}>1 minuto · rapidinho</option>
                        <option value={90}>1 min 30 s · na medida</option>
                        <option value={120}>2 minutos · com carinho</option>
                        <option value={180}>3 minutos · obra-prima</option>
                      </select>
                    </label>
                    <label>
                      Como a história termina?
                      <select
                        value={ending}
                        disabled={room.me !== room.hostId}
                        onChange={(e) => setEnding(e.target.value)}
                      >
                        <option value="auto">Uma volta completa</option>
                        <option value="phrase">Com uma adivinhação</option>
                        <option value="drawing">Com um desenho</option>
                      </select>
                    </label>
                    <p className="settings-note">
                      Cada um inventa só a primeira frase. Depois, é desenhar e
                      adivinhar até todos participarem de cada álbum. O final
                      escolhido pode acrescentar uma rodada.
                    </p>
                    <button
                      className="primary wide"
                      disabled={
                        busy ||
                        room.players.length < 2 ||
                        room.me !== room.hostId
                      }
                      onClick={() => action("start", { seconds, ending })}
                    >
                      <Play size={18} />
                      {room.me === room.hostId
                        ? "Começar a partida"
                        : "Aguardando o anfitrião"}
                    </button>
                    {room.players.length < 2 && (
                      <small>Precisamos de pelo menos 2 jogadores.</small>
                    )}
                  </div>
                </div>
              </>
            )}
            {room.status === "playing" && (
              <>
                <div className="round-bar">
                  <span>
                    RODADA <b>{room.round + 1}</b> / {room.totalRounds}
                  </span>
                  <span className={remaining < 16 ? "timer urgent" : "timer"}>
                    <Clock3 size={18} />
                    {Math.floor(remaining / 60)}:
                    {String(remaining % 60).padStart(2, "0")}
                  </span>
                  <span>
                    <CheckCheck size={17} /> {room.completed}/
                    {room.players.length} enviaram
                  </span>
                </div>
                <div className="progress">
                  <div
                    style={{
                      width: `${((room.round + 1) / room.totalRounds) * 100}%`,
                    }}
                  />
                </div>
                {room.submitted ? (
                  <div className="waiting panel">
                    <span className="big-sticker">✦</span>
                    <h1>Sua parte da história está pronta!</h1>
                    <p>
                      Os outros ainda estão soltando a imaginação.
                      <br />A próxima rodada começa quando todos enviarem ou o
                      tempo acabar.
                    </p>
                    <div className="waiting-count">
                      <LoaderCircle className="spin" size={17} />
                      {room.completed} de {room.players.length} jogadas
                      recebidas
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="game-heading compact">
                      <span className="eyebrow">
                        {room.round === 0
                          ? "ONDE TUDO COMEÇA"
                          : room.round % 2
                            ? "AGORA É COM SEU PINCEL"
                            : "O QUE VOCÊ ESTÁ VENDO?"}
                      </span>
                      <h1>
                        {room.round === 0
                          ? "Uma frase. Infinitas possibilidades."
                          : room.round % 2
                            ? "Dê forma a essa ideia."
                            : "Que história esse desenho conta?"}
                      </h1>
                      <p>
                        {room.round === 0
                          ? "Invente qualquer coisa. Um elefante bebendo água? Um abacate de férias?"
                          : room.round % 2
                            ? "Desenhe a frase abaixo. Evite escrever palavras no desenho!"
                            : "Adivinhe o desenho. Essa será a frase que o próximo jogador vai receber."}
                      </p>
                    </div>
                    {room.previous && (
                      <div className="previous panel">
                        {room.previous.kind === "phrase" ? (
                          <>
                            <span className="eyebrow">SUA INSPIRAÇÃO</span>
                            <p>“{room.previous.value}”</p>
                          </>
                        ) : room.previous.value ? (
                          <img
                            src={room.previous.value}
                            alt="Desenho do jogador anterior para você adivinhar"
                          />
                        ) : (
                          <div className="empty-drawing">
                            <Paintbrush size={32} />
                            <p>
                              O desenho anterior ficou em branco. Imagine o que
                              poderia ser!
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                    {room.round % 2 ? (
                      <Drawing
                        key={`${room.code}-${room.round}`}
                        busy={busy}
                        onSubmit={(value) =>
                          action("submit", { round: room.round, value })
                        }
                      />
                    ) : (
                      <form
                        className="phrase-form panel"
                        onSubmit={(e) => {
                          e.preventDefault();
                          action("submit", {
                            round: room.round,
                            value: phrase,
                          });
                        }}
                      >
                        <label htmlFor="phrase">
                          {room.round === 0
                            ? "Sua frase criativa"
                            : "Sua adivinhação"}
                        </label>
                        <textarea
                          id="phrase"
                          required
                          maxLength={180}
                          value={phrase}
                          onChange={(e) => setPhrase(e.target.value)}
                          placeholder={
                            room.round === 0
                              ? "Um elefante bebendo água na lua…"
                              : "Eu acho que é…"
                          }
                          autoFocus
                        />
                        <div className="phrase-footer">
                          <span>{phrase.length}/180</span>
                          <button
                            className="primary"
                            disabled={busy || !phrase.trim()}
                          >
                            {busy ? (
                              <LoaderCircle className="spin" size={18} />
                            ) : (
                              <Check size={18} />
                            )}
                            Enviar {room.round === 0 ? "frase" : "adivinhação"}
                          </button>
                        </div>
                      </form>
                    )}
                  </>
                )}
              </>
            )}
            {room.status === "finished" && room.albums && (
              <>
                <div className="game-heading">
                  <span className="eyebrow">
                    <Sparkles size={14} /> HORA DA REVELAÇÃO
                  </span>
                  <h1>Como foi que chegamos aqui?</h1>
                  <p>
                    Uma pequena ideia, uma grande viagem. Explore os álbuns da
                    turma.
                  </p>
                </div>
                <div className="album-tabs">
                  {room.players.map((p, i) => (
                    <button
                      key={p.id}
                      className={album === i ? "selected" : ""}
                      onClick={() => setAlbum(i)}
                    >
                      <Avatar name={p.name} i={i} small />
                      {p.name}
                    </button>
                  ))}
                </div>
                <div className="album-title">
                  <h2>O álbum de {room.players[album]?.name}</h2>
                  <span>
                    {room.albums[album]?.length} capítulos de pura criatividade
                  </span>
                </div>
                <div className="timeline">
                  {room.revealedAlbum !== album && (
                    <p className="empty-drawing">Carregando álbum…</p>
                  )}
                  {room.albums[album]?.map((entry, i) => {
                    const index = room.players.findIndex(
                      (p) => p.id === entry.playerId,
                    );
                    return (
                      <article className="timeline-entry" key={i}>
                        <div className="timeline-avatar">
                          <Avatar
                            name={room.players[index]?.name || "?"}
                            i={index}
                          />
                        </div>
                        <div className="timeline-card">
                          <div className="entry-author">
                            <strong>{room.players[index]?.name}</strong>
                            <span>
                              {i === 0
                                ? "inventou"
                                : entry.kind === "drawing"
                                  ? "desenhou"
                                  : "adivinhou"}{" "}
                              <span className="chapter">· {i + 1}</span>
                            </span>
                            {entry.timedOut && <small>tempo esgotado</small>}
                          </div>
                          {entry.kind === "phrase" ? (
                            <p className="revealed-phrase">“{entry.value}”</p>
                          ) : entry.value ? (
                            <img
                              className="revealed-image"
                              src={entry.value}
                              alt={`Desenho de ${room.players[index]?.name}, etapa ${i + 1}`}
                            />
                          ) : (
                            <p className="empty-drawing">
                              Uma tela em branco também conta uma história…
                            </p>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
                <div className="reveal-actions">
                  <button
                    className="secondary"
                    disabled={album === 0}
                    onClick={() => setAlbum(album - 1)}
                  >
                    <ChevronLeft size={17} />
                    Anterior
                  </button>
                  {album < room.players.length - 1 ? (
                    <button
                      className="primary"
                      onClick={() => setAlbum(album + 1)}
                    >
                      Próximo álbum
                      <ChevronRight size={17} />
                    </button>
                  ) : room.hostId === room.me ? (
                    <button
                      className="primary"
                      disabled={busy}
                      onClick={() => {
                        setAlbum(0);
                        action("reset");
                      }}
                    >
                      <RotateCcw size={17} />
                      Jogar outra vez
                    </button>
                  ) : (
                    <span>Aguarde o anfitrião para jogar de novo.</span>
                  )}
                </div>
              </>
            )}
          </section>
        )}
        {error && (
          <div className="error-banner" role="alert">
            <span>{error}</span>
            <button
              className="icon-button"
              aria-label="Fechar aviso"
              onClick={() => setError("")}
            >
              <X size={16} />
            </button>
          </div>
        )}
        {session && !room && (
          <div className="restoring">
            <LoaderCircle className="spin" size={20} /> Recuperando sua sala…
          </div>
        )}
      </main>
      <footer>
        <span className="footer-brand">
          PhoneArt <span>✦</span>
        </span>
        <span>Menos perfeição. Mais imaginação.</span>
        <span className="footer-love">
          Feito para conectar pessoas <Heart size={13} />
        </span>
      </footer>
    </>
  );
}
