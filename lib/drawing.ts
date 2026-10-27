export type Point = { x: number; y: number };
export const shapes = {
  line: "Linha",
  circle: "Círculo",
  ellipse: "Elipse",
  square: "Quadrado",
  rectangle: "Retângulo",
  triangle: "Triângulo",
  pentagon: "Pentágono",
  hexagon: "Hexágono",
  star: "Estrela",
  arrow: "Seta",
} as const;
export type Shape = keyof typeof shapes;
export type Tool = "brush" | "eraser" | "bucket" | Shape;
export function floodFill(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  x: number,
  y: number,
  hex: string,
) {
  x = Math.floor(x);
  y = Math.floor(y);
  if (x < 0 || y < 0 || x >= width || y >= height) return false;
  const start = y * width + x,
    offset = start * 4;
  const target = Array.from(data.slice(offset, offset + 4));
  const fill = [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
    255,
  ];
  if (target.every((v, i) => v === fill[i])) return false;
  const visited = new Uint8Array(width * height),
    stack = new Int32Array(width * height);
  let count = 1;
  stack[0] = start;
  visited[start] = 1;
  function add(index: number) {
    if (visited[index]) return;
    visited[index] = 1;
    const p = index * 4;
    if (target.every((v, i) => Math.abs(data[p + i] - v) <= 24))
      stack[count++] = index;
  }
  while (count) {
    const index = stack[--count],
      p = index * 4;
    data.set(fill, p);
    const px = index % width;
    if (px > 0) add(index - 1);
    if (px < width - 1) add(index + 1);
    if (index >= width) add(index - width);
    if (index < width * (height - 1)) add(index + width);
  }
  return true;
}
export function polygonPoints(
  shape: "triangle" | "pentagon" | "hexagon" | "star",
  a: Point,
  b: Point,
): Point[] {
  const cx = (a.x + b.x) / 2,
    cy = (a.y + b.y) / 2,
    rx = Math.abs(b.x - a.x) / 2,
    ry = Math.abs(b.y - a.y) / 2;
  const n =
    shape === "triangle"
      ? 3
      : shape === "pentagon"
        ? 5
        : shape === "hexagon"
          ? 6
          : 10;
  return Array.from({ length: n }, (_, i) => {
    const angle = -Math.PI / 2 + (i * Math.PI * 2) / n,
      scale = shape === "star" && i % 2 ? 0.43 : 1;
    return {
      x: cx + Math.cos(angle) * rx * scale,
      y: cy + Math.sin(angle) * ry * scale,
    };
  });
}
export function drawShape(
  ctx: CanvasRenderingContext2D,
  shape: Shape,
  start: Point,
  end: Point,
  color: string,
  size: number,
  fill: boolean,
  stroke: boolean,
) {
  let a = { ...start },
    b = { ...end };
  if (shape === "square" || shape === "circle") {
    const side = Math.min(Math.abs(b.x - a.x), Math.abs(b.y - a.y));
    b = {
      x: a.x + Math.sign(b.x - a.x) * side,
      y: a.y + Math.sign(b.y - a.y) * side,
    };
  }
  ctx.lineWidth = size;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.beginPath();
  if (shape === "line") {
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    return;
  }
  if (shape === "arrow") {
    const dx = b.x - a.x,
      dy = b.y - a.y,
      len = Math.hypot(dx, dy);
    if (len < 1) return;
    const ux = dx / len,
      uy = dy / len,
      head = Math.min(len * 0.4, Math.max(18, size * 4)),
      half = Math.max(size / 2, 3);
    const vertices = [
      { x: a.x - uy * half, y: a.y + ux * half },
      { x: b.x - ux * head - uy * half, y: b.y - uy * head + ux * half },
      {
        x: b.x - ux * head - uy * head * 0.6,
        y: b.y - uy * head + ux * head * 0.6,
      },
      b,
      {
        x: b.x - ux * head + uy * head * 0.6,
        y: b.y - uy * head - ux * head * 0.6,
      },
      { x: b.x - ux * head + uy * half, y: b.y - uy * head - ux * half },
      { x: a.x + uy * half, y: a.y - ux * half },
    ];
    vertices.forEach((p, i) =>
      i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y),
    );
    ctx.closePath();
  } else if (shape === "circle" || shape === "ellipse")
    ctx.ellipse(
      (a.x + b.x) / 2,
      (a.y + b.y) / 2,
      Math.abs(b.x - a.x) / 2,
      Math.abs(b.y - a.y) / 2,
      0,
      0,
      Math.PI * 2,
    );
  else if (shape === "rectangle" || shape === "square")
    ctx.rect(a.x, a.y, b.x - a.x, b.y - a.y);
  else {
    polygonPoints(shape, a, b).forEach((p, i) =>
      i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y),
    );
    ctx.closePath();
  }
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}
