import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { LoadingState } from "@/components/loading-state";
import { useDataset } from "@/hooks/use-dataset";
import { summarize } from "@/lib/dataset";
import { generateInsights } from "@/lib/insights";
import { exportPdfReport, exportSummaryCsv } from "@/lib/exporters";
import { FileText, Download, Sparkles, Brain, BarChart3 } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/report/$id")({
  head: ({ params }) => ({
    meta: [{ title: `Report — ${params.id.slice(0, 8)} — AI Dataset Detective` }],
  }),
  component: ReportDetail,
});

function NotFoundReport() {
  return (
    <AppShell>
      <div className="glass rounded-3xl p-12 text-center">
        <h2 className="font-display text-2xl font-bold">Dataset not found</h2>
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

function ReportDetail() {
  const params = Route.useParams();
  const { dataset, loading } = useDataset(params.id);
  const analysis = useMemo(() => {
    if (!dataset) return null;
    const s = summarize(dataset);
    return { summary: s, insights: generateInsights(dataset, s) };
  }, [dataset]);

  if (loading) return <LoadingState label="Preparing report…" />;
  if (!dataset || !analysis) return <NotFoundReport />;
  const { summary, insights } = analysis;

  const download = () => {
    try {
      exportPdfReport(dataset);
      toast.success("PDF report downloaded.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to export PDF");
    }
  };

  return (
    <AppShell>
      <header className="mb-8 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Report</div>
          <h1 className="truncate font-display text-2xl font-bold md:text-3xl">
            {dataset.name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Generated {new Date().toLocaleString()}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/dashboard/$id"
            params={{ id: dataset.id }}
            className="glass inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium hover:bg-white/5"
          >
            <BarChart3 className="h-3.5 w-3.5" /> Dashboard
          </Link>
          <Link
            to="/insights/$id"
            params={{ id: dataset.id }}
            className="glass inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium hover:bg-white/5"
          >
            <Brain className="h-3.5 w-3.5" /> Insights
          </Link>
          <button
            onClick={() => {
              exportSummaryCsv(dataset);
              toast.success("CSV summary downloaded.");
            }}
            className="glass inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium hover:bg-white/5"
          >
            <Download className="h-3.5 w-3.5" /> CSV
          </button>
          <button
            onClick={download}
            className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-glow)]"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Download className="h-3.5 w-3.5" /> Download PDF
          </button>
        </div>
      </header>

      {/* Preview */}
      <div className="glass overflow-hidden rounded-3xl">
        <div
          className="flex items-center justify-between p-6 text-white"
          style={{ background: "var(--gradient-primary)" }}
        >
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm opacity-90">AI Dataset Detective</div>
              <div className="font-display text-xl font-bold">EDA Report</div>
            </div>
          </div>
          <FileText className="h-6 w-6 opacity-90" />
        </div>

        <div className="space-y-6 p-6 text-sm">
          <Block title="Dataset summary">
            <dl className="grid grid-cols-2 gap-y-2 md:grid-cols-4">
              <Kv k="Rows" v={summary.rowCount.toLocaleString()} />
              <Kv k="Columns" v={String(summary.colCount)} />
              <Kv k="Missing" v={summary.missingCells.toLocaleString()} />
              <Kv k="Duplicates" v={summary.duplicateRows.toLocaleString()} />
              <Kv k="Numeric" v={String(summary.numericCols.length)} />
              <Kv k="Categorical" v={String(summary.categoricalCols.length)} />
              <Kv k="Datetime" v={String(summary.datetimeCols.length)} />
            </dl>
          </Block>

          <Block title="Executive summary">
            <Bullets items={insights.summary} />
          </Block>

          <Block title="Patterns & correlations">
            <Bullets items={[...insights.patterns, ...insights.correlations]} />
          </Block>

          <Block title="Potential anomalies">
            <Bullets items={insights.anomalies} />
          </Block>

          <Block title="ML recommendation">
            <ul className="space-y-3">
              {insights.ml.map((m) => (
                <li key={m.task} className="rounded-xl border border-border/50 bg-muted/30 p-3">
                  <div className="font-display text-sm font-semibold">
                    {m.task}
                    {m.target ? ` — target: ${m.target}` : ""}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Algorithms: {m.algorithms.join(", ")}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{m.reason}</div>
                </li>
              ))}
            </ul>
          </Block>

          <Block title="Cleaning suggestions">
            <Bullets items={insights.cleaning} />
          </Block>
        </div>
      </div>
    </AppShell>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="font-display text-base font-semibold">{title}</h3>
      <div className="mt-2 text-muted-foreground">{children}</div>
    </section>
  );
}

function Kv({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-widest text-muted-foreground">{k}</dt>
      <dd className="font-display text-base font-semibold text-foreground">{v}</dd>
    </div>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5 text-sm">
      {items.map((i, k) => (
        <li key={k} className="flex gap-2">
          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
          <span>{i}</span>
        </li>
      ))}
    </ul>
  );
}
