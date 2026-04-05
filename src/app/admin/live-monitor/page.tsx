"use client";

import { useEffect, useState } from "react";
import { Activity } from "lucide-react";
import { PageHeader }      from "@/components/shared/page-header";
import { EmptyState }      from "@/components/shared/empty-state";
import { Progress }        from "@/components/ui/progress";
import { api }             from "@/trpc/react";
import { formatDateTime }  from "@/lib/date";

export default function LiveMonitorPage() {
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const { data: polls, refetch } = api.admin.listPolls.useQuery();

  // Auto-refresh every 30s
  useEffect(() => {
    const id = setInterval(() => {
      void refetch();
      setLastRefresh(new Date());
    }, 30_000);
    return () => clearInterval(id);
  }, [refetch]);

  const active = polls?.filter((p) => p.status === "active") ?? [];
  const maxVotes = Math.max(...active.map((p) => p.votesCast ?? 0), 1);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Live Monitor"
        description="Real-time vote counts for active elections"
      >
        <div className="flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1">
          <span className="live-dot" />
          <span className="text-xs font-semibold text-green-400">
            Auto-refreshes every 30s
          </span>
        </div>
      </PageHeader>

      <p className="text-xs text-muted-foreground">
        Last updated: {formatDateTime(lastRefresh)}
      </p>

      {active.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No active elections"
          description="Live vote counts will appear here when polls are active."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {active.map((poll) => {
            const pct = Math.round(((poll.votesCast ?? 0) / maxVotes) * 100);
            return (
              <div
                key={poll.id}
                className="flex flex-col gap-4 rounded-2xl border border-primary/20 bg-card p-5"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{poll.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {poll.candidateCount} candidates
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="text-2xl font-bold text-primary">
                      {(poll.votesCast ?? 0).toLocaleString()}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Votes Cast
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="flex flex-col gap-1.5">
                  <Progress value={pct} className="h-2.5 bg-muted" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{pct}% of peak</span>
                    <span>{poll.candidateCount} candidates</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}