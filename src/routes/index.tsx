import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  Sparkles, Upload, ArrowRight, Search, Github, Sun, Moon, Menu, X,
  Database, FileSpreadsheet, FileJson, FileCode2, Braces, Cloud, Server, Snowflake,
  Brain, Wand2, AlertTriangle, Copy, Target, Grid3x3, Bot, Eye, MessageSquare, BookOpen,
  Check, Star, ChevronDown, Send, Zap, TrendingUp, BarChart3, PieChart as PieIcon,
  LineChart as LineIcon, Activity, Cpu, Layers, Globe, Play,
} from "lucide-react";
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer,
  XAxis, YAxis, Tooltip, Area, AreaChart,
} from "recharts";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dataset Detective — AI-Powered Dataset Intelligence" },
      { name: "description", content: "Upload CSV, Excel, JSON or SQL datasets and receive instant AI-powered insights, visualizations, predictions and recommendations." },
      { property: "og:title", content: "Dataset Detective — AI Dataset Intelligence" },
      { property: "og:description", content: "Instant AI insights, charts, and ML recommendations for any dataset." },
    ],
  }),
  component: Landing,
});

// ---------- Background ----------
function AnimatedBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0" style={{ background: "#0b1020" }} />
      <div className="dotted-grid absolute inset-0 opacity-40" />
      {/* Blobs */}
      <div className="absolute -top-40 -left-40 h-[560px] w-[560px] rounded-full blur-3xl opacity-40 animate-blob"
        style={{ background: "radial-gradient(circle, #4f8cff 0%, transparent 70%)" }} />
      <div className="absolute top-1/3 -right-40 h-[600px] w-[600px] rounded-full blur-3xl opacity-35 animate-blob"
        style={{ background: "radial-gradient(circle, #00d4ff 0%, transparent 70%)", animationDelay: "3s" }} />
      <div className="absolute bottom-0 left-1/3 h-[500px] w-[500px] rounded-full blur-3xl opacity-40 animate-blob"
        style={{ background: "radial-gradient(circle, #7b61ff 0%, transparent 70%)", animationDelay: "6s" }} />
      {/* Mesh gradient overlay */}
      <div className="absolute inset-0 opacity-60"
        style={{ background: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(79,140,255,0.25), transparent 60%)" }} />
      {/* Particles */}
      <Particles />
      {/* Noise */}
      <div className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />
    </div>
  );
}

function Particles() {
  const particles = Array.from({ length: 24 });
  return (
    <div className="absolute inset-0">
      {particles.map((_, i) => {
        const left = (i * 37) % 100;
        const size = 2 + (i % 3);
        const duration = 18 + (i % 8) * 2;
        const delay = (i % 10) * -2;
        return (
          <span key={i}
            className="absolute rounded-full bg-white/60"
            style={{
              left: `${left}%`, bottom: "-10px",
              width: size, height: size,
              boxShadow: "0 0 8px rgba(0,212,255,0.8)",
              animation: `particle-drift ${duration}s linear infinite`,
              animationDelay: `${delay}s`,
            }} />
        );
      })}
    </div>
  );
}

