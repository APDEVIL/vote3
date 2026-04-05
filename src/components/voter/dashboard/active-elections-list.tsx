"use client";

import { Vote } from "lucide-react";
import { ElectionCard } from "./election-card";
import { ElectionCardSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { api } from "@/trpc/react";

export function ActiveElectionsList() {
  // Fixed: Changed from .list.useQuery() to .listAll.useQuery() to show polls before approval
  const { data: polls, isLoading } = api.poll.listAll.useQuery();

  // Cast to any[] to resolve the property mismatch error with ElectionCard
  const active = (polls as any)?.filter((p: any) => p.status === "active" || p.status === "result_available") ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Active Elections</h3>
        <div className="flex items-center gap-1.5">
          <span className="live-dot" />
          <span className="text-xs font-semibold text-green-400">LIVE</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground -mt-2">
        Tap any election to view candidates and vote
      </p>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <ElectionCardSkeleton />
          <ElectionCardSkeleton />
        </div>
      ) : active.length === 0 ? (
        <EmptyState
          icon={Vote}
          title="No active elections"
          description="You haven't been approved for any active polls yet."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {active.map((poll: any) => (
            <ElectionCard key={poll.id} poll={poll} />
          ))}
        </div>
      )}
    </div>
  );
}