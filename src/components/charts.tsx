import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  ScatterChart,
  Scatter,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import type { ColumnProfile, Dataset, Row } from "@/lib/dataset";

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const tooltipStyle = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  fontSize: 12,
  color: "var(--foreground)",
};

export function Histogram({ dataset, column }: { dataset: Dataset; column: string }) {
  const data = useMemo(() => {
    const nums = dataset.rows
      .map((r) => r[column])
      .filter((v): v is number => typeof v === "number" && Number.isFinite(v));
    if (nums.length === 0) return [];
    const min = Math.min(...nums);
    const max = Math.max(...nums);
    if (min === max) return [{ bin: String(min), count: nums.length }];
    const bins = Math.min(20, Math.max(5, Math.ceil(Math.sqrt(nums.length))));
    const width = (max - min) / bins;
    const buckets = Array.from({ length: bins }, (_, i) => ({
      bin: `${(min + i * width).toFixed(1)}`,
      count: 0,
    }));
    for (const n of nums) {
      const idx = Math.min(bins - 1, Math.floor((n - min) / width));
      buckets[idx].count++;
    }
    return buckets;
  }, [dataset, column]);

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="bin" stroke="var(--muted-foreground)" fontSize={10} />
        <YAxis stroke="var(--muted-foreground)" fontSize={10} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--muted)" }} />
        <Bar dataKey="count" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CategoryBar({
  profile,
}: {
  profile: ColumnProfile;
}) {
  const data = (profile.topValues ?? []).slice(0, 10).map((v) => ({
    name: v.value.length > 20 ? v.value.slice(0, 20) + "…" : v.value,
    count: v.count,
  }));
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" stroke="var(--muted-foreground)" fontSize={10} />
        <YAxis
          type="category"
          dataKey="name"
          stroke="var(--muted-foreground)"
          fontSize={10}
          width={110}
        />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--muted)" }} />
        <Bar dataKey="count" fill="var(--chart-2)" radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CategoryPie({ profile }: { profile: ColumnProfile }) {
  const data = (profile.topValues ?? []).slice(0, 6).map((v) => ({
    name: v.value.length > 14 ? v.value.slice(0, 14) + "…" : v.value,
    value: v.count,
  }));
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={2}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function ScatterPlot({
  rows,
  x,
  y,
}: {
  rows: Row[];
  x: string;
  y: string;
}) {
  const data = useMemo(
    () =>
      rows
        .filter((r) => typeof r[x] === "number" && typeof r[y] === "number")
        .slice(0, 2000)
        .map((r) => ({ x: r[x] as number, y: r[y] as number })),
    [rows, x, y],
  );
  return (
    <ResponsiveContainer width="100%" height={260}>
      <ScatterChart>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
        <XAxis dataKey="x" name={x} stroke="var(--muted-foreground)" fontSize={10} />
        <YAxis dataKey="y" name={y} stroke="var(--muted-foreground)" fontSize={10} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ strokeDasharray: "3 3" }} />
        <Scatter data={data} fill="var(--chart-1)" fillOpacity={0.6} />
      </ScatterChart>
    </ResponsiveContainer>
  );
}

export function BoxPlotBadge({ profile }: { profile: ColumnProfile }) {
  const { min = 0, q1 = 0, median = 0, q3 = 0, max = 0 } = profile;
  const span = max - min || 1;
  const pos = (v: number) => `${((v - min) / span) * 100}%`;
  return (
    <div className="px-2 pt-4 pb-2">
      <div className="relative h-10">
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border" />
        <div
          className="absolute top-1/2 h-6 -translate-y-1/2 rounded-md bg-primary/25 border border-primary/40"
          style={{ left: pos(q1), width: `calc(${pos(q3)} - ${pos(q1)})` }}
        />
        <div
          className="absolute top-1/2 h-6 w-0.5 -translate-y-1/2 bg-primary"
          style={{ left: pos(median) }}
        />
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
        <span>{min.toFixed(2)}</span>
        <span>{median.toFixed(2)}</span>
        <span>{max.toFixed(2)}</span>
      </div>
    </div>
  );
}

export function CorrelationHeatmap({
  columns,
  matrix,
}: {
  columns: string[];
  matrix: number[][];
}) {
  if (columns.length === 0) {
    return (
      <div className="rounded-xl bg-muted/40 p-8 text-center text-sm text-muted-foreground">
        Need at least two numeric columns for correlations.
      </div>
    );
  }
  const cell = (r: number) => {
    const intensity = Math.min(1, Math.abs(r));
    const color = r >= 0 ? "34, 197, 94" : "239, 68, 68";
    return `rgba(${color}, ${0.15 + intensity * 0.55})`;
  };
  return (
    <div className="overflow-x-auto">
      <div
        className="inline-grid gap-0.5"
        style={{
          gridTemplateColumns: `120px repeat(${columns.length}, minmax(64px, 1fr))`,
        }}
      >
        <div />
        {columns.map((c) => (
          <div
            key={c}
            className="truncate px-1 pb-1 text-[10px] font-medium text-muted-foreground"
            title={c}
          >
            {c}
          </div>
        ))}
        {columns.map((row, i) => (
          <>
            <div
              key={`h-${row}`}
              className="truncate pr-2 text-right text-[11px] font-medium text-muted-foreground"
              title={row}
            >
              {row}
            </div>
            {columns.map((_, j) => (
              <div
                key={`${i}-${j}`}
                className="grid h-10 place-items-center rounded-md text-[10px] font-semibold text-foreground"
                style={{ background: cell(matrix[i][j]) }}
                title={`r = ${matrix[i][j].toFixed(3)}`}
              >
                {matrix[i][j].toFixed(2)}
              </div>
            ))}
          </>
        ))}
      </div>
    </div>
  );
}

export function TrendLine({
  rows,
  x,
  y,
}: {
  rows: Row[];
  x: string;
  y: string;
}) {
  const data = useMemo(() => {
    const pts = rows
      .map((r) => {
        const t = r[x];
        const v = r[y];
        const time = typeof t === "string" ? Date.parse(t) : typeof t === "number" ? t : NaN;
        return typeof v === "number" && Number.isFinite(v) && Number.isFinite(time)
          ? { t: time, v }
          : null;
      })
      .filter((p): p is { t: number; v: number } => p !== null)
      .sort((a, b) => a.t - b.t)
      .slice(0, 500);
    return pts.map((p) => ({
      label: new Date(p.t).toLocaleDateString(),
      value: p.v,
    }));
  }, [rows, x, y]);
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={10} />
        <YAxis stroke="var(--muted-foreground)" fontSize={10} />
        <Tooltip contentStyle={tooltipStyle} />
        <Line
          type="monotone"
          dataKey="value"
          stroke="var(--chart-1)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