// ---------- Navigation ----------
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try { localStorage.setItem("add.theme", next ? "dark" : "light"); } catch {}
  };

  const links = ["Features", "Solutions", "Pricing", "Docs", "Community", "FAQ"];
  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? "py-2" : "py-4"}`}>
      <div className={`mx-auto flex max-w-7xl items-center justify-between px-4 md:px-6 ${scrolled ? "glass rounded-2xl mx-4 md:mx-auto" : ""}`}
        style={scrolled ? { maxWidth: "min(1200px, calc(100% - 2rem))" } : undefined}>
        <Link to="/" className="flex items-center gap-2.5 py-3">
          <div className="relative">
            <div className="grid h-9 w-9 place-items-center rounded-xl text-white shadow-[0_0_20px_rgba(79,140,255,0.6)]"
              style={{ background: "var(--gradient-primary)" }}>
              <Sparkles className="h-5 w-5 animate-pulse-glow" />
            </div>
            <div className="absolute inset-0 rounded-xl blur-lg opacity-60"
              style={{ background: "var(--gradient-primary)" }} />
          </div>
          <span className="font-display text-base font-bold tracking-tight">Dataset Detective</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <a key={l} href={`#${l.toLowerCase()}`}
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-white/5 hover:text-foreground">
              {l}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button className="hidden rounded-lg p-2 text-muted-foreground transition hover:bg-white/5 hover:text-foreground md:inline-flex" aria-label="Search">
            <Search className="h-4 w-4" />
          </button>
          <button onClick={toggleTheme} className="hidden rounded-lg p-2 text-muted-foreground transition hover:bg-white/5 hover:text-foreground md:inline-flex" aria-label="Toggle theme">
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <a href="https://github.com" target="_blank" rel="noreferrer"
            className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-white/5 hover:text-foreground md:inline-flex">
            <Github className="h-4 w-4" /> GitHub
          </a>
          <Link to="/upload" className="group relative hidden md:inline-flex">
            <span className="absolute -inset-[1.5px] rounded-xl opacity-80 blur-sm transition group-hover:opacity-100"
              style={{ background: "var(--gradient-primary)" }} />
            <span className="relative inline-flex items-center gap-1.5 rounded-xl bg-[#0b1020] px-4 py-2 text-sm font-semibold text-white">
              Start Free <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
          <button onClick={() => setOpen((v) => !v)} className="rounded-lg p-2 lg:hidden" aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="glass mx-4 mt-2 rounded-2xl p-4 lg:hidden">
            {links.map((l) => (
              <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground">
                {l}
              </a>
            ))}
            <Link to="/upload" className="mt-2 block rounded-xl px-4 py-2.5 text-center text-sm font-semibold text-white"
              style={{ background: "var(--gradient-primary)" }}>
              Start Free
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// ---------- Hero ----------
const brands = ["Microsoft", "Google", "NVIDIA", "OpenAI", "Kaggle"];

function Hero() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 pt-32 pb-20 md:px-6 md:pt-40 md:pb-28">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        {/* Left */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs">
            <Sparkles className="h-3.5 w-3.5 text-[#00d4ff]" />
            <span className="text-muted-foreground">AI Powered Dataset Intelligence</span>
          </div>
          <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
            Understand Any{" "}
            <span className="gradient-text">Dataset</span>
            <br />
            Like a Data Scientist
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Upload CSV, Excel, JSON or SQL datasets and receive instant AI-powered insights,
            visualizations, predictions and recommendations.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/upload" className="group relative inline-flex">
              <span className="absolute -inset-[2px] rounded-2xl opacity-80 blur-md transition group-hover:opacity-100"
                style={{ background: "var(--gradient-primary)" }} />
              <span className="relative inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-semibold text-white transition group-hover:scale-[1.02]"
                style={{ background: "var(--gradient-primary)" }}>
                Analyze Dataset <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
            <button className="glass inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-semibold text-foreground transition hover:bg-white/10">
              <Play className="h-4 w-4" /> Watch Demo
            </button>
          </div>

          <div className="mt-12">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Trusted by teams at</p>
            <div className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-3 opacity-60">
              {brands.map((b) => (
                <span key={b} className="font-display text-lg font-semibold tracking-tight text-muted-foreground grayscale transition hover:opacity-100 hover:text-foreground">
                  {b}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right: floating dashboard */}
        <HeroDashboard />
      </div>
    </section>
  );
}

