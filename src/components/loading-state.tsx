import { AppShell } from "./app-shell";
import { Loader2 } from "lucide-react";

export function LoadingState({ label = "Loading dataset…" }: { label?: string }) {
  return (
    <AppShell>
      <div className="glass grid min-h-[60vh] place-items-center rounded-3xl p-12 text-center">
        <div>
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">{label}</p>
        </div>
      </div>
    </AppShell>
  );
}
