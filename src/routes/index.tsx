import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles,
  Upload,
  BarChart3,
  Brain,
  ShieldCheck,
  PieChart,
  FileText,
  ArrowRight,
  Check,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Dataset Detective — Instant EDA & AI Insights for any CSV" },
      {
        name: "description",
        content:
          "Upload any CSV and get instant exploratory data analysis, beautiful charts, AI insights, data-quality reports, and ML recommendations.",
      },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: BarChart3,
    title: "Automated EDA",
    text: "Instant statistics, distributions, and column profiles for every field in your dataset.",
  },
  {
    icon: Brain,
    title: "AI Insights",
    text: "Executive-level explanations of patterns, correlations, and anomalies — in plain English.",
  },
  {
    icon: ShieldCheck,
    title: "Data Quality Report",
    text: "Missing values, duplicates, outliers, and cardinality — surfaced automatically.",
  },
  {
    icon: PieChart,
    title: "Beautiful Charts",
    text: "Histograms, box plots, correlation heatmaps and more — auto-picked for your data.",
  },
  {
    icon: Sparkles,
    title: "ML Recommendations",
    text: "Best-fit algorithms for regression, classification, clustering, and time series.",
  },
  {
    icon: FileText,
    title: "Export Report",
    text: "Download a polished PDF report or a CSV summary you can share with your team.",
  },
];

const faqs = [
  {
    q: "Is my data uploaded to a server?",
    a: "No. All parsing and analysis runs locally in your browser. Your datasets never leave your device.",
  },
  {
    q: "What file formats are supported?",
    a: "CSV files (comma-separated). Headers are auto-detected. Datasets up to ~50MB work smoothly.",
  },
  {
    q: "Do I need to configure anything?",
    a: "No setup required. Drop a CSV, and the platform infers column types and picks the right analysis for you.",
  },
  {
    q: "Can I export the analysis?",
    a: "Yes — export a full PDF report or a CSV summary of the column statistics in one click.",
  },
];

function Landing() {
  return (
    <div className="hero-bg min-h-screen">
      {/* Nav */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-2">
          <div
            className="grid h-9 w-9 place-items-center rounded-xl text-primary-foreground"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="font-display text-base font-bold">Dataset Detective</span>
        </Link>
        <div className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <a href="#features" className="hover:text-foreground">Features</a>
          <a href="#faq" className="hover:text-foreground">FAQ</a>
          <Link to="/datasets" className="hover:text-foreground">Datasets</Link>
        </div>
        <Link
          to="/upload"
          className="glass inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition hover:bg-white/10"
        >
          Start <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 pt-12 pb-24 text-center md:pt-20 md:pb-32">
        <div className="glass mx-auto mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-success shadow-[0_0_10px] shadow-success" />
          AI-powered exploratory analytics
        </div>
        <h1 className="font-display text-5xl font-bold tracking-tight md:text-7xl">
          AI <span className="gradient-text">Dataset Detective</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
          Upload any CSV dataset and instantly discover insights using Artificial Intelligence — no code, no setup, no waiting.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition hover:scale-[1.02]"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Upload className="h-4 w-4" /> Start Analysis
          </Link>
          <Link
            to="/datasets"
            className="glass inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition hover:bg-white/5"
          >
            Browse Datasets
          </Link>
        </div>

        {/* Preview card */}
        <div className="glass-strong mx-auto mt-16 max-w-4xl overflow-hidden rounded-3xl p-1 shadow-[var(--shadow-elegant)]">
          <div className="rounded-[calc(var(--radius-3xl)-4px)] bg-card/60 p-6 text-left">
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { label: "Rows analyzed", value: "24,301" },
                { label: "Missing values", value: "1.2%" },
                { label: "ML task", value: "Classification" },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl bg-muted/40 p-4">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">
                    {s.label}
                  </div>
                  <div className="mt-1 font-display text-2xl font-bold">{s.value}</div>
                </div>
              ))}
            </div>
            <div className="mt-6 h-40 rounded-2xl bg-gradient-to-br from-primary/20 via-accent/10 to-transparent" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-6 pb-24">
        <div className="mb-12 text-center">
          <h2 className="font-display text-3xl font-bold md:text-4xl">
            Everything you need for data analysis
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            From raw CSV to production-ready insights in seconds.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="glass group rounded-2xl p-6 transition hover:-translate-y-1 hover:shadow-[var(--shadow-glow)]"
            >
              <div
                className="mb-4 grid h-11 w-11 place-items-center rounded-xl text-primary-foreground"
                style={{ background: "var(--gradient-primary)" }}
              >
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-6 pb-24">
        <div className="mb-10 text-center">
          <h2 className="font-display text-3xl font-bold md:text-4xl">
            Frequently asked questions
          </h2>
        </div>
        <div className="flex flex-col gap-3">
          {faqs.map((f) => (
            <details
              key={f.q}
              className="glass group rounded-2xl p-5 transition open:shadow-[var(--shadow-glow)]"
            >
              <summary className="flex cursor-pointer items-center justify-between text-left font-medium">
                {f.q}
                <span className="ml-4 grid h-6 w-6 place-items-center rounded-full bg-primary/15 text-primary transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div
          className="glass-strong overflow-hidden rounded-3xl p-10 text-center"
          style={{ background: "var(--gradient-hero), var(--glass-bg)" }}
        >
          <h2 className="font-display text-3xl font-bold md:text-4xl">
            Ready to explore your data?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            Drop a CSV and get a full analytics report in seconds.
          </p>
          <ul className="mx-auto mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            {["No sign-up", "100% private", "Free to use"].map((t) => (
              <li key={t} className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-success" /> {t}
              </li>
            ))}
          </ul>
          <Link
            to="/upload"
            className="mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition hover:scale-[1.02]"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Upload className="h-4 w-4" /> Start Analysis
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 text-xs text-muted-foreground md:flex-row">
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>AI Dataset Detective</span>
          </div>
          <span>© {new Date().getFullYear()} — Built for data teams.</span>
        </div>
      </footer>
    </div>
  );
}
