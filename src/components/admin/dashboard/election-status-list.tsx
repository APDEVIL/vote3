"use client";

import { PollStatusBadge } from "@/components/shared/status-badge";
import { Progress } from "@/components/ui/progress";
import { api } from "@/trpc/react";

export function ElectionStatusList() {
  const { data: polls, isLoading } = api.admin.listPolls.useQuery();

  const active = polls?.filter((p) => p.status === "active" || p.status === "created") ?? [];
  const maxVotes = Math.max(...(active.map((p) => p.votesCast ?? 0)), 1);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
      <h3 className="font-semibold text-foreground">Election Status</h3>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-lg bg-muted/30" />
          ))}
        </div>
      ) : active.length === 0 ? (
        <p className="text-sm text-muted-foreground">No active elections.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {active.map((poll) => (
            <div key={poll.id} className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm text-foreground">{poll.title}</span>
                <PollStatusBadge status={poll.status} />
              </div>
              <Progress
                value={((poll.votesCast ?? 0) / maxVotes) * 100}
                className="h-1.5 bg-muted"
              />
              <span className="text-xs text-muted-foreground">
                {poll.votesCast?.toLocaleString() ?? 0} votes
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}