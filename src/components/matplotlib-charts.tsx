import { useEffect, useMemo, useRef, useState } from "react";
import type { Dataset, DatasetSummary } from "@/lib/dataset";
import {
  drawHistogram,
  drawScatter,
  drawLine,
  drawBar,
  drawPie,
  drawBoxPlot,
  downloadCanvasPng,
  type ChartKind,
} from "@/lib/visualization-service";
import { Download, ImageDown } from "lucide-react";
import { toast } from "sonner";

interface ChartSpec {
  key: string;
  kind: ChartKind;
  title: string;
  filename: string;
  render: () => HTMLCanvasElement;
}

export function MatplotlibChartsSection({
  dataset,
  summary,
}: {
  dataset: Dataset;
  summary: DatasetSummary;
}) {
  const charts = useMemo<ChartSpec[]>(() => {
    const specs: ChartSpec[] = [];
    const num = summary.numericCols;
    const cat = summary.categoricalCols;
    const dt = summary.datetimeCols;
    const base = dataset.name.replace(/[^a-z0-9]+/gi, "_").toLowerCase() || "dataset";

    // Histogram — first numeric column
    if (num[0]) {
      const col = num[0];
      specs.push({
        key: `hist-${col}`,
        kind: "histogram",
        title: `Histogram — ${col}`,
        filename: `${base}_histogram_${col}`,
        render: () =>
          drawHistogram(
            dataset.rows.map((r) => Number(r[col])).filter((n) => Number.isFinite(n)),
            { title: `Distribution of ${col}`, xLabel: col, yLabel: "Frequency" },
          ),
      });
    }

    // Scatter — top correlated numeric pair
    const top = summary.correlations[0];
    if (top) {
      specs.push({
        key: `scatter-${top.a}-${top.b}`,
        kind: "scatter",
        title: `Scatter — ${top.a} vs ${top.b}`,
        filename: `${base}_scatter_${top.a}_${top.b}`,
        render: () =>
          drawScatter(
            dataset.rows.map((r) => Number(r[top.a])),
            dataset.rows.map((r) => Number(r[top.b])),
            { title: `${top.a} vs ${top.b} (r=${top.r.toFixed(3)})`, xLabel: top.a, yLabel: top.b },
          ),
      });
    }

    // Line — datetime x numeric
    if (dt[0] && num[0]) {
      const x = dt[0];
      const y = num[0];
      const sorted = [...dataset.rows]
        .map((r) => {
          const t = r[x];
          const v = Number(r[y]);
          const time = typeof t === "string" ? Date.parse(t) : typeof t === "number" ? t : NaN;
          return { time, v, label: String(t) };
        })
        .filter((p) => Number.isFinite(p.time) && Number.isFinite(p.v))
        .sort((a, b) => a.time - b.time)
        .slice(0, 500);
      specs.push({
        key: `line-${x}-${y}`,
        kind: "line",
        title: `Line — ${y} over ${x}`,
        filename: `${base}_line_${y}_over_${x}`,
        render: () =>
          drawLine(
            sorted.map((p) => new Date(p.time).toLocaleDateString()),
            sorted.map((p) => p.v),
            { title: `${y} over ${x}`, xLabel: x, yLabel: y },
          ),
      });
    }

    // Bar & Pie — first categorical
    if (cat[0]) {
      const col = cat[0];
      const profile = summary.profiles.find((p) => p.name === col);
      const top10 = (profile?.topValues ?? []).slice(0, 10);
      if (top10.length) {
        specs.push({
          key: `bar-${col}`,
          kind: "bar",
          title: `Bar — ${col}`,
          filename: `${base}_bar_${col}`,
          render: () =>
            drawBar(
              top10.map((v) => v.value),
              top10.map((v) => v.count),
              { title: `Top values in ${col}`, xLabel: col, yLabel: "Count" },
            ),
        });
        specs.push({
          key: `pie-${col}`,
          kind: "pie",
          title: `Pie — ${col}`,
          filename: `${base}_pie_${col}`,
          render: () =>
            drawPie(
              top10.slice(0, 6).map((v) => v.value),
              top10.slice(0, 6).map((v) => v.count),
              { title: `Composition of ${col}` },
            ),
        });
      }
    }

    // Box plot — up to 4 numeric columns
    if (num.length >= 1) {
      const cols = num.slice(0, 4);
      specs.push({
        key: `box-${cols.join("-")}`,
        kind: "box",
        title: `Box plot — ${cols.join(", ")}`,
        filename: `${base}_boxplot`,
        render: () =>
          drawBoxPlot(
            cols.map((c) => ({
              label: c,
              values: dataset.rows.map((r) => Number(r[c])).filter((n) => Number.isFinite(n)),
            })),
            { title: "Distribution comparison", yLabel: "Value" },
          ),
      });
    }

    return specs;
  }, [dataset, summary]);

  return (
    <section className="glass mt-6 rounded-3xl p-6">
      <div className="flex items-center gap-2">
        <div
          className="grid h-8 w-8 place-items-center rounded-xl text-primary-foreground"
          style={{ background: "var(--gradient-primary)" }}
        >
          <ImageDown className="h-4 w-4" />
        </div>
        <div>
          <h2 className="font-display text-lg font-semibold">Matplotlib charts</h2>
          <p className="text-xs text-muted-foreground">
            Publication-style analysis charts generated from your dataset. Download each as PNG.
          </p>
        </div>
      </div>

      {charts.length === 0 ? (
        <div className="mt-4 rounded-xl bg-muted/40 p-8 text-center text-sm text-muted-foreground">
          Not enough columns to generate analysis charts.
        </div>
      ) : (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {charts.map((c) => (
            <ChartCard key={c.key} spec={c} />
          ))}
        </div>
      )}
    </section>
  );
}

function ChartCard({ spec }: { spec: ChartSpec }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const c = spec.render();
    setCanvas(c);
    const el = containerRef.current;
    if (el) {
      el.innerHTML = "";
      el.appendChild(c);
    }
  }, [spec]);

  return (
    <div className="rounded-2xl border border-border/50 bg-card/40 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="font-display text-sm font-semibold">{spec.title}</div>
        <button
          onClick={() => {
            if (!canvas) return;
            downloadCanvasPng(canvas, spec.filename);
            toast.success("Chart PNG downloaded.");
          }}
          className="glass inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium transition hover:bg-white/5"
        >
          <Download className="h-3 w-3" /> PNG
        </button>
      </div>
      <div ref={containerRef} className="mt-3 overflow-x-auto rounded-xl bg-[#0B1020]/80 p-2" />
    </div>
  );
}
