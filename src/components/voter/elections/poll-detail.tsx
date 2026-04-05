"use client";

import { useState } from "react";
import { Calendar, Clock, Users } from "lucide-react";
import { PollStatusBadge } from "@/components/shared/status-badge";
import { ErrorState } from "@/components/shared/error-state";
import { ElectionCardSkeleton } from "@/components/shared/loading-skeleton";
import { CastVoteDialog } from "./cast-vote-dialog";
import { formatDate, formatDateTime } from "@/lib/date";
import { api } from "@/trpc/react";
import { cn } from "@/lib/utils";

interface PollDetailProps {
  pollId: string;
}

export function PollDetail({ pollId }: PollDetailProps) {
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data, isLoading, error, refetch } = api.poll.getById.useQuery({ pollId });

  if (isLoading) return <ElectionCardSkeleton />;
  if (error || !data) return <ErrorState onRetry={() => refetch()} />;

  const canVote = data.status === "active" && !data.hasVoted;

  function handleCandidateSelect(candidateId: string) {
    if (!canVote) return;
    setSelectedCandidateId(candidateId);
    setDialogOpen(true);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Poll header */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <PollStatusBadge status={data.status} />
          {data.hasVoted && (
            <span className="rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-400">
              ✓ You voted · {data.votedAt ? formatDateTime(data.votedAt) : ""}
            </span>
          )}
        </div>

        <h1 className="text-xl font-bold text-foreground">{data.title}</h1>
        {data.description && (
          <p className="mt-2 text-sm text-muted-foreground">{data.description}</p>
        )}

        <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            Starts {formatDate(data.startTime)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Ends {formatDateTime(data.endTime)}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            {data.candidates.length} candidates
          </span>
        </div>
      </div>

      {/* Candidates */}
      <div className="flex flex-col gap-3">
        <h2 className="font-semibold text-foreground">
          {canVote ? "Select a candidate to vote" : "Candidates"}
        </h2>

        {data.candidates.map((candidate) => (
          <button
            key={candidate.id}
            onClick={() => handleCandidateSelect(candidate.id)}
            disabled={!canVote}
            className={cn(
              "flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all",
              canVote
                ? "cursor-pointer border-border bg-card hover:border-primary/50 hover:bg-primary/5"
                : "cursor-default border-border bg-card",
              selectedCandidateId === candidate.id && "border-primary bg-primary/10",
            )}
          >
            {/* Avatar */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {candidate.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-1 flex-col gap-0.5">
              <span className="font-medium text-foreground">{candidate.name}</span>
              {candidate.description && (
                <span className="text-xs text-muted-foreground">{candidate.description}</span>
              )}
            </div>
            {canVote && (
              <div className={cn(
                "h-4 w-4 rounded-full border-2 transition-all",
                selectedCandidateId === candidate.id
                  ? "border-primary bg-primary"
                  : "border-border",
              )} />
            )}
          </button>
        ))}
      </div>

      {/* Vote dialog */}
      {selectedCandidateId && (
        <CastVoteDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          pollId={pollId}
          candidateId={selectedCandidateId}
          candidateName={data.candidates.find((c) => c.id === selectedCandidateId)?.name ?? ""}
          onSuccess={() => {
            setSelectedCandidateId(null);
            void refetch();
          }}
        />
      )}
    </div>
  );
}