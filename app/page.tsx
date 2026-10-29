"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Copy,
  Download,
  Heart,
  Lightbulb,
  LoaderCircle,
  Paintbrush,
  Pencil,
  Play,
  Plus,
  RotateCcw,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import CharacterAvatar from "@/components/CharacterAvatar";
import CharacterEditor from "@/components/CharacterEditor";
import Participants from "@/components/Participants";
import {
  DEFAULT_CHARACTER,
  parseCharacter,
  type Character,
} from "@/lib/characters";
import ThemeToggle from "@/components/ThemeToggle";
import { timeOptionsFor, timeLabel } from "@/lib/settings";
import PhoneGuess from "@/components/PhoneGuess";
import Drawing from "@/components/Drawing";
import type { GameMode, RoomView } from "@/lib/game";
type Session = { code: string; token: string };
function Avatar({
  name,
  small = false,
  avatar,
}: {
  name: string;
  i?: number;
  small?: boolean;
  avatar?: Character;
}) {
  return (
    <span className={`avatar ${small ? "small" : ""}`}>
      <CharacterAvatar
        character={avatar}
        size={small ? 30 : 45}
        label={`Personagem de ${name}`}
      />
    </span>
  );
}
function Illustration() {
  return (
    <div
      className="friends-illustration"
      aria-label="Amigos transformam uma frase em desenho"
    >
      <div className="sketch-paper">
        <span>Alguém escreve...</span>
        <p>“Um gato de férias”</p>
        <svg viewBox="0 0 280 195" fill="none" aria-hidden="true">
          <path
            d="M42 145c38-9 130-6 195 5M57 163c55-7 107-6 164-1"
            stroke="#c4d6df"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="m112 70-8-32 28 21m32 0 27-22-5 34"
            fill="#e7ba89"
            stroke="#53606e"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <ellipse
            cx="149"
            cy="87"
            rx="43"
            ry="36"
            fill="#e7ba89"
            stroke="#53606e"
            strokeWidth="3"
          />
          <path
            d="M124 86h8m35 0h8m-30 10 5 4 5-4m-5 6v6m-41-7-16-3m16 11-16 4m92-12 17-3m-17 11 17 4"
            stroke="#53606e"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M132 124v28h38v-28"
            fill="#b3c8eb"
            stroke="#53606e"
            strokeWidth="3"
          />
          <path
            d="M201 137V67m-30 0c18-30 42-30 60 0h-60Z"
            fill="#e9c2cd"
            stroke="#78808b"
            strokeWidth="2.5"
          />
          <circle cx="68" cy="48" r="15" fill="#f1d49a" />
        </svg>
        <small>...e alguém tenta desenhar.</small>
      </div>
      <div className="friend-card friend-main">
        <CharacterAvatar
          character={{ animal: "portrait", color: "#cedce7" }}
          size={114}
        />
        <span>Vale qualquer ideia.</span>
      </div>
      <div className="friend-card friend-anime">
        <CharacterAvatar
          character={{ animal: "naruto", color: "#ffb578" }}
          size={84}
        />
        <span>Qualquer uma mesmo.</span>
      </div>
    </div>
  );
}
export default function Page() {
  const [session, setSession] = useState<Session | null>(null),
    [room, setRoom] = useState<RoomView | null>(null),
    [name, setName] = useState(""),
    [character, setCharacter] = useState<Character>(DEFAULT_CHARACTER),
    [editingCharacter, setEditingCharacter] = useState(false),
    [code, setCode] = useState(""),
    [mode, setMode] = useState<"create" | "join">("create"),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [connection, setConnection] = useState(""),
    [phrase, setPhrase] = useState(""),
    [seconds, setSeconds] = useState(90),
    [autoSendDrawings, setAutoSendDrawings] = useState(false),
    [gameMode, setGameMode] = useState<GameMode>("classic"),
    [exporting, setExporting] = useState(false),
    [exportProgress, setExportProgress] = useState(""),
    [ending, setEnding] = useState("auto"),
    [now, setNow] = useState(Date.now()),
    [copied, setCopied] = useState(false),
    [offset, setOffset] = useState(0);
  const current = useRef<Session | null>(null);
  const closeCharacterEditor = useCallback(
    () => setEditingCharacter(false),
    [],
  );
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
      try {
        setCharacter(
          parseCharacter(
            JSON.parse(localStorage.getItem("phoneart-character") || "null"),
          ),
        );
      } catch {}
    } catch {}
  }, []);
  const accept = useCallback((r: RoomView) => {
    setRoom((previous) =>
      previous?.code === r.code && previous.version > r.version ? previous : r,
    );
    if (r.status === "lobby") {
      setGameMode(r.mode);
      setSeconds(r.seconds);
      setAutoSendDrawings(r.autoSendDrawings);
      setEnding(r.ending);
    }
    setOffset(r.serverNow - Date.now());
    setConnection("");
  }, []);
  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      try {
        const res = await fetch(`/api/rooms?code=${session.code}`, {
          headers: { "x-player-token": session.token },
          cache: "no-store",
        });
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
  }, [session, accept]);
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    setPhrase("");
    setError("");
  }, [room?.round, room?.status]);
  useEffect(() => {
    if (room?.status !== "finished" || editingCharacter) return;
    const frame = requestAnimationFrame(() => {
      const target = document.querySelector(
        room.me === room.hostId
          ? ".reveal-actions"
          : ".timeline-entry:last-child",
      );
      target?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "nearest",
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [
    room?.status,
    room?.revealCursor,
    editingCharacter,
    room?.me,
    room?.hostId,
  ]);
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
      return true;
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Algo deu errado. Tente novamente.",
      );
      return false;
    } finally {
      setBusy(false);
    }
  }
  async function saveCharacter(value: Character) {
    if (room && !(await action("profile", { avatar: value }))) return false;
    setCharacter(value);
    try {
      localStorage.setItem("phoneart-character", JSON.stringify(value));
    } catch {}
    return true;
  }
  async function downloadPdf() {
    if (!room || !session || exporting) return;
    setExporting(true);
    setError("");
    setExportProgress("Préparando PDF…");
    try {
      const { exportGamePdf } = await import("@/lib/export-pdf");
      await exportGamePdf(room, session, setExportProgress);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Não foi possível gerar o PDF.",
      );
    } finally {
      setExporting(false);
      setExportProgress("");
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
  const album = room?.revealedAlbum ?? 0;
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
          <ThemeToggle />
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
                <span className="eyebrow">Para jogar com os amigos</span>
                <h1>
                  Escreva uma frase.
                  <br />
                  Passe o desenho.
                  <br />
                  <span>Veja no que dá.</span>
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
            <Link href="/enigma" className="enigma-home-card"><span className="enigma-home-icon"><Lightbulb size={28}/></span><span><small>PARA JOGAR SOLO</small><strong>PhoneEnigma</strong><span>Um desenho, seis chances. Descubra o desafio do dia ou jogue no modo livre.</span></span><ArrowRight size={24}/></Link>
            <section className="entry-section">
              <div className="room-card">
                <div className="card-heading">
                  <span className="mini-icon">
                    <Play size={18} />
                  </span>
                  <div>
                    <h2>Chame a turma.</h2>
                    <p>Crie uma sala ou entre com um convite.</p>
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
                <button
                  className="character-home-button"
                  type="button"
                  onClick={() => setEditingCharacter(true)}
                >
                  <CharacterAvatar character={character} size={54} />
                  <span>
                    <strong>Seu personagem</strong>
                    <small>Escolha seu personagem favorito</small>
                  </span>
                  <Pencil size={17} />
                </button>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    action(mode === "create" ? "create" : "join", {
                      name,
                      avatar: character,
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
                <h3>Não precisa desenhar bem.</h3>
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
            <div className="room-layout">
              <Participants
                room={room}
                onEdit={() => setEditingCharacter(true)}
              />
              <div className="room-stage">
                {connection && (
                  <div className="connection">
                    <LoaderCircle className="spin" size={16} /> {connection} —
                    tentando reconectar.
                  </div>
                )}
                {room.status === "lobby" && (
                  <>
                    <div className="game-heading">
                      <span className="eyebrow">
                        A BOA CONFUSÃO COMEÇA AQUI
                      </span>
                      <h1>
                        A turma está chegando<span>…</span>
                      </h1>
                      <p>
                        Compartilhe o convite, escolha o ritmo e deixe a
                        imaginação entrar.
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
                              <Avatar name={p.name} i={i} avatar={p.avatar} />
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
                          {copied
                            ? "Convite copiado!"
                            : "Copiar link de convite"}
                        </button>
                      </div>
                      <div className="panel settings">
                        <h2>Do seu jeito</h2>
                        <label>
                          Modo de jogo
                          <select
                            aria-label="Modo de jogo"
                            value={gameMode}
                            disabled={busy || room.me !== room.hostId}
                            onChange={(e) => {
                              const next = e.target.value as GameMode;
                              const nextSeconds =
                                next === "phoneguess" ? 90 : next === "lightning"
                                  ? 30
                                  : gameMode === "lightning"
                                    ? 90
                                    : seconds;
                              setGameMode(next);
                              setSeconds(nextSeconds);
                              action("configure", {
                                mode: next,
                                seconds: nextSeconds,
                                ending,
                                autoSendDrawings,
                              });
                            }}
                          >
                            <option value="phoneguess">PhoneAdivinha</option>
                            <option value="classic">Clássico</option>
                            <option value="chaos">Caos Criativo</option>
                            <option value="lightning">
                              Relâmpago · ritmo rápido
                            </option>
                          </select>
                        </label>
                        <p className="mode-description">
                          {gameMode === "phoneguess" ? "Uma pessoa desenha, todos tentam acertar. 90 segundos, pontos por velocidade e uma vez para cada desenhista." : gameMode === "chaos"
                            ? "Comece com um desenho livre. Receba o anterior como base e acrescente algo inesperado a cada rodada. Só desenhos, até o fim!"
                            : gameMode === "lightning"
                              ? "Frases e desenhos como no Clássico, com rodadas rápidas de 15 a 60 segundos."
                              : "Uma frase original vira desenho, depois adivinhação. Cada um vê apenas a etapa anterior."}
                        </p>
                        <label>
                          Tempo por rodada
                          <select
                            aria-label="Tempo por rodada"
                            value={seconds}
                            disabled={busy || room.me !== room.hostId}
                            onChange={(e) => {
                              setSeconds(+e.target.value);
                              action("configure", {
                                mode: gameMode,
                                seconds: +e.target.value,
                                ending,
                              });
                            }}
                          >
                            {timeOptionsFor(gameMode).map((value) => (
                              <option key={value} value={value}>
                                {timeLabel(value)}
                              </option>
                            ))}
                          </select>
                        </label>
                        {gameMode !== "phoneguess" && <>
                        <label>
                          Como a história termina?
                          <select
                            value={gameMode === "chaos" ? "drawing" : ending}
                            disabled={
                              busy ||
                              room.me !== room.hostId ||
                              gameMode === "chaos"
                            }
                            onChange={(e) => {
                              setEnding(e.target.value);
                              action("configure", {
                                mode: gameMode,
                                seconds,
                                ending: e.target.value,
                              });
                            }}
                          >
                            <option value="auto">Uma volta completa</option>
                            <option value="phrase">Com uma adivinhação</option>
                            <option value="drawing">Com um desenho</option>
                          </select>
                        </label>
                        <label className="auto-send-option">
                          <input
                            type="checkbox"
                            checked={autoSendDrawings}
                            disabled={busy || room.me !== room.hostId}
                            onChange={(e) => {
                              setAutoSendDrawings(e.target.checked);
                              action("configure", {
                                mode: gameMode,
                                seconds,
                                ending,
                                autoSendDrawings: e.target.checked,
                              });
                            }}
                          />
                          <span>
                            Enviar desenho ao acabar o tempo
                            <small>
                              Envia a tela como estiver, mesmo sem finalizar.
                            </small>
                          </span>
                        </label>
                        </>}
                        <p className="settings-note">
                          {gameMode === "phoneguess" ? "Uma pessoa desenha, todos tentam acertar. 90 segundos, pontos por velocidade e uma vez para cada desenhista." : gameMode === "chaos"
                            ? "Todos criam o desenho inicial. Nas próximas rodadas, reinterpretam o desenho recebido acrescentando um novo elemento. Todos participam de cada álbum."
                            : "Cada um inventa só a primeira frase. Depois, é desenhar e adivinhar até todos participarem de cada álbum. O final escolhido pode acrescentar uma rodada."}
                        </p>
                        <button
                          className="primary wide"
                          disabled={
                            busy ||
                            room.players.length < 2 ||
                            room.me !== room.hostId
                          }
                          onClick={() =>
                            action("start", {
                              seconds,
                              ending,
                              mode: gameMode,
                              autoSendDrawings,
                            })
                          }
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
                {room.mode === "phoneguess" && room.status !== "lobby" && <PhoneGuess room={room} remaining={remaining} serverOffset={offset} busy={busy} action={action} live={async (value) => {
                  const session = current.current;
                  if (!session) return false;
                  try {
                    const res = await fetch("/api/rooms", { method: "POST", headers: {"Content-Type":"application/json", "x-player-token": session.token}, body: JSON.stringify({action:"liveDrawing",code:session.code,round:room.round,value}) });
                    return res.ok;
                  } catch { return false; }
                }} />}
                {room.status === "playing" && room.mode !== "phoneguess" && (
                  <>
                    <div className="round-bar">
                      <span>
                        RODADA <b>{room.round + 1}</b> / {room.totalRounds}
                      </span>
                      <span
                        className={remaining < 16 ? "timer urgent" : "timer"}
                      >
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
                          <br />A próxima rodada começa quando todos enviarem ou
                          o tempo acabar.
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
                            {room.mode === "chaos"
                              ? "CAOS CRIATIVO"
                              : room.round === 0
                                ? "ONDE TUDO COMEÇA"
                                : room.round % 2
                                  ? "AGORA É COM SEU PINCEL"
                                  : "O QUE VOCÊ ESTÁ VENDO?"}
                          </span>
                          <h1>
                            {room.mode === "chaos"
                              ? room.round === 0
                                ? "Todo caos começa com um desenho."
                                : "Acrescente uma surpresa à história."
                              : room.round === 0
                                ? "Uma frase. Infinitas possibilidades."
                                : room.round % 2
                                  ? "Dê forma a essa ideia."
                                  : "Que história esse desenho conta?"}
                          </h1>
                          <p>
                            {room.mode === "chaos"
                              ? room.round === 0
                                ? "Desenhe uma ideia livre. Ela vai se transformar nas mãos dos outros jogadores."
                                : "O desenho anterior já está na sua tela. Reinterprete-o e acrescente um elemento inesperado!"
                              : room.round === 0
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
                                alt={
                                  room.mode === "chaos"
                                    ? "Desenho anterior para reinterpretar"
                                    : "Desenho do jogador anterior para você adivinhar"
                                }
                              />
                            ) : (
                              <div className="empty-drawing">
                                <Paintbrush size={32} />
                                <p>
                                  O desenho anterior ficou em branco. Imagine o
                                  que poderia ser!
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                        {room.taskKind === "drawing" ? (
                          <Drawing
                            key={`${room.code}-${room.round}`}
                            busy={busy}
                            timeLeft={remaining}
                            autoSend={room.autoSendDrawings}
                            reference={
                              room.previous?.kind === "phrase"
                                ? room.previous.value
                                : room.mode === "chaos"
                                  ? "Reinterprete e acrescente um elemento inesperado."
                                  : undefined
                            }
                            initialImage={
                              room.mode === "chaos"
                                ? room.previous?.value || undefined
                                : undefined
                            }
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
                              maxLength={100}
                              value={phrase}
                              onChange={(e) =>
                                setPhrase(
                                  Array.from(e.target.value)
                                    .slice(0, 50)
                                    .join(""),
                                )
                              }
                              placeholder={
                                room.round === 0
                                  ? "Um elefante bebendo água na lua…"
                                  : "Eu acho que é…"
                              }
                              autoFocus
                            />
                            <div className="phrase-footer">
                              <span>{Array.from(phrase).length}/50</span>
                              <button
                                className="primary"
                                disabled={
                                  busy ||
                                  !phrase.trim() ||
                                  Array.from(phrase.trim()).length > 50
                                }
                              >
                                {busy ? (
                                  <LoaderCircle className="spin" size={18} />
                                ) : (
                                  <Check size={18} />
                                )}
                                Enviar{" "}
                                {room.round === 0 ? "frase" : "adivinhação"}
                              </button>
                            </div>
                          </form>
                        )}
                      </>
                    )}
                  </>
                )}
                {room.status === "finished" && room.mode !== "phoneguess" && room.albums && (
                  <>
                    <div className="game-heading">
                      <span className="eyebrow">
                        <Sparkles size={14} /> HORA DA REVELAÇÃO
                      </span>
                      <h1>Como foi que chegamos aqui?</h1>
                      <p>
                        {room.me === room.hostId
                          ? "Você conduz a apresentação. Revele cada transformação para toda a turma."
                          : "O anfitrião está conduzindo a apresentação. Veja cada transformação junto com a turma."}
                      </p>
                    </div>
                    <div
                      className="album-tabs"
                      aria-label="Álbuns da apresentação"
                    >
                      {room.players.map((p, i) => (
                        <span
                          key={p.id}
                          className={`album-tab ${album === i ? "selected" : ""}`}
                          aria-current={album === i ? "step" : undefined}
                        >
                          <Avatar name={p.name} avatar={p.avatar} small />
                          {p.name}
                        </span>
                      ))}
                    </div>
                    <div className="album-title">
                      <h2>O álbum de {room.players[album]?.name}</h2>
                      <span>
                        Etapa {room.revealStep + 1} de {room.totalRounds} ·
                        álbum {album + 1} de {room.players.length}
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
                                avatar={room.players[index]?.avatar}
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
                                {entry.timedOut && (
                                  <small>tempo esgotado</small>
                                )}
                              </div>
                              {entry.kind === "phrase" ? (
                                <p className="revealed-phrase">
                                  “{entry.value}”
                                </p>
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
                    <div className="pdf-export">
                      <button
                        className="secondary"
                        disabled={exporting || !room.canExport}
                        onClick={downloadPdf}
                      >
                        {exporting ? (
                          <LoaderCircle className="spin" size={17} />
                        ) : (
                          <Download size={17} />
                        )}{" "}
                        {exporting
                          ? exportProgress
                          : "Salvar sequência completa em PDF"}
                      </button>
                      <small>
                        {room.canExport
                          ? "Todos os álbuns, desenhos, frases e autores, na ordem das rodadas."
                          : "O PDF será liberado para todos ao final da apresentação."}
                      </small>
                    </div>
                    <div className="reveal-actions">
                      {room.me === room.hostId ? (
                        <>
                          <button
                            className="secondary"
                            disabled={busy || room.revealCursor === 0}
                            onClick={() =>
                              action("reveal", {
                                direction: "previous",
                                cursor: room.revealCursor,
                              })
                            }
                          >
                            <ChevronLeft size={17} />
                            Voltar etapa
                          </button>
                          {!room.revealComplete ? (
                            <button
                              className="primary"
                              disabled={busy}
                              onClick={() =>
                                action("reveal", {
                                  direction: "next",
                                  cursor: room.revealCursor,
                                })
                              }
                            >
                              {room.revealStep === room.totalRounds - 1
                                ? "Próximo álbum"
                                : "Revelar próxima etapa"}
                              <ChevronRight size={17} />
                            </button>
                          ) : (
                            <button
                              className="primary"
                              disabled={busy || exporting}
                              onClick={() => action("reset")}
                            >
                              <RotateCcw size={17} />
                              Jogar outra vez
                            </button>
                          )}
                        </>
                      ) : (
                        <p className="host-presentation-note">
                          <Clock3 size={16} />
                          {room.revealComplete
                            ? "Apresentação concluída. O anfitrião pode iniciar outra partida."
                            : "Aguarde o anfitrião revelar a próxima etapa."}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
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
      {editingCharacter && (
        <CharacterEditor
          initial={
            room?.players.find((p) => p.id === room.me)?.avatar ?? character
          }
          onSave={saveCharacter}
          onClose={closeCharacterEditor}
        />
      )}
      <footer>
        <span className="footer-brand">
          PhoneArt <span>✦</span>
        </span>
        <span>Um desenho de cada vez.</span>
        <span className="footer-love">
          Jogue com os amigos <Heart size={13} />
        </span>
      </footer>
    </>
  );
}
