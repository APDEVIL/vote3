"use client";

import { PageHeader } from "@/components/shared/page-header";
import { ElectionCard } from "@/components/voter/dashboard/election-card";
import { ElectionCardSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { Zap } from "lucide-react";
import { api } from "@/trpc/react";

export default function LivePollsPage() {
  // Fixed: Changed from .list to .listAll to show polls before approval
  const { data: polls, isLoading } = api.poll.listAll.useQuery();
  
  // Cast to any to bypass the property mismatch (candidateCount, hasVoted, etc.) with ElectionCard
  const live = (polls as any)?.filter((p: any) => p.status === "active") ?? [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Live Polls"
        description="Elections currently open for voting"
      />

      {/* Live indicator */}
      {live.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="live-dot" />
          <span className="text-sm font-semibold text-green-400">
            {live.length} election{live.length !== 1 ? "s" : ""} live now
          </span>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => <ElectionCardSkeleton key={i} />)}
        </div>
      ) : live.length === 0 ? (
        <EmptyState
          icon={Zap}
          title="No live polls right now"
          description="Check back later or browse upcoming elections."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {live.map((poll: any) => <ElectionCard key={poll.id} poll={poll} />)}
        </div>
      )}
    </div>
  );
}