// numpy-service.ts
// Browser-side emulation of the NumPy stats layer described in the spec.
// Pure functions that operate on numeric arrays; no side effects.

export interface NumericSummary {
  count: number;
  mean: number;
  median: number;
  variance: number;
  std: number;
  min: number;
  max: number;
  range: number;
  q1: number;
  q3: number;
  iqr: number;
  skewness: number;
  percentiles: { p25: number; p50: number; p75: number; p90: number; p95: number; p99: number };
  outliers: { count: number; lowerBound: number; upperBound: number; values: number[] };
}

export interface ColumnNumericSummary extends NumericSummary {
  column: string;
}

export interface MatrixResult {
  columns: string[];
  matrix: number[][];
}

const finite = (xs: unknown[]): number[] =>
  xs
    .map((v) => (typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN))
    .filter((n): n is number => Number.isFinite(n));

export const mean = (xs: number[]): number =>
  xs.length === 0 ? NaN : xs.reduce((a, b) => a + b, 0) / xs.length;

export const min = (xs: number[]): number => (xs.length ? Math.min(...xs) : NaN);
export const max = (xs: number[]): number => (xs.length ? Math.max(...xs) : NaN);
export const range = (xs: number[]): number => (xs.length ? max(xs) - min(xs) : NaN);

export function percentile(xs: number[], p: number): number {
  if (xs.length === 0) return NaN;
  const sorted = [...xs].sort((a, b) => a - b);
  const pos = (sorted.length - 1) * p;
  const base = Math.floor(pos);
  const rest = pos - base;
  return sorted[base + 1] !== undefined
    ? sorted[base] + rest * (sorted[base + 1] - sorted[base])
    : sorted[base];
}

export const median = (xs: number[]): number => percentile(xs, 0.5);

export function variance(xs: number[]): number {
  if (xs.length < 2) return NaN;
  const m = mean(xs);
  return xs.reduce((acc, x) => acc + (x - m) ** 2, 0) / (xs.length - 1);
}

export const std = (xs: number[]): number => Math.sqrt(variance(xs));

export function zScores(xs: number[]): number[] {
  const m = mean(xs);
  const s = std(xs);
  if (!Number.isFinite(s) || s === 0) return xs.map(() => 0);
  return xs.map((x) => (x - m) / s);
}

export function iqr(xs: number[]): { q1: number; q3: number; iqr: number } {
  const q1 = percentile(xs, 0.25);
  const q3 = percentile(xs, 0.75);
  return { q1, q3, iqr: q3 - q1 };
}

export function detectOutliers(xs: number[]): {
  count: number;
  lowerBound: number;
  upperBound: number;
  values: number[];
} {
  const { q1, q3, iqr: r } = iqr(xs);
  const lowerBound = q1 - 1.5 * r;
  const upperBound = q3 + 1.5 * r;
  const values = xs.filter((x) => x < lowerBound || x > upperBound);
  return { count: values.length, lowerBound, upperBound, values };
}

// Fisher-Pearson sample skewness (adjusted).
export function skewness(xs: number[]): number {
  const n = xs.length;
  if (n < 3) return 0;
  const m = mean(xs);
  const s = std(xs);
  if (!Number.isFinite(s) || s === 0) return 0;
  const sum = xs.reduce((acc, x) => acc + ((x - m) / s) ** 3, 0);
  return (n / ((n - 1) * (n - 2))) * sum;
}

export function summarize(values: unknown[]): NumericSummary {
  const xs = finite(values);
  const q = iqr(xs);
  return {
    count: xs.length,
    mean: mean(xs),
    median: median(xs),
    variance: variance(xs),
    std: std(xs),
    min: min(xs),
    max: max(xs),
    range: range(xs),
    q1: q.q1,
    q3: q.q3,
    iqr: q.iqr,
    skewness: skewness(xs),
    percentiles: {
      p25: percentile(xs, 0.25),
      p50: percentile(xs, 0.5),
      p75: percentile(xs, 0.75),
      p90: percentile(xs, 0.9),
      p95: percentile(xs, 0.95),
      p99: percentile(xs, 0.99),
    },
    outliers: detectOutliers(xs),
  };
}

export function summarizeColumns(
  columns: string[],
  getValues: (col: string) => unknown[],
): ColumnNumericSummary[] {
  return columns.map((column) => ({ column, ...summarize(getValues(column)) }));
}

function alignedPairs(a: unknown[], b: unknown[]): { xs: number[]; ys: number[] } {
  const xs: number[] = [];
  const ys: number[] = [];
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) {
    const x = typeof a[i] === "number" ? (a[i] as number) : Number(a[i]);
    const y = typeof b[i] === "number" ? (b[i] as number) : Number(b[i]);
    if (Number.isFinite(x) && Number.isFinite(y)) {
      xs.push(x);
      ys.push(y);
    }
  }
  return { xs, ys };
}

export function covariance(a: unknown[], b: unknown[]): number {
  const { xs, ys } = alignedPairs(a, b);
  if (xs.length < 2) return NaN;
  const mx = mean(xs);
  const my = mean(ys);
  let s = 0;
  for (let i = 0; i < xs.length; i++) s += (xs[i] - mx) * (ys[i] - my);
  return s / (xs.length - 1);
}

export function correlation(a: unknown[], b: unknown[]): number {
  const { xs, ys } = alignedPairs(a, b);
  if (xs.length < 2) return 0;
  const sa = std(xs);
  const sb = std(ys);
  if (sa === 0 || sb === 0) return 0;
  return covariance(xs, ys) / (sa * sb);
}

export function correlationMatrix(
  columns: string[],
  getValues: (col: string) => unknown[],
): MatrixResult {
  const cache = columns.map((c) => finite(getValues(c)));
  const matrix = columns.map((_, i) =>
    columns.map((__, j) => (i === j ? 1 : correlation(cache[i], cache[j]))),
  );
  return { columns, matrix };
}

export function covarianceMatrix(
  columns: string[],
  getValues: (col: string) => unknown[],
): MatrixResult {
  const cache = columns.map((c) => finite(getValues(c)));
  const matrix = columns.map((_, i) =>
    columns.map((__, j) => (i === j ? variance(cache[i]) : covariance(cache[i], cache[j]))),
  );
  return { columns, matrix };
}
