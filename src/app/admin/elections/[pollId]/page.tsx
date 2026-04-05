"use client";

import { use } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Users, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { PollStatusBadge } from "@/components/admin/polls/poll-status-badge";
import { ErrorState } from "@/components/shared/error-state";
import { formatDateTime } from "@/lib/date";
import { api } from "@/trpc/react";

interface Props { params: Promise<{ pollId: string }> }

const TRANSITIONS: Record<string, { label: string; next: "active" | "ended" | "result_available" }> = {
  created: { label: "Activate Poll",   next: "active"           },
  active:  { label: "End Poll",        next: "ended"            },
  ended:   { label: "Publish Results", next: "result_available" },
};

export default function AdminPollDetailPage({ params }: Props) {
  const { pollId } = use(params);
  const { data, isLoading, error, refetch } = api.admin.getPollDetail.useQuery({ pollId });

  const statusMutation = api.admin.updatePollStatus.useMutation({
    onSuccess: (r) => {
      toast.success(`Poll moved to "${r.poll.status}"`);
      void refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) return <div className="h-48 animate-pulse rounded-2xl bg-muted/30" />;
  if (error || !data) return <ErrorState onRetry={() => refetch()} />;

  const transition = TRANSITIONS[data.status];

  return (
    <div className="flex flex-col gap-6">
      {/* Back */}
      <Link href="/admin/elections" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground w-fit">
        <ArrowLeft className="h-4 w-4" /> Back to Elections
      </Link>

      <PageHeader title={data.title}>
        {transition && (
          <Button
            onClick={() => statusMutation.mutate({ pollId, newStatus: transition.next })}
            disabled={statusMutation.isPending}
            className="bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
          >
            {statusMutation.isPending ? "Updating..." : transition.label}
          </Button>
        )}
      </PageHeader>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Status",       value: <PollStatusBadge status={data.status} /> },
          { label: "Votes Cast",   value: <span className="text-xl font-bold text-primary">{data.votesCast.toLocaleString()}</span> },
          { label: "Participants", value: <span className="text-xl font-bold text-foreground">{data.approvedParticipants}</span> },
          { label: "Candidates",   value: <span className="text-xl font-bold text-foreground">{data.candidates.length}</span> },
        ].map(({ label, value }) => (
          <div key={label} className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
            {value}
          </div>
        ))}
      </div>

      {/* Dates */}
      <div className="flex flex-col gap-1 rounded-xl border border-border bg-card px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Voting Window</p>
        <p className="text-sm text-foreground">
          {formatDateTime(data.startTime)} → {formatDateTime(data.endTime)}
        </p>
      </div>

      {/* Navigation to sub-pages */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link
          href={`/admin/elections/${pollId}/candidates`}
          className="card-hover flex items-center gap-3 rounded-xl border border-border bg-card p-4"
        >
          <Users className="h-5 w-5 text-primary" />
          <div>
            <p className="font-semibold text-foreground">Manage Candidates</p>
            <p className="text-xs text-muted-foreground">{data.candidates.length} candidates</p>
          </div>
        </Link>
        {(data.status === "ended" || data.status === "result_available") && (
          <Link
            href={`/admin/elections/${pollId}/results`}
            className="card-hover flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4"
          >
            <BarChart3 className="h-5 w-5 text-primary" />
            <div>
              <p className="font-semibold text-foreground">View Results</p>
              <p className="text-xs text-muted-foreground">{data.votesCast} votes cast</p>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}