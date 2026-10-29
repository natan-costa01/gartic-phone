"use client";
import { Check, Clock3, Crown, Pencil, Users } from "lucide-react";
import type { RoomView } from "@/lib/game";
import CharacterAvatar from "./CharacterAvatar";
export default function Participants({
  room,
  onEdit,
}: {
  room: RoomView;
  onEdit: () => void;
}) {
  return (
    <aside className="participants-sidebar" aria-label="Participantes da sala">
      <div className="participants-heading">
        <Users size={16} />
        <h2>Jogadores</h2>
        <span>{room.players.length}/20</span>
      </div>
      <ul>
        {room.players.map((p) => (
          <li
            key={p.id}
            className={`${p.id === room.me ? "is-me " : ""}${room.status === "finished" && room.players[room.revealedAlbum]?.id === p.id ? "presenting" : ""}`}
          >
            <CharacterAvatar character={p.avatar} size={46} />
            <div>
              <strong>
                {p.name}
                {p.id === room.hostId && (
                  <Crown size={12} aria-label="Anfitrião" />
                )}
              </strong>
              <small>
                {p.id === room.me ? "Você · " : ""}
                {room.mode === "phoneguess" && room.status !== "lobby" ? `${room.guess?.scores[p.id] ?? 0} pontos · ${room.guess?.drawerId === p.id ? "Desenhista" : room.guess?.solved.includes(p.id) ? "Acertou" : "Adivinhando"}` : room.status === "lobby"
                  ? "Na sala"
                  : room.status === "finished"
                    ? room.players[room.revealedAlbum]?.id === p.id
                      ? "Álbum em exibição"
                      : "Na revelação"
                    : p.submitted
                      ? "Enviou"
                      : room.taskKind === "drawing"
                        ? "Desenhando"
                        : "Escrevendo"}
              </small>
            </div>
            {room.status === "playing" &&
              (p.submitted ? (
                <Check className="participant-ready" size={15} />
              ) : (
                <Clock3 className="participant-working" size={13} />
              ))}
          </li>
        ))}
      </ul>
      <button className="secondary wide" onClick={onEdit}>
        <Pencil size={14} />
        Editar personagem
      </button>
      <p className="sidebar-note">
        {room.status === "finished"
          ? "O anfitrião conduz a revelação para todos."
          : "Cada ideia tem seu lugar nessa turma."}
      </p>
    </aside>
  );
}
