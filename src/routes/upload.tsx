import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useCallback, useRef, useState } from "react";
import { parseCsvFile, formatBytes, type Dataset } from "@/lib/dataset";
import { saveDataset } from "@/lib/storage";
import { toast } from "sonner";
import { Upload, FileSpreadsheet, X, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/upload")({
  head: () => ({
    meta: [
      { title: "Upload dataset — AI Dataset Detective" },
      {
        name: "description",
        content: "Drop a CSV file to instantly analyze it with AI-powered EDA.",
      },
    ],
  }),
  component: UploadPage,
});

function UploadPage() {
  const navigate = useNavigate();
  const [dragging, setDragging] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setDataset(null);
    if (!file.name.toLowerCase().endsWith(".csv") && file.type !== "text/csv") {
      setError("Only CSV files are supported.");
      toast.error("Please upload a CSV file.");
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      setError("File is larger than 100MB. Please upload a smaller file.");
      toast.error("File too large.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.warning("Large file — parsing may take a few seconds.");
    }
    setParsing(true);
    try {
      const ds = await parseCsvFile(file);
      setDataset(ds);
      toast.success(`Parsed ${ds.rows.length.toLocaleString()} rows.`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to parse CSV.";
      setError(msg);
      toast.error(msg);
    } finally {
      setParsing(false);
    }
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const analyze = () => {
    if (!dataset) return;
    saveDataset(dataset);
    toast.success("Dataset saved. Opening dashboard…");
    navigate({ to: "/dashboard/$id", params: { id: dataset.id } });
  };

  return (
    <AppShell>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold md:text-4xl">Upload Dataset</h1>
        <p className="mt-2 text-muted-foreground">
          Drop a CSV file or browse from your device. Everything runs locally in your browser.
        </p>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "glass relative flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 text-center transition",
          dragging
            ? "border-primary bg-primary/5 shadow-[var(--shadow-glow)]"
            : "border-border/60 hover:border-primary/60 hover:bg-primary/5",
        )}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        <div
          className="grid h-16 w-16 place-items-center rounded-2xl text-primary-foreground"
          style={{ background: "var(--gradient-primary)" }}
        >
          {parsing ? <Loader2 className="h-8 w-8 animate-spin" /> : <Upload className="h-8 w-8" />}
        </div>
        <h3 className="mt-6 font-display text-xl font-semibold">
          {parsing ? "Parsing your file…" : "Drop your CSV here"}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {parsing ? "Reading and profiling every column." : "or click to browse — max 100MB"}
        </p>
      </div>

      {error && (
        <div className="glass mt-6 flex items-center gap-3 rounded-2xl border-destructive/40 p-4 text-sm text-destructive">
          <X className="h-4 w-4" />
          {error}
        </div>
      )}

      {dataset && (
        <div className="glass mt-8 rounded-3xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
                <FileSpreadsheet className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <div className="truncate font-display text-lg font-semibold">
                  {dataset.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatBytes(dataset.fileSize)} • parsed successfully
                </div>
              </div>
            </div>
            <button
              onClick={analyze}
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition hover:scale-[1.02]"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Sparkles className="h-4 w-4" /> Analyze Dataset
            </button>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
            <Stat label="Rows" value={dataset.rows.length.toLocaleString()} />
            <Stat label="Columns" value={String(dataset.columns.length)} />
            <Stat label="Size" value={formatBytes(dataset.fileSize)} />
          </div>

          <div className="mt-6">
            <div className="mb-3 text-sm font-medium">Preview — first 10 rows</div>
            <div className="glass overflow-x-auto rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 text-muted-foreground">
                  <tr>
                    {dataset.columns.map((c) => (
                      <th key={c} className="whitespace-nowrap px-3 py-2 font-medium">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dataset.rows.slice(0, 10).map((r, i) => (
                    <tr key={i} className="border-t border-border/40">
                      {dataset.columns.map((c) => (
                        <td key={c} className="whitespace-nowrap px-3 py-2">
                          {r[c] === null || r[c] === undefined ? (
                            <span className="text-muted-foreground/60 italic">null</span>
                          ) : (
                            String(r[c])
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-muted/40 p-4">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-display text-xl font-bold">{value}</div>
    </div>
  );
}
