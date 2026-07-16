import { useMemo } from "react";
import type { Dataset } from "@/lib/dataset";
import { formatNumber } from "@/lib/dataset";
import {
  summarizeColumns,
  correlationMatrix,
  covarianceMatrix,
} from "@/lib/numpy-service";
import { Sigma, AlertCircle } from "lucide-react";

export function NumpyStatsSection({ dataset, numericCols }: { dataset: Dataset; numericCols: string[] }) {
  const getValues = useMemo(
    () => (col: string) => dataset.rows.map((r) => r[col]),
    [dataset],
  );

  const summaries = useMemo(
    () => summarizeColumns(numericCols, getValues),
    [numericCols, getValues],
  );
  const corr = useMemo(() => correlationMatrix(numericCols, getValues), [numericCols, getValues]);
  const cov = useMemo(() => covarianceMatrix(numericCols, getValues), [numericCols, getValues]);

  if (numericCols.length === 0) {
    return (
      <section className="glass mt-6 rounded-3xl p-6">
        <SectionHead
          title="NumPy statistics"
          subtitle="Advanced numerical analysis powered by NumPy-equivalent computations."
        />
        <div className="mt-4 rounded-xl bg-muted/40 p-8 text-center text-sm text-muted-foreground">
          No numeric columns detected in this dataset.
        </div>
      </section>
    );
  }

  return (
    <section className="glass mt-6 rounded-3xl p-6">
      <div className="flex items-center gap-2">
        <div
          className="grid h-8 w-8 place-items-center rounded-xl text-primary-foreground"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Sigma className="h-4 w-4" />
        </div>
        <SectionHead
          title="NumPy statistics"
          subtitle="Variance, percentiles, z-scores, IQR outliers, skewness, correlation & covariance matrices."
        />
      </div>

      {/* Per-column stat cards */}
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {summaries.map((s) => (
          <div key={s.column} className="rounded-2xl border border-border/50 bg-card/40 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate font-display text-sm font-semibold">{s.column}</div>
                <div className="mt-0.5 text-[11px] uppercase tracking-widest text-muted-foreground">
                  {s.count.toLocaleString()} values
                </div>
              </div>
              {s.outliers.count > 0 && (
                <div className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-medium text-warning">
                  <AlertCircle className="h-3 w-3" />
                  {s.outliers.count} outliers
                </div>
              )}
            </div>

            <div className="mt-3 grid grid-cols-4 gap-2 text-center text-[10px]">
              <MiniStat label="Mean" value={formatNumber(s.mean)} />
              <MiniStat label="Median" value={formatNumber(s.median)} />
              <MiniStat label="Std" value={formatNumber(s.std)} />
              <MiniStat label="Variance" value={formatNumber(s.variance)} />
              <MiniStat label="Min" value={formatNumber(s.min)} />
              <MiniStat label="Max" value={formatNumber(s.max)} />
              <MiniStat label="Range" value={formatNumber(s.range)} />
              <MiniStat label="Skewness" value={formatNumber(s.skewness)} />
              <MiniStat label="Q1" value={formatNumber(s.q1)} />
              <MiniStat label="Q3" value={formatNumber(s.q3)} />
              <MiniStat label="IQR" value={formatNumber(s.iqr)} />
              <MiniStat label="P95" value={formatNumber(s.percentiles.p95)} />
            </div>

            <div className="mt-3 rounded-lg bg-muted/40 p-2">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Percentiles
              </div>
              <div className="mt-1 grid grid-cols-6 gap-1 text-center text-[10px]">
                {(["p25", "p50", "p75", "p90", "p95", "p99"] as const).map((k) => (
                  <div key={k}>
                    <div className="text-muted-foreground">{k.replace("p", "P")}</div>
                    <div className="font-semibold">{formatNumber(s.percentiles[k])}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-2 text-[10px] text-muted-foreground">
              IQR outlier bounds:{" "}
              <span className="font-medium text-foreground">
                [{formatNumber(s.outliers.lowerBound)}, {formatNumber(s.outliers.upperBound)}]
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Matrices */}
      {numericCols.length >= 2 && (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <MatrixCard title="Correlation matrix" columns={corr.columns} matrix={corr.matrix} mode="corr" />
          <MatrixCard title="Covariance matrix" columns={cov.columns} matrix={cov.matrix} mode="cov" />
        </div>
      )}
    </section>
  );
}

function MatrixCard({
  title,
  columns,
  matrix,
  mode,
}: {
  title: string;
  columns: string[];
  matrix: number[][];
  mode: "corr" | "cov";
}) {
  const maxAbs = mode === "cov" ? Math.max(1, ...matrix.flat().map((v) => Math.abs(v))) : 1;
  const cell = (v: number) => {
    const intensity = Math.min(1, Math.abs(v) / maxAbs);
    const color = v >= 0 ? "34, 197, 94" : "239, 68, 68";
    return `rgba(${color}, ${0.15 + intensity * 0.55})`;
  };
  return (
    <div className="rounded-2xl border border-border/50 bg-card/40 p-4">
      <div className="font-display text-sm font-semibold">{title}</div>
      <div className="mt-3 overflow-x-auto">
        <div
          className="inline-grid gap-0.5"
          style={{ gridTemplateColumns: `110px repeat(${columns.length}, minmax(60px, 1fr))` }}
        >
          <div />
          {columns.map((c) => (
            <div key={c} className="truncate px-1 pb-1 text-[10px] font-medium text-muted-foreground" title={c}>
              {c}
            </div>
          ))}
          {columns.map((row, i) => (
            <div key={row} className="contents">
              <div className="truncate pr-2 text-right text-[11px] font-medium text-muted-foreground" title={row}>
                {row}
              </div>
              {columns.map((c2, j) => (
                <div
                  key={c2}
                  className="grid h-9 place-items-center rounded-md text-[10px] font-semibold"
                  style={{ background: cell(matrix[i][j]) }}
                  title={`${row} vs ${c2}: ${matrix[i][j].toFixed(4)}`}
                >
                  {mode === "corr" ? matrix[i][j].toFixed(2) : formatNumber(matrix[i][j])}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/40 px-1.5 py-1">
      <div className="text-[9px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="truncate text-xs font-semibold">{value}</div>
    </div>
  );
}

function SectionHead({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </div>
  );
}
