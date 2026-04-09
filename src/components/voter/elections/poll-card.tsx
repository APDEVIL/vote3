"use client";

import Link from "next/link";
import { Calendar, Users, BarChart3, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PollStatusBadge, ParticipationBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { RouterOutputs } from "@/trpc/react";

type PollItem = RouterOutputs["poll"]["listAll"][number];

interface PollCardProps {
  poll: PollItem;
}

export function PollCard({ poll }: PollCardProps) {
  const isLive         = poll.status === "active";
  const hasResults     = poll.status === "result_available";
  const participated   = !!poll.participationStatus;
  const approved       = poll.participationStatus === "approved";
  const pending        = poll.participationStatus === "pending";

  return (
    <div
      className={cn(
        "card-hover flex flex-col gap-4 rounded-2xl border bg-card p-5 transition-all",
        isLive ? "border-primary/30" : "border-border",
      )}
    >
      {/* Top row */}
      <div className="flex items-center justify-between gap-2">
        <PollStatusBadge status={poll.status} />
        {participated && (
          <ParticipationBadge
            status={poll.participationStatus as "pending" | "approved" | "rejected"}
          />
        )}
      </div>

      {/* Title + desc */}
      <div className="flex flex-col gap-1">
        <h3 className="font-semibold leading-snug text-foreground">{poll.title}</h3>
        {poll.description && (
          <p className="line-clamp-2 text-xs text-muted-foreground">{poll.description}</p>
        )}
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          Ends {formatDate(poll.endTime)}
        </span>
      </div>

      {/* CTA */}
      {approved && (
        <Button
          asChild
          className={cn(
            "w-full gap-2 font-semibold",
            isLive
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "border-border text-foreground",
          )}
          variant={isLive ? "default" : "outline"}
        >
          <Link href={`/elections/${poll.id}${hasResults ? '/results' : ''}`}>
            {hasResults ? (
              <><BarChart3 className="h-4 w-4" /> View Results</>
            ) : isLive ? (
              <>Vote Now <ArrowRight className="h-4 w-4" /></>
            ) : (
              // FIX: Handle ended/created states properly
              <>View Details</>
            )}
          </Link>
        </Button>
      )}

      {pending && (
        <div className="rounded-lg bg-amber-500/10 px-3 py-2 text-center text-xs font-medium text-amber-400">
          ⏳ Awaiting admin approval
        </div>
      )}

      {!participated && poll.status !== "ended" && poll.status !== "result_available" && (
        <Button asChild variant="outline" className="w-full border-border text-foreground hover:bg-muted/30">
          <Link href={`/elections/${poll.id}`}>
            Request to Participate
          </Link>
        </Button>
      )}
    </div>
  );
}