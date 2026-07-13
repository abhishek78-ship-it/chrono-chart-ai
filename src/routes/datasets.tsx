import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useDatasets } from "@/hooks/use-datasets";
import { deleteDataset, renameDataset } from "@/lib/storage";
import { formatBytes } from "@/lib/dataset";
import {
  Database,
  Trash2,
  Pencil,
  Search,
  Upload,
  BarChart3,
  Brain,
  FileText,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/datasets")({
  head: () => ({
    meta: [
      { title: "Your datasets — AI Dataset Detective" },
      {
        name: "description",
        content: "Browse, search, rename, and analyze your uploaded CSV datasets.",
      },
    ],
  }),
  component: DatasetsPage,
});

function DatasetsPage() {
  const datasets = useDatasets();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return datasets;
    return datasets.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.columns.some((c) => c.toLowerCase().includes(q)),
    );
  }, [datasets, query]);

  return (
    <AppShell>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold md:text-4xl">Your Datasets</h1>
          <p className="mt-2 text-muted-foreground">
            {datasets.length} dataset{datasets.length === 1 ? "" : "s"} stored locally.
          </p>
        </div>
        <Link
          to="/upload"
          className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition hover:scale-[1.02]"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Upload className="h-4 w-4" /> Upload new
        </Link>
      </div>

      <div className="glass mb-6 flex items-center gap-3 rounded-2xl px-4 py-2.5">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search datasets or columns…"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      {datasets.length === 0 ? (
        <EmptyState />
      ) : filtered.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center text-muted-foreground">
          No datasets match “{query}”.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((d) => (
            <div key={d.id} className="glass group rounded-2xl p-5 transition hover:shadow-[var(--shadow-glow)]">
              <div className="flex items-start justify-between gap-3">
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
                <div className="flex gap-1">
                  <IconBtn
                    icon={Pencil}
                    label="Rename"
                    onClick={() => {
                      const next = window.prompt("Rename dataset", d.name);
                      if (next) {
                        renameDataset(d.id, next);
                        toast.success("Renamed.");
                      }
                    }}
                  />
                  <IconBtn
                    icon={Trash2}
                    label="Delete"
                    danger
                    onClick={() => {
                      if (window.confirm(`Delete "${d.name}"? This cannot be undone.`)) {
                        deleteDataset(d.id);
                        toast.success("Deleted.");
                      }
                    }}
                  />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {d.columns.slice(0, 6).map((c) => (
                  <span
                    key={c}
                    className="rounded-full bg-muted/60 px-2.5 py-0.5 text-[11px] text-muted-foreground"
                  >
                    {c}
                  </span>
                ))}
                {d.columns.length > 6 && (
                  <span className="rounded-full bg-muted/60 px-2.5 py-0.5 text-[11px] text-muted-foreground">
                    +{d.columns.length - 6} more
                  </span>
                )}
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <ActionLink to="/dashboard/$id" id={d.id} icon={BarChart3} label="Dashboard" />
                <ActionLink to="/insights/$id" id={d.id} icon={Brain} label="Insights" />
                <ActionLink to="/report/$id" id={d.id} icon={FileText} label="Report" />
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}

function ActionLink({
  to,
  id,
  icon: Icon,
  label,
}: {
  to: "/dashboard/$id" | "/insights/$id" | "/report/$id";
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link
      to={to}
      params={{ id }}
      className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-3 py-1.5 text-xs font-medium text-foreground/80 transition hover:bg-primary/15 hover:text-primary"
    >
      <Icon className="h-3.5 w-3.5" /> {label}
    </Link>
  );
}

function IconBtn({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={
        "grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted " +
        (danger ? "hover:text-destructive" : "hover:text-foreground")
      }
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

function EmptyState() {
  return (
    <div className="glass rounded-3xl p-12 text-center">
      <div
        className="mx-auto grid h-14 w-14 place-items-center rounded-2xl text-primary-foreground"
        style={{ background: "var(--gradient-primary)" }}
      >
        <Database className="h-7 w-7" />
      </div>
      <h3 className="mt-5 font-display text-xl font-semibold">No datasets yet</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Upload your first CSV to get started with instant AI-powered analysis.
      </p>
      <Link
        to="/upload"
        className="mt-6 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition hover:scale-[1.02]"
        style={{ background: "var(--gradient-primary)" }}
      >
        <Upload className="h-4 w-4" /> Upload CSV
      </Link>
    </div>
  );
}