function HeroDashboard() {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }}
      className="relative">
      {/* Floating icons */}
      <FloatIcon className="-top-6 -left-4" delay={0}><FileSpreadsheet className="h-5 w-5 text-[#00d4ff]" /></FloatIcon>
      <FloatIcon className="-top-2 right-8" delay={1.5}><Cpu className="h-5 w-5 text-[#7b61ff]" /></FloatIcon>
      <FloatIcon className="top-1/3 -right-6" delay={0.8}><Database className="h-5 w-5 text-[#4f8cff]" /></FloatIcon>
      <FloatIcon className="bottom-8 -left-6" delay={2.2}><Activity className="h-5 w-5 text-[#00d4ff]" /></FloatIcon>
      <FloatIcon className="-bottom-4 right-16" delay={1}><FileJson className="h-5 w-5 text-[#7b61ff]" /></FloatIcon>

      <div className="glass-strong relative rounded-3xl p-4 shadow-[var(--shadow-elegant)] md:p-5"
        style={{ boxShadow: "0 30px 80px -20px rgba(79,140,255,0.35), 0 0 0 1px rgba(255,255,255,0.06) inset" }}>
        {/* Upload card */}
        <div className="glass rounded-2xl border-dashed p-4"
          style={{ borderStyle: "dashed", borderColor: "rgba(0,212,255,0.4)" }}>
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: "var(--gradient-primary)" }}>
              <Upload className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Drag dataset here</p>
              <p className="text-xs text-muted-foreground">CSV · Excel · JSON</p>
            </div>
            <div className="flex gap-1">
              {["CSV", "XLS", "JSON"].map((t) => (
                <span key={t} className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">{t}</span>
              ))}
            </div>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/5">
            <motion.div className="h-full rounded-full"
              initial={{ width: "0%" }} animate={{ width: "78%" }} transition={{ duration: 2, delay: 0.6 }}
              style={{ background: "var(--gradient-primary)" }} />
          </div>
        </div>

        {/* Insights */}
        <div className="mt-3 grid grid-cols-5 gap-2">
          {[
            { l: "Rows", v: "24.3K" }, { l: "Cols", v: "18" },
            { l: "Missing", v: "1.2%" }, { l: "Dupes", v: "42" }, { l: "Target", v: "churn" },
          ].map((s) => (
            <div key={s.l} className="glass rounded-xl p-2 text-center">
              <div className="text-[9px] uppercase tracking-widest text-muted-foreground">{s.l}</div>
              <div className="mt-0.5 font-display text-sm font-bold">{s.v}</div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="glass rounded-xl p-3">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-medium">Revenue</span>
              <BarChart3 className="h-3 w-3 text-muted-foreground" />
            </div>
            <div className="h-20">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{ v: 30 }, { v: 45 }, { v: 28 }, { v: 60 }, { v: 48 }, { v: 72 }, { v: 65 }]}>
                  <Bar dataKey="v" fill="url(#gradBar)" radius={[4, 4, 0, 0]} />
                  <defs>
                    <linearGradient id="gradBar" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#00d4ff" />
                      <stop offset="100%" stopColor="#4f8cff" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="glass rounded-xl p-3">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-medium">Segments</span>
              <PieIcon className="h-3 w-3 text-muted-foreground" />
            </div>
            <div className="h-20">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={[{ v: 40 }, { v: 30 }, { v: 20 }, { v: 10 }]} dataKey="v" innerRadius={18} outerRadius={34} paddingAngle={2}>
                    {["#4f8cff", "#00d4ff", "#7b61ff", "#a78bfa"].map((c, i) => <Cell key={i} fill={c} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="glass col-span-2 rounded-xl p-3">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-medium">Trend forecast</span>
              <LineIcon className="h-3 w-3 text-muted-foreground" />
            </div>
            <div className="h-24">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={Array.from({ length: 20 }, (_, i) => ({ x: i, y: 30 + Math.sin(i / 2) * 15 + i * 1.5 }))}>
                  <defs>
                    <linearGradient id="gradArea" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#00d4ff" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#00d4ff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="y" stroke="#00d4ff" strokeWidth={2} fill="url(#gradArea)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* AI Chat */}
        <div className="mt-3 glass rounded-2xl p-3">
          <div className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-lg" style={{ background: "var(--gradient-primary)" }}>
              <Bot className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-xs font-semibold">Ask your dataset</span>
          </div>
          <div className="mt-2 space-y-1.5">
            {["Why are sales decreasing?", "Generate insights", "Predict future trends"].map((q) => (
              <div key={q} className="rounded-lg bg-white/5 px-2.5 py-1.5 text-xs text-muted-foreground">
                {q}
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function FloatIcon({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <div className={`glass absolute z-10 grid h-10 w-10 place-items-center rounded-xl shadow-[var(--shadow-glow)] animate-float-slow ${className ?? ""}`}
      style={{ animationDelay: `${delay}s` }}>
      {children}
    </div>
  );
}

// ---------- Stats ----------
function Stats() {
  const stats = [
    { v: "2M+", l: "Datasets Analyzed" },
    { v: "99%", l: "Prediction Accuracy" },
    { v: "150+", l: "Countries" },
    { v: "24/7", l: "AI Assistant" },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div key={s.l} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
            className="glass relative overflow-hidden rounded-2xl p-6">
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl opacity-30" style={{ background: "var(--gradient-primary)" }} />
            <div className="relative">
              <div className="font-display text-4xl font-bold gradient-text">{s.v}</div>
              <div className="mt-2 text-sm text-muted-foreground">{s.l}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ---------- Features (Bento) ----------
const features = [
  { icon: Wand2, title: "AI Data Cleaning", desc: "Automatically fix inconsistencies, types, and formatting.", span: "md:col-span-2" },
  { icon: Layers, title: "Feature Engineering", desc: "AI-crafted derived features tailored to your task." },
  { icon: AlertTriangle, title: "Missing Value Detection", desc: "Surface and repair gaps with smart imputation." },
  { icon: Copy, title: "Duplicate Detection", desc: "Precise fuzzy dedupe across columns." },
  { icon: Target, title: "Outlier Detection", desc: "Isolate anomalies with statistical + ML methods." },
  { icon: Grid3x3, title: "Correlation Heatmap", desc: "Visualize relationships across every numeric field.", span: "md:col-span-2" },
  { icon: Brain, title: "ML Model Recommendation", desc: "Best-fit algorithms picked for your dataset." },
  { icon: BarChart3, title: "Automatic Visualization", desc: "Charts chosen intelligently for every column." },
  { icon: MessageSquare, title: "Natural Language Queries", desc: "Ask your data in plain English." },
  { icon: BookOpen, title: "Explain Dataset", desc: "Get an executive summary in seconds." },
];

function Features() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-4 py-24 md:px-6">
      <SectionHeader eyebrow="Features" title="Everything you need for data analysis" subtitle="From raw dataset to production-ready insights in seconds." />
      <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-4">
        {features.map((f, i) => (
          <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
            className={`group relative ${f.span ?? ""}`}>
            <div className="absolute -inset-[1px] rounded-2xl opacity-0 blur-sm transition group-hover:opacity-70"
              style={{ background: "var(--gradient-primary)" }} />
            <div className="glass relative h-full rounded-2xl p-6 transition group-hover:-translate-y-1">
              <div className="grid h-11 w-11 place-items-center rounded-xl shadow-[0_0_20px_rgba(0,212,255,0.35)]"
                style={{ background: "var(--gradient-primary)" }}>
                <f.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ---------- How It Works ----------
function HowItWorks() {
  const steps = [
    { n: "01", t: "Upload Dataset", d: "CSV, Excel, JSON, SQL — drag & drop.", icon: Upload },
    { n: "02", t: "AI Understands Data", d: "Column types, distributions, quality checks.", icon: Brain },
    { n: "03", t: "Generates Visualizations", d: "Charts auto-picked for your data.", icon: BarChart3 },
    { n: "04", t: "Suggests ML Models", d: "Regression, classification, clustering.", icon: Cpu },
    { n: "05", t: "Download Report", d: "Polished PDF or CSV summary.", icon: BookOpen },
  ];
  return (
    <section className="mx-auto max-w-5xl px-4 py-24 md:px-6">
      <SectionHeader eyebrow="Workflow" title="How it works" subtitle="Five steps from dataset to decisions." />
      <div className="relative mt-14">
        <div className="pointer-events-none absolute left-6 top-2 bottom-2 hidden w-px md:block"
          style={{ background: "linear-gradient(to bottom, transparent, #4f8cff, #00d4ff, #7b61ff, transparent)" }} />
        <div className="space-y-6">
          {steps.map((s, i) => (
            <motion.div key={s.n} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="flex items-start gap-5">
              <div className="relative shrink-0">
                <div className="grid h-12 w-12 place-items-center rounded-2xl text-white shadow-[0_0_25px_rgba(79,140,255,0.5)]"
                  style={{ background: "var(--gradient-primary)" }}>
                  <s.icon className="h-5 w-5" />
                </div>
              </div>
              <div className="glass flex-1 rounded-2xl p-5">
                <div className="flex items-center gap-3">
                  <span className="font-display text-sm font-bold text-muted-foreground">{s.n}</span>
                  <h3 className="font-display text-lg font-semibold">{s.t}</h3>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- Analytics Showcase ----------
function AnalyticsShowcase() {
  const tabs = ["Overview", "Charts", "Predictions", "Insights", "Reports"];
  const [active, setActive] = useState(0);
  return (
    <section id="solutions" className="mx-auto max-w-7xl px-4 py-24 md:px-6">
      <SectionHeader eyebrow="Showcase" title="Visual analytics that just work" subtitle="Interactive dashboards generated for every dataset." />
      <div className="glass-strong mt-12 overflow-hidden rounded-3xl p-2">
        <div className="flex gap-1 border-b border-white/5 p-2">
          {tabs.map((t, i) => (
            <button key={t} onClick={() => setActive(i)}
              className={`relative rounded-xl px-4 py-2 text-sm font-medium transition ${active === i ? "text-white" : "text-muted-foreground hover:text-foreground"}`}>
              {active === i && (
                <motion.span layoutId="tab-pill" className="absolute inset-0 rounded-xl"
                  style={{ background: "var(--gradient-primary)", opacity: 0.9 }} transition={{ type: "spring", stiffness: 400, damping: 30 }} />
              )}
              <span className="relative">{t}</span>
            </button>
          ))}
        </div>
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div key={active} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}
              className="grid gap-4 md:grid-cols-3">
              <div className="glass md:col-span-2 rounded-2xl p-4">
                <h4 className="text-sm font-semibold">{tabs[active]} — live sample</h4>
                <div className="mt-3 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={Array.from({ length: 30 }, (_, i) => ({ x: i, a: 40 + Math.sin(i / 3) * 20 + i, b: 30 + Math.cos(i / 4) * 15 + i * 0.8 }))}>
                      <XAxis dataKey="x" stroke="#8a93ad" fontSize={10} />
                      <YAxis stroke="#8a93ad" fontSize={10} />
                      <Tooltip contentStyle={{ background: "#10131f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
                      <Line type="monotone" dataKey="a" stroke="#00d4ff" strokeWidth={2.5} dot={false} />
                      <Line type="monotone" dataKey="b" stroke="#7b61ff" strokeWidth={2.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { l: "Precision", v: "94.2%", icon: Target },
                  { l: "Recall", v: "91.7%", icon: TrendingUp },
                  { l: "F1 Score", v: "0.93", icon: Zap },
                ].map((k) => (
                  <div key={k.l} className="glass rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-lg" style={{ background: "var(--gradient-primary)" }}>
                        <k.icon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">{k.l}</div>
                        <div className="font-display text-xl font-bold">{k.v}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

// ---------- AI Assistant ----------
function AIAssistant() {
  const messages = [
    { role: "user" as const, text: "Analyze customer churn" },
    { role: "ai" as const, text: "Top features affecting churn: tenure, monthly charges, contract type. 3.2% missing values in TotalCharges. Suggested model: Gradient Boosted Trees (ROC-AUC 0.91)." },
  ];
  const [typed, setTyped] = useState("");
  const fullText = messages[1].text;
  useEffect(() => {
    let i = 0;
    const int = setInterval(() => {
      i += 2;
      setTyped(fullText.slice(0, i));
      if (i >= fullText.length) clearInterval(int);
    }, 25);
    return () => clearInterval(int);
  }, [fullText]);

  return (
    <section className="mx-auto max-w-5xl px-4 py-24 md:px-6">
      <SectionHeader eyebrow="AI Assistant" title="Chat with your data" subtitle="Natural language queries powered by an on-device AI copilot." />
      <div className="glass-strong mt-12 rounded-3xl p-6 md:p-8">
        <div className="space-y-4">
          <div className="flex justify-end">
            <div className="rounded-2xl px-4 py-3 text-sm font-medium text-white shadow-[var(--shadow-glow)]"
              style={{ background: "var(--gradient-primary)" }}>
              {messages[0].text}
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl" style={{ background: "var(--gradient-primary)" }}>
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="glass max-w-2xl rounded-2xl p-4 text-sm">
              {typed}
              <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-[#00d4ff] align-middle" />
              <div className="mt-3 flex flex-wrap gap-2">
                <button className="rounded-lg bg-white/5 px-3 py-1.5 text-xs hover:bg-white/10">Download notebook</button>
                <button className="rounded-lg bg-white/5 px-3 py-1.5 text-xs hover:bg-white/10">Explain further</button>
              </div>
            </div>
          </div>
        </div>
        <div className="glass mt-6 flex items-center gap-2 rounded-2xl p-2">
          <input placeholder="Ask a question about your dataset..." className="flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground" />
          <button className="grid h-9 w-9 place-items-center rounded-xl text-white" style={{ background: "var(--gradient-primary)" }}>
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

// ---------- Supported ----------
const sources = [
  { n: "CSV", icon: FileSpreadsheet }, { n: "Excel", icon: FileSpreadsheet },
  { n: "SQL", icon: Database }, { n: "JSON", icon: FileJson },
  { n: "Parquet", icon: FileCode2 }, { n: "BigQuery", icon: Cloud },
  { n: "MongoDB", icon: Server }, { n: "Snowflake", icon: Snowflake },
];
function Supported() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 md:px-6">
      <SectionHeader eyebrow="Data sources" title="Works with everything" subtitle="Plug into the tools you already use." />
      <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {sources.map((s) => (
          <div key={s.n} className="group glass flex flex-col items-center gap-2 rounded-2xl p-5 transition hover:-translate-y-1 hover:shadow-[var(--shadow-glow-cyan)]">
            <div className="grid h-11 w-11 place-items-center rounded-xl transition group-hover:scale-110" style={{ background: "var(--gradient-primary)" }}>
              <s.icon className="h-5 w-5 text-white" />
            </div>
            <span className="text-xs font-medium">{s.n}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ---------- Testimonials ----------
const testimonials = [
  { n: "Sarah Chen", c: "Head of Data, Northwind", t: "Cut our EDA time from days to minutes. The AI insights are shockingly accurate." },
  { n: "Marcus Rivera", c: "ML Engineer, Lyra", t: "The model recommendations saved weeks of experimentation. Beautiful UI too." },
  { n: "Priya Nair", c: "Analytics Lead, Aviato", t: "Feels like a senior data scientist embedded in our team, 24/7." },
  { n: "Tom Becker", c: "Founder, Datacove", t: "Best data tool I've used since Notebooks. The charts alone are worth it." },
];
function Testimonials() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % testimonials.length), 4000);
    return () => clearInterval(id);
  }, []);
  return (
    <section id="community" className="mx-auto max-w-5xl px-4 py-24 md:px-6">
      <SectionHeader eyebrow="Loved by teams" title="What our users say" />
      <div className="mt-12 grid gap-4 md:grid-cols-2">
        {[0, 1].map((offset) => {
          const t = testimonials[(i + offset) % testimonials.length];
          return (
            <motion.div key={`${t.n}-${offset}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="glass rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-full text-sm font-bold text-white" style={{ background: "var(--gradient-primary)" }}>
                  {t.n.split(" ").map((x) => x[0]).join("")}
                </div>
                <div>
                  <div className="text-sm font-semibold">{t.n}</div>
                  <div className="text-xs text-muted-foreground">{t.c}</div>
                </div>
                <div className="ml-auto flex text-[#00d4ff]">
                  {Array.from({ length: 5 }).map((_, k) => <Star key={k} className="h-3.5 w-3.5 fill-current" />)}
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">"{t.t}"</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

// ---------- Pricing ----------
const plans = [
  { n: "Starter", p: "$0", d: "For individuals exploring their first dataset.", f: ["Up to 3 datasets", "Basic AI insights", "PDF exports", "Community support"] },
  { n: "Pro", p: "$29", d: "For serious analysts and small teams.", f: ["Unlimited datasets", "Advanced ML recommendations", "AI chat assistant", "Priority support", "API access"], featured: true },
  { n: "Enterprise", p: "Custom", d: "For organizations with scale and compliance needs.", f: ["SSO & audit logs", "On-prem deployment", "Dedicated engineer", "Custom SLAs"] },
];
function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-7xl px-4 py-24 md:px-6">
      <SectionHeader eyebrow="Pricing" title="Simple, transparent pricing" subtitle="Start free. Scale when you're ready." />
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {plans.map((p) => (
          <div key={p.n} className="relative">
            {p.featured && (
              <div className="absolute -inset-[2px] rounded-3xl opacity-90 blur-sm animate-pulse-glow"
                style={{ background: "var(--gradient-primary)" }} />
            )}
            <div className={`relative flex h-full flex-col rounded-3xl p-7 ${p.featured ? "bg-[#0b1020]" : "glass"}`}
              style={p.featured ? { border: "1px solid rgba(255,255,255,0.08)" } : undefined}>
              {p.featured && (
                <span className="mb-3 inline-flex w-fit items-center gap-1 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white"
                  style={{ background: "var(--gradient-primary)" }}>
                  Most Popular
                </span>
              )}
              <h3 className="font-display text-xl font-bold">{p.n}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="font-display text-4xl font-bold">{p.p}</span>
                {p.p.startsWith("$") && p.p !== "$0" && <span className="text-sm text-muted-foreground">/mo</span>}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{p.d}</p>
              <ul className="mt-6 flex-1 space-y-2.5 text-sm">
                {p.f.map((x) => (
                  <li key={x} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-[#00d4ff]" /> {x}
                  </li>
                ))}
              </ul>
              <button className={`mt-8 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${p.featured ? "text-white hover:scale-[1.02]" : "glass hover:bg-white/10"}`}
                style={p.featured ? { background: "var(--gradient-primary)" } : undefined}>
                Get started
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ---------- FAQ ----------
const faqs = [
  { q: "Is my data uploaded to a server?", a: "No. Parsing and analysis run locally in your browser — your datasets never leave your device." },
  { q: "What file formats are supported?", a: "CSV, Excel, JSON, Parquet, SQL exports, plus direct connectors to BigQuery, MongoDB, and Snowflake." },
  { q: "Do I need to configure anything?", a: "No setup required. Drop a dataset and we infer types, quality, and the right analysis for you." },
  { q: "Can I export the analysis?", a: "Yes — polished PDF reports, CSV summaries, or an executable notebook." },
  { q: "Does it work on large datasets?", a: "Yes. Datasets up to millions of rows are streamed and profiled efficiently in-browser." },
];
function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="mx-auto max-w-3xl px-4 py-24 md:px-6">
      <SectionHeader eyebrow="FAQ" title="Frequently asked questions" />
      <div className="mt-10 flex flex-col gap-3">
        {faqs.map((f, i) => (
          <div key={f.q} className="glass rounded-2xl">
            <button onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center justify-between p-5 text-left">
              <span className="font-medium">{f.q}</span>
              <ChevronDown className={`h-5 w-5 text-muted-foreground transition ${open === i ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence initial={false}>
              {open === i && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden">
                  <p className="px-5 pb-5 text-sm text-muted-foreground">{f.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
}

// ---------- Footer ----------
function Footer() {
  const groups = [
    { t: "Product", l: ["Features", "Pricing", "Changelog", "Roadmap"] },
    { t: "Resources", l: ["Docs", "Guides", "Blog", "API"] },
    { t: "Company", l: ["About", "Careers", "Contact", "Press"] },
    { t: "Legal", l: ["Privacy", "Terms", "Security", "DPA"] },
  ];
  return (
    <footer className="relative mt-16">
      <div className="h-px w-full" style={{ background: "linear-gradient(to right, transparent, #4f8cff, #00d4ff, #7b61ff, transparent)", backgroundSize: "200% 100%", animation: "gradient-shift 8s ease infinite" }} />
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <div className="grid gap-10 md:grid-cols-6">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-xl text-white" style={{ background: "var(--gradient-primary)" }}>
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="font-display font-bold">Dataset Detective</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              AI-powered dataset intelligence for teams that move fast.
            </p>
            <form className="glass mt-5 flex items-center gap-2 rounded-2xl p-2" onSubmit={(e) => e.preventDefault()}>
              <input placeholder="Your email" className="flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground" />
              <button className="rounded-xl px-3 py-2 text-xs font-semibold text-white" style={{ background: "var(--gradient-primary)" }}>Subscribe</button>
            </form>
          </div>
          {groups.map((g) => (
            <div key={g.t}>
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{g.t}</div>
              <ul className="mt-4 space-y-2 text-sm">
                {g.l.map((x) => <li key={x}><a href="#" className="text-muted-foreground transition hover:text-foreground">{x}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-6 text-xs text-muted-foreground md:flex-row">
          <div>© {new Date().getFullYear()} Dataset Detective. All rights reserved.</div>
          <div className="flex items-center gap-3">
            <a href="#" aria-label="GitHub" className="rounded-lg p-2 hover:bg-white/5"><Github className="h-4 w-4" /></a>
            <a href="#" aria-label="Discord" className="rounded-lg p-2 hover:bg-white/5"><Globe className="h-4 w-4" /></a>
            <a href="#" aria-label="Docs" className="rounded-lg p-2 hover:bg-white/5"><BookOpen className="h-4 w-4" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ---------- Utils ----------
function SectionHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <div className="glass inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {eyebrow}
      </div>
      <h2 className="mt-4 font-display text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">{title}</h2>
      {subtitle && <p className="mx-auto mt-4 max-w-xl text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

function Landing() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref });
  const progressBar = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <div ref={ref} className="relative min-h-screen text-foreground">
      <AnimatedBackground />
      <motion.div className="fixed left-0 top-0 z-[60] h-0.5 origin-left" style={{ width: progressBar, background: "var(--gradient-primary)" }} />
      <Nav />
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <AnalyticsShowcase />
      <AIAssistant />
      <Supported />
      <Testimonials />
      <Pricing />
      <FAQ />
      <Footer />
    </div>
  );
}
