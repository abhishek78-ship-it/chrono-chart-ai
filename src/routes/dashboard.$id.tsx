import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { getDataset } from "@/lib/storage";
import { summarize, formatBytes, formatNumber } from "@/lib/dataset";
import { useMemo, useState } from "react";
import {
  Rows3,
  Columns3,
  AlertTriangle,
  Copy,
  HardDrive,
  Hash,
  Tag,
  Download,
  Brain,
  FileText,
  Search,
} from "lucide-react";
import {
  Histogram,
  CategoryBar,
  CategoryPie,
  ScatterPlot,
  BoxPlotBadge,
  CorrelationHeatmap,
  TrendLine,
} from "@/components/charts";
import { toast } from "sonner";
import { exportSummaryCsv } from "@/lib/exporters";

export const Route = createFileRoute("/dashboard/$id")({
  head: ({ params }) => ({
    meta: [{ title: `Dashboard — ${params.id.slice(0, 8)} — AI Dataset Detective` }],
  }),
  component: DashboardDetail,
});

function NotFoundDataset() {
  return (
    <AppShell>
      <div className="glass rounded-3xl p-12 text-center">
        <h2 className="font-display text-2xl font-bold">Dataset not found</h2>
        <p className="mt-2 text-muted-foreground">
          It may have been deleted or the link is invalid.
        </p>
        <Link
          to="/datasets"
          className="mt-6 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          style={{ background: "var(--gradient-primary)" }}
        >
          Back to datasets
        </Link>
      </div>
    </AppShell>
  );
}

