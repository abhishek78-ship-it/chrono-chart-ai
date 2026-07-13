import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { getDataset } from "@/lib/storage";
import { summarize } from "@/lib/dataset";
import { generateInsights } from "@/lib/insights";
import { useMemo } from "react";
import {
  BookOpen,
  TrendingUp,
  LineChart,
  AlertTriangle,
  Briefcase,
  Lightbulb,
  Wrench,
  Wand2,
  Target,
  ListChecks,
  Brain,
  FileText,
} from "lucide-react";

export const Route = createFileRoute("/insights/$id")({
  head: ({ params }) => ({
    meta: [{ title: `Insights — ${params.id.slice(0, 8)} — AI Dataset Detective` }],
  }),
  component: InsightsDetail,
});

function NotFoundInsights() {
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

function InsightsDetail() {
  const params = Route.useParams();
  const { dataset, loading } = useDataset(params.id);
  const insights = useMemo(() => {
    if (!dataset) return null;
    return generateInsights(dataset, summarize(dataset));
  }, [dataset]);

  if (loading) return <LoadingState label="Generating AI insights…" />;
  if (!dataset || !insights) return <NotFoundInsights />;

  return (
    <AppShell>
      <header className="mb-8 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">
            AI Insights
          </div>
          <h1 className="truncate font-display text-2xl font-bold md:text-3xl">
            {dataset.name}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/dashboard/$id"
            params={{ id: dataset.id }}
            className="glass inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium hover:bg-white/5"
          >
            <Brain className="h-3.5 w-3.5" /> Dashboard
          </Link>
          <Link
            to="/report/$id"
            params={{ id: dataset.id }}
            className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-glow)]"
            style={{ background: "var(--gradient-primary)" }}
          >
            <FileText className="h-3.5 w-3.5" /> Download report
          </Link>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <InsightCard icon={BookOpen} title="Executive summary" items={insights.summary} accent="primary" />
        <InsightCard icon={TrendingUp} title="Patterns" items={insights.patterns} accent="accent" />
        <InsightCard icon={LineChart} title="Correlations" items={insights.correlations} accent="primary" />
        <InsightCard
          icon={AlertTriangle}
          title="Potential anomalies"
          items={insights.anomalies}
          accent="warning"
        />
        <InsightCard icon={Briefcase} title="Business insights" items={insights.business} accent="primary" />
        <InsightCard icon={Lightbulb} title="Possible use cases" items={insights.useCases} accent="accent" />
      </div>

      {/* ML recommendations */}
      <section className="mt-6">
        <div className="mb-3 flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          <h2 className="font-display text-lg font-semibold">ML recommendations</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {insights.ml.map((rec) => (
            <div key={rec.task} className="glass rounded-2xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">
                    {rec.task}
                  </div>
                  {rec.target && (
                    <div className="mt-1 font-display text-lg font-semibold">
                      Target: <span className="gradient-text">{rec.target}</span>
                    </div>
                  )}
                </div>
                <div
                  className="grid h-9 w-9 place-items-center rounded-xl text-primary-foreground"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  <Wand2 className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {rec.algorithms.map((a) => (
                  <span
                    key={a}
                    className="rounded-full bg-primary/15 px-2.5 py-0.5 text-[11px] font-medium text-primary"
                  >
                    {a}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-sm text-muted-foreground">{rec.reason}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Cleaning + FE */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <InsightCard icon={Wrench} title="Data cleaning" items={insights.cleaning} accent="warning" />
        <InsightCard
          icon={Wand2}
          title="Feature engineering"
          items={insights.featureEngineering}
          accent="accent"
        />
      </div>

      <section className="glass mt-6 rounded-3xl p-6">
        <div className="mb-4 flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-primary" />
          <h2 className="font-display text-lg font-semibold">Model prep checklist</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <TagGroup title="Columns to remove" items={insights.columnsToRemove} tone="danger" />
          <TagGroup title="Columns to encode" items={insights.columnsToEncode} tone="accent" />
          <TagGroup title="Columns to scale" items={insights.columnsToScale} tone="primary" />
          <TagGroup title="Possible targets" items={insights.possibleTargets} tone="success" />
        </div>
      </section>

      <section className="glass mt-6 rounded-3xl p-6">
        <div className="mb-4 flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-primary" />
          <h2 className="font-display text-lg font-semibold">Next steps</h2>
        </div>
        <ol className="space-y-2 text-sm text-muted-foreground">
          {insights.nextSteps.map((s, i) => (
            <li key={i} className="flex gap-3">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                {i + 1}
              </span>
              <span className="pt-0.5">{s}</span>
            </li>
          ))}
        </ol>
      </section>
    </AppShell>
  );
}

function InsightCard({
  icon: Icon,
  title,
  items,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  items: string[];
  accent: "primary" | "accent" | "warning";
}) {
  const bg =
    accent === "warning"
      ? "bg-warning/15 text-warning"
      : accent === "accent"
        ? "bg-accent/15 text-accent"
        : "bg-primary/15 text-primary";
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center gap-2">
        <div className={"grid h-8 w-8 place-items-center rounded-lg " + bg}>
          <Icon className="h-4 w-4" />
        </div>
        <h3 className="font-display text-base font-semibold">{title}</h3>
      </div>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TagGroup({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "primary" | "danger" | "accent" | "success";
}) {
  const cls =
    tone === "danger"
      ? "bg-destructive/15 text-destructive"
      : tone === "accent"
        ? "bg-accent/15 text-accent"
        : tone === "success"
          ? "bg-success/15 text-success"
          : "bg-primary/15 text-primary";
  return (
    <div className="rounded-2xl border border-border/50 bg-card/40 p-4">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">
        {title}
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {items.length === 0 ? (
          <span className="text-xs text-muted-foreground">None</span>
        ) : (
          items.map((c) => (
            <span key={c} className={"rounded-full px-2.5 py-0.5 text-[11px] font-medium " + cls}>
              {c}
            </span>
          ))
        )}
      </div>
    </div>
  );
}
