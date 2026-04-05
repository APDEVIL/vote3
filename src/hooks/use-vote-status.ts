"use client";

/**
 * hooks/use-vote-status.ts
 *
 * Returns whether the current user has voted in a specific poll.
 * Wraps api.vote.hasVoted — never reveals what they voted for.
 *
 * Usage:
 *   const { hasVoted, votedAt, isLoading } = useVoteStatus(pollId);
 */

import { api } from "@/trpc/react";

export function useVoteStatus(pollId: string) {
  const { data, isLoading } = api.vote.hasVoted.useQuery(
    { pollId },
    { enabled: !!pollId },
  );

  return {
    hasVoted:  data?.hasVoted ?? false,
    votedAt:   data?.votedAt ?? null,
    isLoading,
  };
}