"use client";

import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { PageHeader }       from "@/components/shared/page-header";
import { EmptyState }       from "@/components/shared/empty-state";
import { PollStatusBadge }  from "@/components/admin/polls/poll-status-badge";
import { formatDate }       from "@/lib/date";
import { api }              from "@/trpc/react";

export default function AdminResultsPage() {
  const { data: polls, isLoading } = api.admin.listPolls.useQuery();

  const completed = polls?.filter(
    (p) => p.status === "ended" || p.status === "result_available",
  ) ?? [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Results"
        description="View vote tallies for completed elections"
      />

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-muted/30" />
          ))}
        </div>
      ) : completed.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="No completed elections"
          description="Results will appear here after polls end."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {completed.map((poll) => (
            <Link
              key={poll.id}
              href={`/admin/elections/${poll.id}/results`}
              className="card-hover flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-5 py-4"
            >
              <div className="flex flex-col gap-0.5">
                <p className="font-semibold text-foreground">{poll.title}</p>
                <p className="text-xs text-muted-foreground">
                  Ended {formatDate(poll.endTime)} · {(poll.votesCast ?? 0).toLocaleString()} votes
                </p>
              </div>
              <div className="flex items-center gap-3">
                <PollStatusBadge status={poll.status} />
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}