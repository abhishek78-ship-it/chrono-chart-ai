// visualization-service.ts
// Canvas-based chart renderer for downloadable PNG analysis charts.
// Draws with a Matplotlib-like aesthetic (light gridlines, axes, titles).
// Returns HTMLCanvasElement so components can display and export as PNG.

export type ChartKind = "histogram" | "scatter" | "line" | "bar" | "pie" | "box";

interface BaseOpts {
  title?: string;
  width?: number;
  height?: number;
  xLabel?: string;
  yLabel?: string;
  color?: string;
}

const DEFAULT_W = 720;
const DEFAULT_H = 420;
const PALETTE = ["#4F8CFF", "#00D4FF", "#7B61FF", "#22D3EE", "#A78BFA", "#60A5FA", "#F472B6", "#34D399"];
const BG = "#0B1020";
const FG = "#E6ECFF";
const MUTED = "#8A93B0";
const GRID = "rgba(255,255,255,0.08)";

function createCanvas(w: number, h: number): { c: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const c = document.createElement("canvas");
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  c.width = w * dpr;
  c.height = h * dpr;
  c.style.width = `${w}px`;
  c.style.height = `${h}px`;
  const ctx = c.getContext("2d")!;
  ctx.scale(dpr, dpr);
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, w, h);
  return { c, ctx };
}

interface Frame {
  x: number;
  y: number;
  w: number;
  h: number;
}

function drawFrame(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  title: string | undefined,
  xLabel: string | undefined,
  yLabel: string | undefined,
): Frame {
  const padL = yLabel ? 64 : 48;
  const padR = 24;
  const padT = title ? 44 : 20;
  const padB = xLabel ? 56 : 40;
  const frame: Frame = { x: padL, y: padT, w: W - padL - padR, h: H - padT - padB };

  if (title) {
    ctx.fillStyle = FG;
    ctx.font = "bold 16px 'Space Grotesk', system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(title, padL, 26);
  }
  ctx.strokeStyle = GRID;
  ctx.lineWidth = 1;
  ctx.strokeRect(frame.x + 0.5, frame.y + 0.5, frame.w, frame.h);

  if (xLabel) {
    ctx.fillStyle = MUTED;
    ctx.font = "12px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(xLabel, frame.x + frame.w / 2, H - 16);
  }
  if (yLabel) {
    ctx.save();
    ctx.translate(18, frame.y + frame.h / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = MUTED;
    ctx.font = "12px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(yLabel, 0, 0);
    ctx.restore();
  }
  return frame;
}

function niceTicks(min: number, max: number, count = 5): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) {
    return [min];
  }
  const step = (max - min) / count;
  const mag = Math.pow(10, Math.floor(Math.log10(step)));
  const norm = step / mag;
  const nice = norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10;
  const s = nice * mag;
  const start = Math.floor(min / s) * s;
  const ticks: number[] = [];
  for (let v = start; v <= max + 1e-9; v += s) ticks.push(Number(v.toFixed(6)));
  return ticks;
}

function fmt(n: number): string {
  if (!Number.isFinite(n)) return "—";
  if (Math.abs(n) >= 1000) return n.toLocaleString(undefined, { maximumFractionDigits: 1 });
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(2);
}

function drawAxes(
  ctx: CanvasRenderingContext2D,
  f: Frame,
  xTicks: { pos: number; label: string }[],
  yTicks: { pos: number; label: string }[],
) {
  ctx.font = "10px 'Plus Jakarta Sans', system-ui, sans-serif";
  ctx.fillStyle = MUTED;
  ctx.strokeStyle = GRID;

  for (const t of yTicks) {
    const y = f.y + f.h - t.pos * f.h;
    ctx.beginPath();
    ctx.moveTo(f.x, y);
    ctx.lineTo(f.x + f.w, y);
    ctx.stroke();
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(t.label, f.x - 6, y);
  }
  for (const t of xTicks) {
    const x = f.x + t.pos * f.w;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(t.label, x, f.y + f.h + 6);
  }
}

/* ------------------------------ Charts ------------------------------ */

export function drawHistogram(values: number[], opts: BaseOpts = {}): HTMLCanvasElement {
  const W = opts.width ?? DEFAULT_W;
  const H = opts.height ?? DEFAULT_H;
  const { c, ctx } = createCanvas(W, H);
  const f = drawFrame(ctx, W, H, opts.title, opts.xLabel, opts.yLabel ?? "Frequency");
  const xs = values.filter((v) => Number.isFinite(v));
  if (xs.length === 0) return c;

  const mn = Math.min(...xs);
  const mx = Math.max(...xs);
  const bins = Math.min(30, Math.max(8, Math.ceil(Math.sqrt(xs.length))));
  const step = (mx - mn) / bins || 1;
  const counts = new Array(bins).fill(0);
  for (const v of xs) {
    const idx = Math.min(bins - 1, Math.floor((v - mn) / step));
    counts[idx]++;
  }
  const maxC = Math.max(...counts);
  const yTicks = niceTicks(0, maxC).map((v) => ({ pos: v / maxC, label: fmt(v) }));
  const xTicks = niceTicks(mn, mx, 6).map((v) => ({ pos: (v - mn) / (mx - mn || 1), label: fmt(v) }));
  drawAxes(ctx, f, xTicks, yTicks);

  const bw = f.w / bins;
  ctx.fillStyle = opts.color ?? PALETTE[0];
  for (let i = 0; i < bins; i++) {
    const h = (counts[i] / maxC) * f.h;
    ctx.fillRect(f.x + i * bw + 1, f.y + f.h - h, Math.max(1, bw - 2), h);
  }
  return c;
}

