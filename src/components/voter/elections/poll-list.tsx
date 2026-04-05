"use client";

import { Vote } from "lucide-react";
import { ElectionCard } from "@/components/voter/dashboard/election-card";
import { ElectionCardSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { api } from "@/trpc/react";

export function PollList() {
  const { data: polls, isLoading } = api.poll.list.useQuery();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => <ElectionCardSkeleton key={i} />)}
      </div>
    );
  }

  if (!polls?.length) {
    return (
      <EmptyState
        icon={Vote}
        title="No elections available"
        description="You haven't been approved for any polls yet. Submit a participation request first."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {polls.map((poll) => (
        <ElectionCard key={poll.id} poll={poll} />
      ))}
    </div>
  );
}