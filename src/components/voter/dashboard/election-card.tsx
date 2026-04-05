"use client";

import Link from "next/link";
import { Calendar, Users, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PollStatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { RouterOutputs } from "@/trpc/react";

type Poll = RouterOutputs["poll"]["list"][number];

interface ElectionCardProps {
  poll: Poll;
}

export function ElectionCard({ poll }: ElectionCardProps) {
  const isLive   = poll.status === "active";
  const isVoted  = poll.hasVoted;
  const showResults = poll.status === "result_available";

  return (
    <div
      className={cn(
        "card-hover flex flex-col gap-4 rounded-2xl border bg-card p-5",
        isLive ? "border-primary/30" : "border-border",
      )}
    >
      {/* Top row */}
      <div className="flex items-center justify-between gap-2">
        <PollStatusBadge status={poll.status} />
        <span className="text-xs text-muted-foreground">
          {poll.votesCast?.toLocaleString() ?? 0} votes
        </span>
      </div>

      {/* Voted badge overlay */}
      {isVoted && (
        <div className="flex items-center gap-1.5 rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-1.5">
          <span className="text-xs font-semibold text-green-400">✓ VOTED</span>
        </div>
      )}

      {/* Title + desc */}
      <div>
        <h3 className="font-semibold text-foreground leading-snug">{poll.title}</h3>
        {poll.description && (
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{poll.description}</p>
        )}
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          Ends {formatDate(poll.endTime)}
        </span>
        <span className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5" />
          {poll.candidateCount} candidate{poll.candidateCount !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Action */}
      <Button
        asChild
        variant={isVoted || showResults ? "outline" : "default"}
        className={cn(
          "w-full font-semibold",
          !isVoted && isLive
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "border-border text-foreground hover:bg-muted/30",
        )}
      >
        <Link href={`/elections/${poll.id}`}>
          {showResults ? (
            <><BarChart3 className="mr-2 h-4 w-4" /> View Results</>
          ) : isVoted ? (
            "View Details"
          ) : (
            "Vote Now →"
          )}
        </Link>
      </Button>
    </div>
  );
}