import Papa from "papaparse";

export type CellValue = string | number | null;
export type Row = Record<string, CellValue>;

export interface Dataset {
  id: string;
  name: string;
  uploadedAt: number;
  fileSize: number;
  columns: string[];
  rows: Row[];
}

export type ColumnType = "numeric" | "categorical" | "datetime" | "boolean";

export interface ColumnProfile {
  name: string;
  type: ColumnType;
  missing: number;
  missingPct: number;
  unique: number;
  // numeric
  mean?: number;
  median?: number;
  mode?: CellValue;
  std?: number;
  min?: number;
  max?: number;
  q1?: number;
  q3?: number;
  // categorical
  topValues?: { value: string; count: number }[];
}

export interface DatasetSummary {
  rowCount: number;
  colCount: number;
  missingCells: number;
  duplicateRows: number;
  memoryBytes: number;
  numericCols: string[];
  categoricalCols: string[];
  datetimeCols: string[];
  profiles: ColumnProfile[];
  correlations: { a: string; b: string; r: number }[];
}

const isBlank = (v: CellValue): boolean =>
  v === null || v === undefined || (typeof v === "string" && v.trim() === "");

const isNumericLike = (v: CellValue): boolean => {
  if (typeof v === "number") return Number.isFinite(v);
  if (typeof v !== "string") return false;
  const s = v.trim();
  if (s === "") return false;
  return !Number.isNaN(Number(s));
};

const isDateLike = (v: CellValue): boolean => {
  if (typeof v !== "string") return false;
  const s = v.trim();
  if (s.length < 6) return false;
  // Simple ISO / common formats
  if (!/[-/:]/.test(s)) return false;
  const d = Date.parse(s);
  return !Number.isNaN(d);
};

function detectType(values: CellValue[]): ColumnType {
  let numeric = 0;
  let date = 0;
  let bool = 0;
  let filled = 0;
  for (const v of values) {
    if (isBlank(v)) continue;
    filled++;
    const s = String(v).trim().toLowerCase();
    if (s === "true" || s === "false" || s === "yes" || s === "no") bool++;
    else if (isNumericLike(v)) numeric++;
    else if (isDateLike(v)) date++;
  }
  if (filled === 0) return "categorical";
  if (numeric / filled > 0.85) return "numeric";
  if (date / filled > 0.8) return "datetime";
  if (bool / filled > 0.9) return "boolean";
  return "categorical";
}

function quantile(sorted: number[], q: number): number {
  if (sorted.length === 0) return NaN;
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  }
  return sorted[base];
}

function mode<T extends CellValue>(values: T[]): T | undefined {
  const counts = new Map<string, { v: T; c: number }>();
  for (const v of values) {
    if (isBlank(v)) continue;
    const k = String(v);
    const entry = counts.get(k);
    if (entry) entry.c++;
    else counts.set(k, { v, c: 1 });
  }
  let best: { v: T; c: number } | undefined;
  for (const e of counts.values()) if (!best || e.c > best.c) best = e;
  return best?.v;
}

export function profileColumn(name: string, values: CellValue[]): ColumnProfile {
  const type = detectType(values);
  const missing = values.filter(isBlank).length;
  const unique = new Set(values.filter((v) => !isBlank(v)).map(String)).size;
  const profile: ColumnProfile = {
    name,
    type,
    missing,
    missingPct: values.length ? (missing / values.length) * 100 : 0,
    unique,
  };

  if (type === "numeric") {
    const nums = values
      .filter((v) => !isBlank(v) && isNumericLike(v))
      .map((v) => Number(v))
      .sort((a, b) => a - b);
    if (nums.length) {
      const sum = nums.reduce((a, b) => a + b, 0);
      const mean = sum / nums.length;
      const variance =
        nums.reduce((acc, x) => acc + (x - mean) ** 2, 0) / nums.length;
      profile.mean = mean;
      profile.median = quantile(nums, 0.5);
      profile.std = Math.sqrt(variance);
      profile.min = nums[0];
      profile.max = nums[nums.length - 1];
      profile.q1 = quantile(nums, 0.25);
      profile.q3 = quantile(nums, 0.75);
      profile.mode = mode(nums);
    }
  } else {
    const counts = new Map<string, number>();
    for (const v of values) {
      if (isBlank(v)) continue;
      const k = String(v);
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
    profile.topValues = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([value, count]) => ({ value, count }));
    profile.mode = profile.topValues[0]?.value ?? null;
  }
  return profile;
}

