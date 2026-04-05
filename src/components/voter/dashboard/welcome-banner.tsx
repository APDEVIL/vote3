"use client";

import { ShieldCheck } from "lucide-react";
import { useSession } from "@/hooks/use-session";
import { api } from "@/trpc/react";

export function WelcomeBanner() {
  const { user } = useSession();
  const { data: polls } = api.poll.list.useQuery();
  const { data: setup } = api.user.getSetupStatus.useQuery();

  const firstName  = user?.name?.split(" ")[0] ?? "Voter";
  const liveCount  = polls?.filter((p) => p.status === "active").length ?? 0;
  const votedCount = polls?.filter((p) => p.hasVoted).length ?? 0;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6">
      <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-1.5">
            <span className="live-dot" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-green-400">
              Session Active
            </span>
          </div>

          <h2 className="text-2xl font-bold text-foreground">
            Welcome, <span className="text-glow-cyan">{firstName}</span> 👋
          </h2>

          <div className="flex flex-wrap gap-2">
            {setup?.isVerified && (
              <span className="flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-400">
                <ShieldCheck className="h-3 w-3" />
                Aadhaar Verified
              </span>
            )}
            {votedCount > 0 && (
              <span className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                ✓ {votedCount} vote{votedCount !== 1 ? "s" : ""} cast
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="text-5xl font-extrabold text-glow-cyan">{liveCount}</span>
          <span className="text-xs text-muted-foreground">Elections Live</span>
        </div>
      </div>
    </div>
  );
}