export function drawScatter(
  xs: number[],
  ys: number[],
  opts: BaseOpts = {},
): HTMLCanvasElement {
  const W = opts.width ?? DEFAULT_W;
  const H = opts.height ?? DEFAULT_H;
  const { c, ctx } = createCanvas(W, H);
  const f = drawFrame(ctx, W, H, opts.title, opts.xLabel, opts.yLabel);
  const pairs: [number, number][] = [];
  const n = Math.min(xs.length, ys.length);
  for (let i = 0; i < n; i++)
    if (Number.isFinite(xs[i]) && Number.isFinite(ys[i])) pairs.push([xs[i], ys[i]]);
  if (pairs.length === 0) return c;
  const xMin = Math.min(...pairs.map((p) => p[0]));
  const xMax = Math.max(...pairs.map((p) => p[0]));
  const yMin = Math.min(...pairs.map((p) => p[1]));
  const yMax = Math.max(...pairs.map((p) => p[1]));
  const xTicks = niceTicks(xMin, xMax, 6).map((v) => ({
    pos: (v - xMin) / (xMax - xMin || 1),
    label: fmt(v),
  }));
  const yTicks = niceTicks(yMin, yMax, 5).map((v) => ({
    pos: (v - yMin) / (yMax - yMin || 1),
    label: fmt(v),
  }));
  drawAxes(ctx, f, xTicks, yTicks);
  ctx.fillStyle = opts.color ?? PALETTE[1];
  for (const [x, y] of pairs) {
    const px = f.x + ((x - xMin) / (xMax - xMin || 1)) * f.w;
    const py = f.y + f.h - ((y - yMin) / (yMax - yMin || 1)) * f.h;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.arc(px, py, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  return c;
}

export function drawLine(
  xs: (number | string)[],
  ys: number[],
  opts: BaseOpts = {},
): HTMLCanvasElement {
  const W = opts.width ?? DEFAULT_W;
  const H = opts.height ?? DEFAULT_H;
  const { c, ctx } = createCanvas(W, H);
  const f = drawFrame(ctx, W, H, opts.title, opts.xLabel, opts.yLabel);
  const n = Math.min(xs.length, ys.length);
  const pts: { i: number; y: number; label: string }[] = [];
  for (let i = 0; i < n; i++) {
    if (Number.isFinite(ys[i])) pts.push({ i, y: ys[i], label: String(xs[i]) });
  }
  if (pts.length === 0) return c;
  const yMin = Math.min(...pts.map((p) => p.y));
  const yMax = Math.max(...pts.map((p) => p.y));
  const yTicks = niceTicks(yMin, yMax, 5).map((v) => ({
    pos: (v - yMin) / (yMax - yMin || 1),
    label: fmt(v),
  }));
  const xTickCount = Math.min(6, pts.length);
  const xTicks = Array.from({ length: xTickCount }, (_, k) => {
    const idx = Math.round((k / (xTickCount - 1 || 1)) * (pts.length - 1));
    const lbl = pts[idx]?.label ?? "";
    return { pos: idx / (pts.length - 1 || 1), label: lbl.length > 10 ? lbl.slice(0, 10) + "…" : lbl };
  });
  drawAxes(ctx, f, xTicks, yTicks);

  ctx.strokeStyle = opts.color ?? PALETTE[0];
  ctx.lineWidth = 2;
  ctx.beginPath();
  pts.forEach((p, k) => {
    const px = f.x + (k / (pts.length - 1 || 1)) * f.w;
    const py = f.y + f.h - ((p.y - yMin) / (yMax - yMin || 1)) * f.h;
    if (k === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.stroke();
  return c;
}

export function drawBar(
  labels: string[],
  values: number[],
  opts: BaseOpts = {},
): HTMLCanvasElement {
  const W = opts.width ?? DEFAULT_W;
  const H = opts.height ?? DEFAULT_H;
  const { c, ctx } = createCanvas(W, H);
  const f = drawFrame(ctx, W, H, opts.title, opts.xLabel, opts.yLabel ?? "Count");
  if (labels.length === 0) return c;
  const maxV = Math.max(...values);
  const yTicks = niceTicks(0, maxV).map((v) => ({ pos: maxV ? v / maxV : 0, label: fmt(v) }));
  const xTicks = labels.map((l, i) => ({
    pos: (i + 0.5) / labels.length,
    label: l.length > 10 ? l.slice(0, 10) + "…" : l,
  }));
  drawAxes(ctx, f, xTicks, yTicks);

  const bw = f.w / labels.length;
  for (let i = 0; i < labels.length; i++) {
    const h = maxV ? (values[i] / maxV) * f.h : 0;
    ctx.fillStyle = PALETTE[i % PALETTE.length];
    ctx.fillRect(f.x + i * bw + 6, f.y + f.h - h, Math.max(1, bw - 12), h);
  }
  return c;
}

export function drawPie(
  labels: string[],
  values: number[],
  opts: BaseOpts = {},
): HTMLCanvasElement {
  const W = opts.width ?? DEFAULT_W;
  const H = opts.height ?? DEFAULT_H;
  const { c, ctx } = createCanvas(W, H);
  if (opts.title) {
    ctx.fillStyle = FG;
    ctx.font = "bold 16px 'Space Grotesk', system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(opts.title, 24, 28);
  }
  const total = values.reduce((a, b) => a + b, 0);
  if (total === 0) return c;
  const cx = W / 2 - 80;
  const cy = H / 2 + 8;
  const r = Math.min(W, H) / 2 - 60;
  let start = -Math.PI / 2;
  for (let i = 0; i < values.length; i++) {
    const angle = (values[i] / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, start, start + angle);
    ctx.closePath();
    ctx.fillStyle = PALETTE[i % PALETTE.length];
    ctx.fill();
    start += angle;
  }
  // legend
  ctx.font = "12px 'Plus Jakarta Sans', system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  const legX = W - 200;
  let legY = 60;
  for (let i = 0; i < labels.length; i++) {
    ctx.fillStyle = PALETTE[i % PALETTE.length];
    ctx.fillRect(legX, legY - 6, 12, 12);
    ctx.fillStyle = FG;
    const pct = ((values[i] / total) * 100).toFixed(1);
    const lbl = labels[i].length > 18 ? labels[i].slice(0, 18) + "…" : labels[i];
    ctx.fillText(`${lbl} — ${pct}%`, legX + 18, legY);
    legY += 22;
  }
  return c;
}

export function drawBoxPlot(
  groups: { label: string; values: number[] }[],
  opts: BaseOpts = {},
): HTMLCanvasElement {
  const W = opts.width ?? DEFAULT_W;
  const H = opts.height ?? DEFAULT_H;
  const { c, ctx } = createCanvas(W, H);
  const f = drawFrame(ctx, W, H, opts.title, opts.xLabel, opts.yLabel);
  const stats = groups
    .map((g) => {
      const xs = g.values.filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
      if (xs.length === 0) return null;
      const q = (p: number) => {
        const pos = (xs.length - 1) * p;
        const b = Math.floor(pos);
        const rest = pos - b;
        return xs[b + 1] !== undefined ? xs[b] + rest * (xs[b + 1] - xs[b]) : xs[b];
      };
      return {
        label: g.label,
        min: xs[0],
        q1: q(0.25),
        med: q(0.5),
        q3: q(0.75),
        max: xs[xs.length - 1],
      };
    })
    .filter((s): s is NonNullable<typeof s> => s !== null);
  if (stats.length === 0) return c;
  const yMin = Math.min(...stats.map((s) => s.min));
  const yMax = Math.max(...stats.map((s) => s.max));
  const yTicks = niceTicks(yMin, yMax, 5).map((v) => ({
    pos: (v - yMin) / (yMax - yMin || 1),
    label: fmt(v),
  }));
  const xTicks = stats.map((s, i) => ({
    pos: (i + 0.5) / stats.length,
    label: s.label.length > 12 ? s.label.slice(0, 12) + "…" : s.label,
  }));
  drawAxes(ctx, f, xTicks, yTicks);

  const bw = f.w / stats.length;
  const toY = (v: number) => f.y + f.h - ((v - yMin) / (yMax - yMin || 1)) * f.h;
  stats.forEach((s, i) => {
    const cx = f.x + (i + 0.5) * bw;
    const boxL = cx - Math.min(60, bw * 0.35);
    const boxR = cx + Math.min(60, bw * 0.35);
    ctx.strokeStyle = MUTED;
    ctx.beginPath();
    ctx.moveTo(cx, toY(s.min));
    ctx.lineTo(cx, toY(s.max));
    ctx.stroke();
    ctx.fillStyle = PALETTE[i % PALETTE.length];
    ctx.globalAlpha = 0.35;
    ctx.fillRect(boxL, toY(s.q3), boxR - boxL, toY(s.q1) - toY(s.q3));
    ctx.globalAlpha = 1;
    ctx.strokeStyle = PALETTE[i % PALETTE.length];
    ctx.strokeRect(boxL, toY(s.q3), boxR - boxL, toY(s.q1) - toY(s.q3));
    ctx.beginPath();
    ctx.moveTo(boxL, toY(s.med));
    ctx.lineTo(boxR, toY(s.med));
    ctx.strokeStyle = FG;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.lineWidth = 1;
  });
  return c;
}

export function downloadCanvasPng(canvas: HTMLCanvasElement, filename: string): void {
  const url = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".png") ? filename : `${filename}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
