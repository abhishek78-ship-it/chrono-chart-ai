import { Link, useRouterState } from "@tanstack/react-router";
import {
  Sparkles,
  LayoutDashboard,
  Upload,
  Database,
  Brain,
  FileText,
  Home,
  Moon,
  Sun,
} from "lucide-react";
import { useEffect, useState } from "react";
import { applyTheme, getInitialTheme, type Theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", icon: Home, label: "Home", exact: true },
  { to: "/upload", icon: Upload, label: "Upload" },
  { to: "/datasets", icon: Database, label: "Datasets" },
];

const analyze = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/insights", icon: Brain, label: "AI Insights" },
  { to: "/report", icon: FileText, label: "Report" },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const t = getInitialTheme();
    setTheme(t);
    applyTheme(t);
  }, []);

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  };

  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");

  return (
    <aside className="glass-strong sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-2 border-r border-sidebar-border p-4 md:flex">
      <Link to="/" className="mb-4 flex items-center gap-2 px-2">
        <div
          className="grid h-9 w-9 place-items-center rounded-xl text-primary-foreground"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="font-display text-sm font-bold">Dataset Detective</span>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
            AI Analytics
          </span>
        </div>
      </Link>

      <SidebarSection label="Navigate">
        {nav.map((item) => (
          <SidebarLink
            key={item.to}
            to={item.to}
            icon={item.icon}
            label={item.label}
            active={isActive(item.to, item.exact)}
          />
        ))}
      </SidebarSection>

      <SidebarSection label="Analyze">
        {analyze.map((item) => (
          <SidebarLink
            key={item.to}
            to={item.to}
            icon={item.icon}
            label={item.label}
            active={isActive(item.to)}
          />
        ))}
      </SidebarSection>

      <div className="mt-auto">
        <button
          onClick={toggleTheme}
          className="glass flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm text-sidebar-foreground transition hover:bg-sidebar-accent"
        >
          <span className="flex items-center gap-2">
            {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            {theme === "dark" ? "Dark" : "Light"} mode
          </span>
          <span className="text-xs text-muted-foreground">Toggle</span>
        </button>
      </div>
    </aside>
  );
}

function SidebarSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-2 flex flex-col gap-1">
      <div className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      {children}
    </div>
  );
}

function SidebarLink({
  to,
  icon: Icon,
  label,
  active,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4 shrink-0 transition",
          active ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
        )}
      />
      <span className="truncate">{label}</span>
      {active && (
        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_10px] shadow-primary" />
      )}
    </Link>
  );
}

export function MobileTopBar() {
  return (
    <header className="glass-strong sticky top-0 z-40 flex items-center justify-between border-b border-sidebar-border px-4 py-3 md:hidden">
      <Link to="/" className="flex items-center gap-2">
        <div
          className="grid h-8 w-8 place-items-center rounded-lg text-primary-foreground"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Sparkles className="h-4 w-4" />
        </div>
        <span className="font-display text-sm font-bold">Dataset Detective</span>
      </Link>
      <MobileNav />
    </header>
  );
}

function MobileNav() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const items = [...nav, ...analyze];
  return (
    <nav className="flex gap-1 overflow-x-auto">
      {items.map((i) => {
        const active =
          i.to === "/"
            ? pathname === "/"
            : pathname === i.to || pathname.startsWith(i.to + "/");
        return (
          <Link
            key={i.to}
            to={i.to}
            className={cn(
              "rounded-lg p-2 transition",
              active
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
            aria-label={i.label}
          >
            <i.icon className="h-4 w-4" />
          </Link>
        );
      })}
    </nav>
  );
}
