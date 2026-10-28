"use client";
import { useEffect, useRef, useState } from "react";
import { Check, Shuffle, X } from "lucide-react";
import {
  CHARACTER_COLORS,
  PORTRAITS,
  CHARACTER_PRESETS,
  type Character,
} from "@/lib/characters";
import CharacterAvatar from "./CharacterAvatar";
export default function CharacterEditor({
  initial,
  onSave,
  onClose,
}: {
  initial: Character;
  onSave: (value: Character) => Promise<boolean>;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(initial),
    [saving, setSaving] = useState(false),
    [error, setError] = useState("");
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null,
      overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.focus();
    function key(e: KeyboardEvent) {
      if (e.key === "Escape" && !saving) onClose();
      if (e.key === "Tab") {
        const nodes = Array.from(
          panel.current?.querySelectorAll<HTMLElement>(
            "button:not(:disabled),select:not(:disabled),input:not(:disabled)",
          ) ?? [],
        );
        if (
          e.shiftKey &&
          (document.activeElement === nodes[0] ||
            document.activeElement === panel.current)
        ) {
          e.preventDefault();
          nodes.at(-1)?.focus();
        } else if (!e.shiftKey && document.activeElement === nodes.at(-1)) {
          e.preventDefault();
          nodes[0]?.focus();
        }
      }
    }
    document.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", key);
      previous?.focus();
    };
  }, [onClose, saving]);
  return (
    <div className="character-backdrop">
      <div
        className="character-editor"
        role="dialog"
        aria-modal="true"
        aria-labelledby="character-title"
        tabIndex={-1}
        ref={panel}
      >
        <div className="character-editor-top">
          <span className="eyebrow">Seu avatar</span>
          <button
            className="icon-button"
            onClick={onClose}
            disabled={saving}
            aria-label="Fechar editor de personagem"
          >
            <X size={19} />
          </button>
        </div>
        <h2 id="character-title">Escolha quem vai jogar.</h2>
        <div className="character-customize">
          <div className="character-preview">
            <CharacterAvatar character={draft} size={168} />
            <strong>
              {CHARACTER_PRESETS.find(([key]) => key === draft.animal)?.[1]}
            </strong>
            <button
              className="secondary"
              disabled={saving}
              onClick={() =>
                setDraft({
                  ...draft,
                  animal:
                    PORTRAITS[Math.floor(Math.random() * PORTRAITS.length)][0],
                  color:
                    CHARACTER_COLORS[
                      Math.floor(Math.random() * CHARACTER_COLORS.length)
                    ],
                })
              }
            >
              <Shuffle size={15} />
              Escolher por mim
            </button>
          </div>
          <div className="character-options">
            <span className="field-caption">
              {PORTRAITS.length} personagens para escolher
            </span>
            <div className="character-grid">
              {PORTRAITS.map(([animal, label]) => (
                <button
                  key={animal}
                  disabled={saving}
                  className={draft.animal === animal ? "selected" : ""}
                  aria-label={label}
                  aria-pressed={draft.animal === animal}
                  title={label}
                  onClick={() => setDraft({ ...draft, animal })}
                >
                  <CharacterAvatar
                    character={{
                      ...draft,
                      animal,
                    }}
                    size={54}
                  />
                  <span>{label}</span>
                </button>
              ))}
            </div>
            <span className="field-caption">Cor do fundo</span>
            <div className="character-colors">
              {CHARACTER_COLORS.map((color) => (
                <button
                  key={color}
                  disabled={saving}
                  style={{ background: color }}
                  aria-label={`Cor do personagem ${color}`}
                  aria-pressed={draft.color === color}
                  className={draft.color === color ? "selected" : ""}
                  onClick={() => setDraft({ ...draft, color })}
                />
              ))}
            </div>
          </div>
        </div>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <div className="character-editor-footer">
          <button className="secondary" disabled={saving} onClick={onClose}>
            Cancelar
          </button>
          <button
            className="primary"
            disabled={saving}
            onClick={async () => {
              setSaving(true);
              try {
                if (await onSave(draft)) onClose();
                else setError("Não foi possível salvar. Tente novamente.");
              } catch {
                setError("Não foi possível salvar. Tente novamente.");
              } finally {
                setSaving(false);
              }
            }}
          >
            <Check size={17} />
            {saving ? "Salvando…" : "Salvar personagem"}
          </button>
        </div>
      </div>
    </div>
  );
}
