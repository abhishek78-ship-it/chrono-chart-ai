import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useDatasets } from "@/hooks/use-datasets";
import { Database, ArrowRight, Upload } from "lucide-react";
import { formatBytes } from "@/lib/dataset";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({
    meta: [{ title: "Dashboard — AI Dataset Detective" }],
  }),
  component: DashboardIndex,
});

function DashboardIndex() {
  const datasets = useDatasets();
  if (datasets.length === 1) {
    return <Navigate to="/dashboard/$id" params={{ id: datasets[0].id }} />;
  }
  return (
    <AppShell>
      <h1 className="font-display text-3xl font-bold md:text-4xl">Dashboard</h1>
      <p className="mt-2 text-muted-foreground">Pick a dataset to explore.</p>

      {datasets.length === 0 ? (
        <div className="glass mt-8 rounded-3xl p-12 text-center">
          <div
            className="mx-auto grid h-14 w-14 place-items-center rounded-2xl text-primary-foreground"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Database className="h-7 w-7" />
          </div>
          <h3 className="mt-5 font-display text-xl font-semibold">No datasets yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Upload a CSV to build your first analytics dashboard.
          </p>
          <Link
            to="/upload"
            className="mt-6 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)]"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Upload className="h-4 w-4" /> Upload CSV
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-3 md:grid-cols-2">
          {datasets.map((d) => (
            <Link
              key={d.id}
              to="/dashboard/$id"
              params={{ id: d.id }}
              className="glass group flex items-center justify-between rounded-2xl p-5 transition hover:shadow-[var(--shadow-glow)]"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
                  <Database className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="truncate font-display text-base font-semibold">
                    {d.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {d.rows.length.toLocaleString()} rows • {d.columns.length} cols •{" "}
                    {formatBytes(d.fileSize)}
                  </div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}
