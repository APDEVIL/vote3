"use client";

import { ShieldCheck } from "lucide-react";
import { api } from "@/trpc/react";

export function AdminOverviewBanner() {
  return (
    <div className="gradient-border relative overflow-hidden rounded-2xl p-6">
      <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/30 bg-primary/10">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Admin Control Panel</h1>
            <p className="text-sm text-muted-foreground">
              Full system management &amp; real-time monitoring
            </p>
          </div>
        </div>

        <span className="shrink-0 rounded-full border border-amber-500/40 bg-amber-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-amber-400">
          Administrator
        </span>
      </div>
    </div>
  );
}