function DashboardDetail() {
  const params = Route.useParams();
  const { dataset, loading } = useDataset(params.id);
  const summary = useMemo(() => (dataset ? summarize(dataset) : null), [dataset]);
  const [columnQuery, setColumnQuery] = useState("");

  const corrMatrix = useMemo(() => {
    if (!summary) return [] as number[][];
    const cols = summary.numericCols;
    const map: Record<string, Record<string, number>> = {};
    for (const c of cols) map[c] = {};
    for (const c of cols) map[c][c] = 1;
    for (const { a, b, r } of summary.correlations) {
      map[a][b] = r;
      map[b][a] = r;
    }
    return cols.map((c) => cols.map((c2) => map[c][c2] ?? 0));
  }, [summary]);

  const scatterPair = useMemo(() => {
    if (!summary || summary.correlations.length === 0) return null;
    const top = summary.correlations[0];
    return { x: top.a, y: top.b, r: top.r };
  }, [summary]);

  const trendPair = useMemo(() => {
    if (!summary || summary.datetimeCols.length === 0 || summary.numericCols.length === 0)
      return null;
    return { x: summary.datetimeCols[0], y: summary.numericCols[0] };
  }, [summary]);

  if (loading) return <LoadingState />;
  if (!dataset || !summary) return <NotFoundDataset />;

  const filteredProfiles = summary.profiles.filter((p) =>
    p.name.toLowerCase().includes(columnQuery.trim().toLowerCase()),
  );

  const corrMatrix = useMemo(() => {
    const cols = summary.numericCols;
    const map: Record<string, Record<string, number>> = {};
    for (const c of cols) map[c] = {};
    for (const c of cols) map[c][c] = 1;
    for (const { a, b, r } of summary.correlations) {
      map[a][b] = r;
      map[b][a] = r;
    }
    return cols.map((c) => cols.map((c2) => map[c][c2] ?? 0));
  }, [summary]);

  const scatterPair = useMemo(() => {
    if (summary.correlations.length === 0) return null;
    const top = summary.correlations[0];
    return { x: top.a, y: top.b, r: top.r };
  }, [summary]);

  const trendPair = useMemo(() => {
    if (summary.datetimeCols.length === 0 || summary.numericCols.length === 0) return null;
    return { x: summary.datetimeCols[0], y: summary.numericCols[0] };
  }, [summary]);

  return (
    <AppShell>
      <header className="mb-8 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Dashboard</div>
          <h1 className="truncate font-display text-2xl font-bold md:text-3xl">
            {dataset.name}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              exportSummaryCsv(dataset);
              toast.success("Summary CSV downloaded.");
            }}
            className="glass inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium transition hover:bg-white/5"
          >
            <Download className="h-3.5 w-3.5" /> CSV summary
          </button>
          <Link
            to="/insights/$id"
            params={{ id: dataset.id }}
            className="glass inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium transition hover:bg-white/5"
          >
            <Brain className="h-3.5 w-3.5" /> Insights
          </Link>
          <Link
            to="/report/$id"
            params={{ id: dataset.id }}
            className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-glow)]"
            style={{ background: "var(--gradient-primary)" }}
          >
            <FileText className="h-3.5 w-3.5" /> Report
          </Link>
        </div>
      </header>

      {/* Top metrics */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        <Metric icon={Rows3} label="Rows" value={summary.rowCount.toLocaleString()} />
        <Metric icon={Columns3} label="Columns" value={String(summary.colCount)} />
        <Metric
          icon={AlertTriangle}
          label="Missing"
          value={summary.missingCells.toLocaleString()}
          tone={summary.missingCells > 0 ? "warning" : "success"}
        />
        <Metric
          icon={Copy}
          label="Duplicates"
          value={summary.duplicateRows.toLocaleString()}
          tone={summary.duplicateRows > 0 ? "warning" : "success"}
        />
        <Metric icon={HardDrive} label="Size" value={formatBytes(summary.memoryBytes)} />
        <Metric icon={Hash} label="Numeric" value={String(summary.numericCols.length)} />
        <Metric icon={Tag} label="Categorical" value={String(summary.categoricalCols.length)} />
      </div>

      {/* Correlation heatmap */}
      <section className="glass mt-6 rounded-3xl p-6">
        <SectionHead
          title="Correlation matrix"
          subtitle="Pearson correlations between numeric columns."
        />
        <div className="mt-4">
          <CorrelationHeatmap columns={summary.numericCols} matrix={corrMatrix} />
        </div>
      </section>

      {/* Scatter for top correlation */}
      {scatterPair && (
        <section className="glass mt-6 rounded-3xl p-6">
          <SectionHead
            title={`Strongest relationship — ${scatterPair.x} vs ${scatterPair.y}`}
            subtitle={`Pearson r = ${scatterPair.r.toFixed(3)}`}
          />
          <ScatterPlot rows={dataset.rows} x={scatterPair.x} y={scatterPair.y} />
        </section>
      )}

      {/* Trend line for time */}
      {trendPair && (
        <section className="glass mt-6 rounded-3xl p-6">
          <SectionHead
            title={`Trend — ${trendPair.y} over ${trendPair.x}`}
            subtitle="Latest 500 sorted observations."
          />
          <TrendLine rows={dataset.rows} x={trendPair.x} y={trendPair.y} />
        </section>
      )}

      {/* Column explorer */}
      <section className="glass mt-6 rounded-3xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SectionHead title="Columns" subtitle="Statistics and distributions for every column." />
          <div className="glass flex items-center gap-2 rounded-full px-3 py-1.5 text-sm">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={columnQuery}
              onChange={(e) => setColumnQuery(e.target.value)}
              placeholder="Search columns…"
              className="w-40 bg-transparent outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {filteredProfiles.map((p) => (
            <div key={p.name} className="rounded-2xl border border-border/50 bg-card/40 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate font-display text-sm font-semibold">{p.name}</div>
                  <div className="mt-0.5 text-[11px] uppercase tracking-widest text-muted-foreground">
                    {p.type}
                  </div>
                </div>
                <div className="text-right text-[11px] text-muted-foreground">
                  <div>{p.unique.toLocaleString()} unique</div>
                  <div>{p.missingPct.toFixed(1)}% missing</div>
                </div>
              </div>

              {p.type === "numeric" ? (
                <>
                  <div className="mt-3 grid grid-cols-4 gap-2 text-center text-[10px]">
                    <MiniStat label="Mean" value={formatNumber(p.mean)} />
                    <MiniStat label="Median" value={formatNumber(p.median)} />
                    <MiniStat label="Std" value={formatNumber(p.std)} />
                    <MiniStat label="Mode" value={formatNumber(p.mode as number | undefined)} />
                    <MiniStat label="Min" value={formatNumber(p.min)} />
                    <MiniStat label="Q1" value={formatNumber(p.q1)} />
                    <MiniStat label="Q3" value={formatNumber(p.q3)} />
                    <MiniStat label="Max" value={formatNumber(p.max)} />
                  </div>
                  <div className="mt-3">
                    <Histogram dataset={dataset} column={p.name} />
                  </div>
                  <BoxPlotBadge profile={p} />
                </>
              ) : p.type === "boolean" || p.unique <= 6 ? (
                <div className="mt-3">
                  <CategoryPie profile={p} />
                </div>
              ) : (
                <div className="mt-3">
                  <CategoryBar profile={p} />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Data types table */}
      <section className="glass mt-6 rounded-3xl p-6">
        <SectionHead title="Data quality" subtitle="Types, missing values and cardinality." />
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">Column</th>
                <th className="px-3 py-2 font-medium">Type</th>
                <th className="px-3 py-2 font-medium">Missing</th>
                <th className="px-3 py-2 font-medium">Missing %</th>
                <th className="px-3 py-2 font-medium">Unique</th>
              </tr>
            </thead>
            <tbody>
              {summary.profiles.map((p) => (
                <tr key={p.name} className="border-t border-border/40">
                  <td className="px-3 py-2 font-medium">{p.name}</td>
                  <td className="px-3 py-2 text-muted-foreground">{p.type}</td>
                  <td className="px-3 py-2">{p.missing.toLocaleString()}</td>
                  <td className="px-3 py-2">
                    <span
                      className={
                        p.missingPct > 20
                          ? "text-destructive"
                          : p.missingPct > 0
                            ? "text-warning"
                            : "text-success"
                      }
                    >
                      {p.missingPct.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-3 py-2">{p.unique.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone?: "success" | "warning";
}) {
  const toneClass =
    tone === "warning"
      ? "text-warning"
      : tone === "success"
        ? "text-success"
        : "text-primary";
  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
          {label}
        </div>
        <Icon className={"h-4 w-4 " + toneClass} />
      </div>
      <div className="mt-2 truncate font-display text-xl font-bold">{value}</div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/40 px-1.5 py-1">
      <div className="text-[9px] uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
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
