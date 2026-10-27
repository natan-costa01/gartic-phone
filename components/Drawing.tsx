"use client";
import { useEffect, useRef, useState } from "react";
import {
  Check,
  Eraser,
  LoaderCircle,
  PaintBucket,
  Paintbrush,
  RotateCcw,
  Trash2,
} from "lucide-react";
import {
  drawShape,
  floodFill,
  shapes,
  type Point,
  type Shape,
  type Tool,
} from "@/lib/drawing";
const colors = [
  "#27243a",
  "#66616f",
  "#ffffff",
  "#c6c3ce",
  "#8b5cf6",
  "#4d39a8",
  "#ef6a93",
  "#e23a42",
  "#f47b32",
  "#f4ad45",
  "#f5d96c",
  "#9bcb56",
  "#32a765",
  "#64bb95",
  "#61a8dd",
  "#2465b5",
];
export default function Drawing({
  onSubmit,
  busy,
  initialImage,
}: {
  onSubmit: (value: string) => void;
  busy: boolean;
  initialImage?: string;
}) {
  const canvas = useRef<HTMLCanvasElement>(null),
    history = useRef<{ image: ImageData; dirty: boolean }[]>([]),
    pointer = useRef<number | null>(null),
    start = useRef<Point | null>(null),
    last = useRef<Point | null>(null),
    base = useRef<ImageData | null>(null);
  const [color, setColor] = useState(colors[0]),
    [size, setSize] = useState(5),
    [tool, setTool] = useState<Tool>("brush"),
    [fill, setFill] = useState(false),
    [stroke, setStroke] = useState(true),
    [dirty, setDirty] = useState(false),
    [ready, setReady] = useState(false),
    [error, setError] = useState(""),
    [undos, setUndos] = useState(0);
  useEffect(() => {
    let cancelled = false;
    const c = canvas.current!,
      ctx = c.getContext("2d", { willReadFrequently: true })!;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, c.width, c.height);
    setReady(false);
    setDirty(false);
    history.current = [];
    setUndos(0);
    if (initialImage) {
      const image = new Image();
      image.onload = () => {
        if (!cancelled) {
          ctx.drawImage(image, 0, 0, c.width, c.height);
          setReady(true);
        }
      };
      image.onerror = () => {
        if (!cancelled) {
          setError(
            "Não foi possível carregar o desenho anterior. Tente recarregar a página.",
          );
        }
      };
      image.src = initialImage;
    } else setReady(true);
    return () => {
      cancelled = true;
    };
  }, [initialImage]);
  const ctx = () => canvas.current!.getContext("2d")!;
  function remember() {
    const c = canvas.current!;
    history.current.push({
      image: ctx().getImageData(0, 0, c.width, c.height),
      dirty,
    });
    if (history.current.length > 15) history.current.shift();
    setUndos(history.current.length);
  }
  function point(e: React.PointerEvent<HTMLCanvasElement>) {
    const c = canvas.current!,
      r = c.getBoundingClientRect();
    return {
      x: Math.max(
        0,
        Math.min(c.width - 1, ((e.clientX - r.left) * c.width) / r.width),
      ),
      y: Math.max(
        0,
        Math.min(c.height - 1, ((e.clientY - r.top) * c.height) / r.height),
      ),
    };
  }
  function brush(p: Point, dot = false) {
    const context = ctx(),
      from = last.current ?? p;
    context.strokeStyle = tool === "eraser" ? "#fff" : color;
    context.fillStyle = context.strokeStyle;
    context.lineWidth = tool === "eraser" ? size * 4 : size;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.beginPath();
    context.moveTo(from.x, from.y);
    context.lineTo(p.x, p.y);
    context.stroke();
    if (dot) {
      context.beginPath();
      context.arc(p.x, p.y, context.lineWidth / 2, 0, Math.PI * 2);
      context.fill();
    }
    last.current = p;
  }
  function begin(e: React.PointerEvent<HTMLCanvasElement>) {
    if (busy || !ready || pointer.current !== null) return;
    const p = point(e);
    remember();
    if (tool === "bucket") {
      const c = canvas.current!,
        image = ctx().getImageData(0, 0, c.width, c.height);
      if (floodFill(image.data, c.width, c.height, p.x, p.y, color)) {
        ctx().putImageData(image, 0, 0);
        setDirty(true);
      } else {
        history.current.pop();
        setUndos(history.current.length);
      }
      return;
    }
    pointer.current = e.pointerId;
    e.currentTarget.setPointerCapture(e.pointerId);
    start.current = p;
    last.current = p;
    base.current = history.current.at(-1)!.image;
    if (tool === "brush" || tool === "eraser") {
      brush(p, true);
      setDirty(true);
    }
  }
  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (pointer.current !== e.pointerId || !start.current || busy) return;
    const p = point(e);
    if (tool === "brush" || tool === "eraser") brush(p);
    else {
      ctx().putImageData(base.current!, 0, 0);
      drawShape(
        ctx(),
        tool as Shape,
        start.current,
        p,
        color,
        size,
        fill,
        stroke,
      );
    }
    setDirty(true);
  }
  function end(e: React.PointerEvent<HTMLCanvasElement>) {
    if (pointer.current !== e.pointerId) return;
    move(e);
    pointer.current = null;
    start.current = null;
    last.current = null;
    base.current = null;
  }
  function cancel(e: React.PointerEvent<HTMLCanvasElement>) {
    if (pointer.current !== e.pointerId) return;
    if (base.current) ctx().putImageData(base.current, 0, 0);
    const previous = history.current.pop();
    if (previous) setDirty(previous.dirty);
    setUndos(history.current.length);
    pointer.current = null;
    start.current = null;
    base.current = null;
  }
  function undo() {
    if (pointer.current !== null) return;
    const previous = history.current.pop();
    if (previous) {
      ctx().putImageData(previous.image, 0, 0);
      setDirty(previous.dirty);
      setUndos(history.current.length);
    }
  }
  function send() {
    let value = "";
    for (const quality of [0.8, 0.65, 0.45, 0.25]) {
      value = canvas.current!.toDataURL("image/webp", quality);
      if (value.length <= 180000) break;
    }
    if (value.length > 180000) {
      setError(
        "O desenho está muito detalhado para enviar. Desfaça alguns traços.",
      );
      return;
    }
    onSubmit(value);
  }
  const shapeTool = tool !== "brush" && tool !== "eraser" && tool !== "bucket";
  return (
    <div className="drawing-area">
      <div className="canvas-wrap">
        <canvas
          ref={canvas}
          width={900}
          height={560}
          aria-label="Área de desenho. Use o mouse ou toque para desenhar."
          onPointerDown={begin}
          onPointerMove={move}
          onPointerUp={end}
          onPointerCancel={cancel}
          onLostPointerCapture={(e) => {
            if (pointer.current === e.pointerId) cancel(e);
          }}
        />
      </div>
      <fieldset className="drawing-controls" disabled={busy || !ready}>
        <legend className="sr-only">Ferramentas de desenho</legend>
        <div className="tools drawing-toolbar">
          <div className="swatches">
            {colors.map((c) => (
              <button
                key={c}
                type="button"
                className={`swatch ${color === c ? "selected" : ""}`}
                style={{ background: c }}
                aria-label={`Cor ${c}`}
                aria-pressed={color === c}
                onClick={() => setColor(c)}
              />
            ))}
            <label className="custom-color" title="Cor personalizada">
              <span className="sr-only">Cor personalizada</span>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                aria-label="Cor personalizada"
              />
            </label>
          </div>
          <div className="drawing-actions">
            {(
              [
                { id: "brush", label: "Pincel", Icon: Paintbrush },
                { id: "eraser", label: "Borracha", Icon: Eraser },
                { id: "bucket", label: "Balde de tinta", Icon: PaintBucket },
              ] as const
            ).map(({ id, label, Icon }) => (
              <button
                type="button"
                key={id}
                className={`icon-button ${tool === id ? "active" : ""}`}
                aria-label={label}
                title={label}
                aria-pressed={tool === id}
                onClick={() => setTool(id)}
              >
                <Icon size={19} />
              </button>
            ))}
            <select
              aria-label="Forma geométrica"
              value={shapeTool ? tool : ""}
              onChange={(e) =>
                e.target.value && setTool(e.target.value as Shape)
              }
            >
              <option value="" disabled>
                Formas
              </option>
              {Object.entries(shapes).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <label className="brush-size">
              Traço
              <input
                aria-label="Espessura do pincel"
                type="range"
                min={2}
                max={24}
                value={size}
                onChange={(e) => setSize(+e.target.value)}
              />
            </label>
            <button
              className="icon-button"
              type="button"
              title="Desfazer"
              aria-label="Desfazer"
              disabled={!undos}
              onClick={undo}
            >
              <RotateCcw size={18} />
            </button>
            <button
              className="icon-button"
              type="button"
              aria-label="Limpar desenho"
              title="Limpar desenho"
              onClick={() => {
                remember();
                ctx().fillStyle = "#fff";
                ctx().fillRect(0, 0, 900, 560);
                setDirty(true);
              }}
            >
              <Trash2 size={18} />
            </button>
          </div>
          {shapeTool && tool !== "line" && (
            <div className="shape-options">
              <label>
                <input
                  type="checkbox"
                  checked={stroke}
                  onChange={(e) => {
                    setStroke(e.target.checked);
                    if (!e.target.checked) setFill(true);
                  }}
                />{" "}
                Contorno
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={fill}
                  onChange={(e) => {
                    setFill(e.target.checked);
                    if (!e.target.checked) setStroke(true);
                  }}
                />{" "}
                Preenchimento
              </label>
              <span>Arraste na tela para criar a forma.</span>
            </div>
          )}
        </div>
      </fieldset>
      {!ready && !error && (
        <p className="empty-drawing">Carregando desenho anterior…</p>
      )}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <button
        className="primary submit"
        disabled={!dirty || busy || !ready}
        onClick={send}
      >
        {busy ? (
          <LoaderCircle className="spin" size={18} />
        ) : (
          <Check size={18} />
        )}
        Enviar desenho
      </button>
    </div>
  );
}
