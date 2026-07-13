import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useDatasets } from "@/hooks/use-datasets";
import { Brain, Upload } from "lucide-react";

export const Route = createFileRoute("/insights/")({
  head: () => ({ meta: [{ title: "AI Insights — AI Dataset Detective" }] }),
  component: InsightsIndex,
});

function InsightsIndex() {
  const datasets = useDatasets();
  if (datasets.length === 1) {
    return <Navigate to="/insights/$id" params={{ id: datasets[0].id }} />;
  }
  return (
    <AppShell>
      <h1 className="font-display text-3xl font-bold md:text-4xl">AI Insights</h1>
      <p className="mt-2 text-muted-foreground">Choose a dataset to generate insights.</p>
      {datasets.length === 0 ? (
        <EmptyPicker />
      ) : (
        <div className="mt-8 grid gap-3 md:grid-cols-2">
          {datasets.map((d) => (
            <Link
              key={d.id}
              to="/insights/$id"
              params={{ id: d.id }}
              className="glass rounded-2xl p-5 transition hover:shadow-[var(--shadow-glow)]"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary">
                  <Brain className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-display text-base font-semibold">{d.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {d.rows.length.toLocaleString()} rows • {d.columns.length} cols
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}

function EmptyPicker() {
  return (
    <div className="glass mt-8 rounded-3xl p-12 text-center">
      <div
        className="mx-auto grid h-14 w-14 place-items-center rounded-2xl text-primary-foreground"
        style={{ background: "var(--gradient-primary)" }}
      >
        <Brain className="h-7 w-7" />
      </div>
      <h3 className="mt-5 font-display text-xl font-semibold">No datasets to analyze</h3>
      <Link
        to="/upload"
        className="mt-6 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)]"
        style={{ background: "var(--gradient-primary)" }}
      >
        <Upload className="h-4 w-4" /> Upload CSV
      </Link>
    </div>
  );
}