function pearson(xs: number[], ys: number[]): number {
  const n = xs.length;
  if (n < 2) return 0;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let dx = 0;
  let dy = 0;
  for (let i = 0; i < n; i++) {
    const a = xs[i] - mx;
    const b = ys[i] - my;
    num += a * b;
    dx += a * a;
    dy += b * b;
  }
  const denom = Math.sqrt(dx * dy);
  return denom === 0 ? 0 : num / denom;
}

export function summarize(dataset: Dataset): DatasetSummary {
  const { rows, columns } = dataset;
  const profiles = columns.map((c) =>
    profileColumn(
      c,
      rows.map((r) => r[c]),
    ),
  );
  const numericCols = profiles.filter((p) => p.type === "numeric").map((p) => p.name);
  const categoricalCols = profiles
    .filter((p) => p.type === "categorical" || p.type === "boolean")
    .map((p) => p.name);
  const datetimeCols = profiles.filter((p) => p.type === "datetime").map((p) => p.name);

  const seen = new Set<string>();
  let duplicateRows = 0;
  for (const r of rows) {
    const key = columns.map((c) => String(r[c] ?? "")).join("\u0001");
    if (seen.has(key)) duplicateRows++;
    else seen.add(key);
  }

  const missingCells = profiles.reduce((s, p) => s + p.missing, 0);

  const correlations: { a: string; b: string; r: number }[] = [];
  if (numericCols.length >= 2) {
    const numericData: Record<string, number[]> = {};
    for (const c of numericCols) {
      numericData[c] = rows
        .map((r) => (isNumericLike(r[c]) ? Number(r[c]) : NaN))
        .filter((n) => Number.isFinite(n));
    }
    for (let i = 0; i < numericCols.length; i++) {
      for (let j = i + 1; j < numericCols.length; j++) {
        const a = numericCols[i];
        const b = numericCols[j];
        // Align by index while skipping non-finite in either
        const xs: number[] = [];
        const ys: number[] = [];
        for (const r of rows) {
          const va = r[a];
          const vb = r[b];
          if (isNumericLike(va) && isNumericLike(vb)) {
            xs.push(Number(va));
            ys.push(Number(vb));
          }
        }
        correlations.push({ a, b, r: pearson(xs, ys) });
      }
    }
  }

  return {
    rowCount: rows.length,
    colCount: columns.length,
    missingCells,
    duplicateRows,
    memoryBytes: dataset.fileSize,
    numericCols,
    categoricalCols,
    datetimeCols,
    profiles,
    correlations: correlations.sort((a, b) => Math.abs(b.r) - Math.abs(a.r)),
  };
}

export async function parseCsvFile(file: File): Promise<Dataset> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: "greedy",
      dynamicTyping: false,
      complete: (results) => {
        if (results.errors.length && results.data.length === 0) {
          reject(new Error(results.errors[0].message || "Failed to parse CSV"));
          return;
        }
        const columns =
          results.meta.fields?.filter((f) => f && f.trim() !== "") ?? [];
        if (columns.length === 0) {
          reject(new Error("CSV has no columns"));
          return;
        }
        const rows: Row[] = (results.data as Record<string, string>[]).map(
          (raw) => {
            const r: Row = {};
            for (const c of columns) {
              const v = raw[c];
              if (v === undefined || v === null || v === "") r[c] = null;
              else if (isNumericLike(v)) r[c] = Number(v);
              else r[c] = v;
            }
            return r;
          },
        );
        if (rows.length === 0) {
          reject(new Error("CSV appears to be empty"));
          return;
        }
        resolve({
          id: crypto.randomUUID(),
          name: file.name.replace(/\.csv$/i, ""),
          uploadedAt: Date.now(),
          fileSize: file.size,
          columns,
          rows,
        });
      },
      error: (err) => reject(err),
    });
  });
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

export function formatNumber(n: number | undefined): string {
  if (n === undefined || Number.isNaN(n)) return "—";
  if (!Number.isFinite(n)) return "∞";
  if (Math.abs(n) >= 1000)
    return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(3);
}
