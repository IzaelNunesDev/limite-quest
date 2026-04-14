/**
 * Canvas-based math graphing utilities.
 *
 * Handles holes, jump discontinuities, and asymptotes correctly by using
 * moveTo (pen-up) gaps instead of connecting through them with a polyline.
 */

export interface PlotOptions {
  xMin: number;
  xMax: number;
  yMin?: number;
  yMax?: number;
  /** x where there is a removable discontinuity — draws an open circle */
  holeAt?: number;
  holeY?: number;
  /** x values of vertical asymptotes — gaps in the curve */
  asymptoteAt?: number[];
  color?: string;
  lineWidth?: number;
  padding?: { top: number; right: number; bottom: number; left: number };
  /** Background fill color used inside hole circles */
  bgColor?: string;
}

export interface PlotResult {
  toScreenX: (x: number) => number;
  toScreenY: (y: number) => number;
  yMin: number;
  yMax: number;
}

export const DEFAULT_PAD = { top: 30, right: 20, bottom: 40, left: 50 };

// ── Coordinate helpers ───────────────────────────────────────────────────────

export function computeYRange(
  fn: (x: number) => number,
  xMin: number,
  xMax: number,
  skipNear?: number,
  steps = 400,
): { yMin: number; yMax: number } {
  let yMin = Infinity;
  let yMax = -Infinity;

  for (let i = 0; i <= steps; i++) {
    const x = xMin + (i / steps) * (xMax - xMin);
    if (skipNear !== undefined && Math.abs(x - skipNear) < 0.025) continue;
    const y = fn(x);
    if (Number.isFinite(y)) {
      yMin = Math.min(yMin, y);
      yMax = Math.max(yMax, y);
    }
  }

  if (!Number.isFinite(yMin)) { yMin = -2; yMax = 2; }
  const yRange = yMax - yMin || 2;
  return { yMin: yMin - yRange * 0.12, yMax: yMax + yRange * 0.12 };
}

// ── Canvas setup ─────────────────────────────────────────────────────────────

export function setupCanvas(canvas: HTMLCanvasElement): {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
} {
  const ctx = canvas.getContext('2d')!;
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);
  return { ctx, width: rect.width, height: rect.height };
}

// ── Drawing helpers ───────────────────────────────────────────────────────────

export function drawBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  bgColor = '#1C1C1E',
) {
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);
}

export function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  pad = DEFAULT_PAD,
) {
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  ctx.strokeStyle = 'rgba(255,255,255,0.07)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 8; i++) {
    const gx = pad.left + (i / 8) * plotW;
    ctx.beginPath();
    ctx.moveTo(gx, pad.top);
    ctx.lineTo(gx, pad.top + plotH);
    ctx.stroke();
    const gy = pad.top + (i / 8) * plotH;
    ctx.beginPath();
    ctx.moveTo(pad.left, gy);
    ctx.lineTo(pad.left + plotW, gy);
    ctx.stroke();
  }
}

export function drawAxisLabels(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  pad = DEFAULT_PAD,
) {
  const plotW = width - pad.left - pad.right;
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.font = '11px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(xMin.toFixed(1), pad.left, height - 6);
  ctx.fillText(xMax.toFixed(1), pad.left + plotW, height - 6);
  ctx.textAlign = 'right';
  ctx.fillText(yMin.toFixed(1), pad.left - 4, height - pad.bottom + 4);
  ctx.fillText(yMax.toFixed(1), pad.left - 4, pad.top + 12);
}

/** Draw a filled dot with optional glow. */
export function drawDot(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  color: string,
  radius = 8,
  glow = true,
) {
  if (glow) {
    ctx.shadowColor = `${color}aa`;
    ctx.shadowBlur = 14;
  }
  ctx.beginPath();
  ctx.arc(sx, sy, radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  if (glow) ctx.shadowBlur = 0;
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 2;
  ctx.stroke();
}

/** Draw an open circle marking a hole (removable discontinuity). */
export function drawHole(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  bgColor = '#1C1C1E',
  strokeColor = '#58CC02',
  radius = 8,
) {
  ctx.beginPath();
  ctx.arc(sx, sy, radius, 0, Math.PI * 2);
  ctx.fillStyle = bgColor;
  ctx.fill();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2.5;
  ctx.stroke();
}

/** Draw a dashed line between two screen-space points. */
export function drawDashedLine(
  ctx: CanvasRenderingContext2D,
  x1: number, y1: number,
  x2: number, y2: number,
  color: string,
  dash: number[] = [5, 4],
) {
  ctx.setLineDash(dash);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.setLineDash([]);
}

// ── Core plot function ────────────────────────────────────────────────────────

/**
 * Plot a mathematical function on a canvas context.
 *
 * Correctly handles:
 * - Removable discontinuities (holes): draws open circle, leaves gap in curve
 * - Vertical asymptotes: leaves gap in curve
 * - Jump discontinuities: detected via large y-jumps, pen lifted automatically
 * - NaN / Infinity: silently skipped
 */
export function plotFunction(
  ctx: CanvasRenderingContext2D,
  fn: (x: number) => number,
  width: number,
  height: number,
  opts: PlotOptions,
): PlotResult {
  const {
    xMin, xMax,
    color = '#58CC02',
    lineWidth = 3,
    holeAt,
    asymptoteAt = [],
    bgColor = '#1C1C1E',
  } = opts;

  const pad = opts.padding ?? DEFAULT_PAD;
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  // Compute Y range
  const { yMin: autoYMin, yMax: autoYMax } = computeYRange(fn, xMin, xMax, holeAt);
  const yMin = opts.yMin ?? autoYMin;
  const yMax = opts.yMax ?? autoYMax;
  const yRange = yMax - yMin;

  const toScreenX = (x: number) => pad.left + ((x - xMin) / (xMax - xMin)) * plotW;
  const toScreenY = (y: number) => pad.top + (1 - (y - yMin) / (yMax - yMin)) * plotH;

  const steps = Math.max(300, Math.round(plotW * 2.5));
  const xStep = (xMax - xMin) / steps;
  // How wide (in x units) to skip around a singular point
  const gapHalf = xStep * 5;

  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.shadowColor = `${color}55`;
  ctx.shadowBlur = 8;
  ctx.beginPath();

  let penDown = false;
  let prevY: number | null = null;

  for (let i = 0; i <= steps; i++) {
    const x = xMin + i * xStep;

    // Gap: near hole
    if (holeAt !== undefined && Math.abs(x - holeAt) < gapHalf) {
      penDown = false;
      prevY = null;
      continue;
    }

    // Gap: near asymptote
    if (asymptoteAt.some(a => Math.abs(x - a) < gapHalf)) {
      penDown = false;
      prevY = null;
      continue;
    }

    const y = fn(x);

    if (!Number.isFinite(y) || Math.abs(y) > yRange * 8) {
      penDown = false;
      prevY = null;
      continue;
    }

    // Auto-detect jump discontinuities
    if (prevY !== null && Math.abs(y - prevY) > yRange * 0.35) {
      penDown = false;
    }

    const sx = toScreenX(x);
    const sy = toScreenY(y);

    if (!penDown) {
      ctx.moveTo(sx, sy);
      penDown = true;
    } else {
      ctx.lineTo(sx, sy);
    }
    prevY = y;
  }

  ctx.stroke();
  ctx.shadowBlur = 0;

  // Draw open circle at hole
  if (holeAt !== undefined && opts.holeY !== undefined) {
    drawHole(ctx, toScreenX(holeAt), toScreenY(opts.holeY), bgColor, color);
  }

  return { toScreenX, toScreenY, yMin, yMax };
}
