"use client";

import { Vote } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PollStatusBadge } from "@/components/shared/status-badge";
import { formatDateTime } from "@/lib/date";
import { api } from "@/trpc/react";

export function VotingHistoryList() {
  const { data: history, isLoading } = api.user.getVotingHistory.useQuery();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-muted/30" />
        ))}
      </div>
    );
  }

  if (!history?.length) {
    return (
      <EmptyState
        icon={Vote}
        title="No voting history"
        description="Polls you participate in will appear here."
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {history.map((item) => (
        <div
          key={item.pollId}
          className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3"
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-foreground">
              {item.poll?.title ?? "Unknown poll"}
            </span>
            <span className="text-xs text-muted-foreground">
              Voted on {formatDateTime(item.votedAt)}
            </span>
          </div>
          {item.poll && <PollStatusBadge status={item.poll.status} />}
        </div>
      ))}
    </div>
  );
}