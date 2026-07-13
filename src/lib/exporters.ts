import type { Dataset } from "./dataset";
import { summarize } from "./dataset";
import { generateInsights } from "./insights";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportSummaryCsv(dataset: Dataset) {
  const s = summarize(dataset);
  const header = [
    "column",
    "type",
    "missing",
    "missing_pct",
    "unique",
    "mean",
    "median",
    "std",
    "min",
    "max",
  ];
  const rows = s.profiles.map((p) => [
    p.name,
    p.type,
    p.missing,
    p.missingPct.toFixed(2),
    p.unique,
    p.mean ?? "",
    p.median ?? "",
    p.std ?? "",
    p.min ?? "",
    p.max ?? "",
  ]);
  const csv =
    [header, ...rows]
      .map((r) =>
        r
          .map((v) => {
            const str = String(v);
            return /[,"\n]/.test(str) ? `"${str.replaceAll('"', '""')}"` : str;
          })
          .join(","),
      )
      .join("\n") + "\n";
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  triggerDownload(blob, `${dataset.name}-summary.csv`);
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function exportPdfReport(dataset: Dataset) {
  const s = summarize(dataset);
  const insights = generateInsights(dataset, s);
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  let y = margin;

  // Header
  doc.setFillColor(30, 30, 60);
  doc.rect(0, 0, pageWidth, 90, "F");
  doc.setTextColor(255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("AI Dataset Detective", margin, 45);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("Automated Exploratory Data Analysis Report", margin, 65);
  y = 120;

  doc.setTextColor(20);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(dataset.name, margin, y);
  y += 18;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(90);
  doc.text(`Generated: ${new Date().toLocaleString()}`, margin, y);
  y += 20;

  // Dataset summary
  section(doc, "Dataset Summary", y);
  y += 20;
  autoTable(doc, {
    startY: y,
    theme: "grid",
    styles: { fontSize: 10 },
    head: [["Metric", "Value"]],
    body: [
      ["Rows", s.rowCount.toLocaleString()],
      ["Columns", String(s.colCount)],
      ["Missing cells", s.missingCells.toLocaleString()],
      ["Duplicate rows", s.duplicateRows.toLocaleString()],
      ["Numeric columns", String(s.numericCols.length)],
      ["Categorical columns", String(s.categoricalCols.length)],
      ["Datetime columns", String(s.datetimeCols.length)],
    ],
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 24;

  // Statistics
  section(doc, "Column Statistics", y);
  y += 14;
  autoTable(doc, {
    startY: y,
    theme: "striped",
    styles: { fontSize: 9 },
    head: [["Column", "Type", "Missing %", "Unique", "Mean", "Median", "Std", "Min", "Max"]],
    body: s.profiles.map((p) => [
      p.name,
      p.type,
      p.missingPct.toFixed(1),
      p.unique,
      fmt(p.mean),
      fmt(p.median),
      fmt(p.std),
      fmt(p.min),
      fmt(p.max),
    ]),
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 24;

  // Insights
  y = ensureSpace(doc, y, 120);
  section(doc, "AI Insights — Executive Summary", y);
  y += 16;
  y = bullets(doc, insights.summary, y, margin, pageWidth - margin * 2);

  y = ensureSpace(doc, y, 100);
  section(doc, "Patterns & Correlations", y);
  y += 16;
  y = bullets(doc, [...insights.patterns, ...insights.correlations], y, margin, pageWidth - margin * 2);

  y = ensureSpace(doc, y, 100);
  section(doc, "Potential Anomalies", y);
  y += 16;
  y = bullets(doc, insights.anomalies, y, margin, pageWidth - margin * 2);

  y = ensureSpace(doc, y, 120);
  section(doc, "Machine Learning Recommendations", y);
  y += 12;
  for (const m of insights.ml) {
    y = ensureSpace(doc, y, 60);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30);
    doc.text(`${m.task}${m.target ? ` — target: ${m.target}` : ""}`, margin, y);
    y += 14;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(70);
    doc.setFontSize(10);
    const wrapped = doc.splitTextToSize(
      `Algorithms: ${m.algorithms.join(", ")}. ${m.reason}`,
      pageWidth - margin * 2,
    );
    doc.text(wrapped, margin, y);
    y += wrapped.length * 12 + 8;
  }

  y = ensureSpace(doc, y, 100);
  section(doc, "Data Cleaning Suggestions", y);
  y += 16;
  y = bullets(doc, insights.cleaning, y, margin, pageWidth - margin * 2);

  y = ensureSpace(doc, y, 100);
  section(doc, "Feature Engineering Suggestions", y);
  y += 16;
  y = bullets(doc, insights.featureEngineering, y, margin, pageWidth - margin * 2);

  // Footer on each page
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(140);
    doc.text(
      `AI Dataset Detective  •  Page ${i} of ${pages}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 20,
      { align: "center" },
    );
  }

  doc.save(`${dataset.name}-report.pdf`);
}

function fmt(n: number | undefined) {
  if (n === undefined || Number.isNaN(n)) return "—";
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(3);
}

function section(doc: jsPDF, title: string, y: number) {
  doc.setFillColor(240, 240, 250);
  doc.rect(30, y - 14, doc.internal.pageSize.getWidth() - 60, 22, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(40);
  doc.text(title, 40, y);
}

function bullets(doc: jsPDF, items: string[], y: number, x: number, width: number) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(60);
  for (const item of items) {
    y = ensureSpace(doc, y, 30);
    const wrapped = doc.splitTextToSize(`•  ${item}`, width);
    doc.text(wrapped, x, y);
    y += wrapped.length * 12 + 4;
  }
  return y + 4;
}

function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  const h = doc.internal.pageSize.getHeight();
  if (y + needed > h - 40) {
    doc.addPage();
    return 60;
  }
  return y;
}
