import { test } from "node:test";
import assert from "node:assert/strict";
import { floodFill, polygonPoints, drawShape, shapes } from "../lib/drawing";
test("bucket fills only its connected region, handles same color and boundaries", () => {
  const pixels = new Uint8ClampedArray(5 * 5 * 4).fill(255);
  for (let y = 0; y < 5; y++) pixels.set([0, 0, 0, 255], (y * 5 + 2) * 4);
  const before = pixels.slice();
  assert.equal(floodFill(pixels, 5, 5, 0, 0, "#ff0000"), true);
  for (let y = 0; y < 5; y++) {
    assert.deepEqual(
      [...pixels.slice(y * 5 * 4, y * 5 * 4 + 4)],
      [255, 0, 0, 255],
    );
    assert.deepEqual(
      [...pixels.slice((y * 5 + 3) * 4, (y * 5 + 3) * 4 + 4)],
      [255, 255, 255, 255],
    );
  }
  assert.deepEqual([...pixels.slice(8, 12)], [0, 0, 0, 255]);
  assert.equal(floodFill(pixels, 5, 5, 0, 0, "#ff0000"), false);
  assert.equal(floodFill(pixels, 5, 5, -1, 0, "#ffffff"), false);
  pixels.set(before);
  assert.deepEqual(pixels, before);
});
test("bucket handles a full canvas iteratively without recursion overflow", () => {
  const data = new Uint8ClampedArray(900 * 560 * 4).fill(255);
  assert.ok(floodFill(data, 900, 560, 450, 280, "#123456"));
  assert.deepEqual([...data.slice(-4)], [18, 52, 86, 255]);
});
test("polygons have requested vertex counts within reversed-drag bounds", () => {
  for (const [shape, n] of [
    ["triangle", 3],
    ["pentagon", 5],
    ["hexagon", 6],
    ["star", 10],
  ] as const) {
    const points = polygonPoints(shape, { x: 100, y: 100 }, { x: 10, y: 20 });
    assert.equal(points.length, n);
    assert.ok(
      points.every((p) => p.x >= 10 && p.x <= 100 && p.y >= 20 && p.y <= 100),
    );
  }
});
test("all ten shapes support outline, fill and reverse dragging", () => {
  for (const shape of Object.keys(shapes) as (keyof typeof shapes)[]) {
    const calls: string[] = [];
    const ctx = new Proxy({} as CanvasRenderingContext2D, {
      get: (_, name) => () => calls.push(String(name)),
      set: () => true,
    });
    drawShape(
      ctx,
      shape,
      { x: 90, y: 90 },
      { x: 10, y: 20 },
      "#123456",
      5,
      true,
      true,
    );
    assert.ok(calls.includes("stroke"));
    if (shape !== "line") assert.ok(calls.includes("fill"));
  }
});
