"use client";

import { Clock, CheckCircle, XCircle, FileText } from "lucide-react";
import { ParticipationBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDateTime } from "@/lib/date";
import { api } from "@/trpc/react";

export function RequestStatus() {
  const { data: requests, isLoading } = api.participation.getMyRequests.useQuery();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-muted/30" />
        ))}
      </div>
    );
  }

  if (!requests?.length) {
    return (
      <EmptyState
        icon={FileText}
        title="No participation requests"
        description="Browse elections and submit a request to participate."
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {requests.map((req) => (
        <div
          key={req.id}
          className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-medium text-foreground">
                {req.poll?.title ?? "Unknown poll"}
              </p>
              <p className="text-xs text-muted-foreground">
                Submitted {formatDateTime(req.createdAt)}
              </p>
            </div>
            <ParticipationBadge
              status={req.status as "pending" | "approved" | "rejected"}
            />
          </div>

          {/* Status detail */}
          {req.status === "pending" && (
            <div className="flex items-center gap-2 rounded-lg bg-amber-500/5 px-3 py-2">
              <Clock className="h-3.5 w-3.5 shrink-0 text-amber-400" />
              <p className="text-xs text-amber-400">
                Awaiting admin review. You'll be notified by email.
              </p>
            </div>
          )}

          {req.status === "approved" && (
            <div className="flex items-center gap-2 rounded-lg bg-green-500/5 px-3 py-2">
              <CheckCircle className="h-3.5 w-3.5 shrink-0 text-green-400" />
              <p className="text-xs text-green-400">
                Approved on {req.reviewedAt ? formatDateTime(req.reviewedAt) : "—"}.
                You can now vote in this election.
              </p>
            </div>
          )}

          {req.status === "rejected" && (
            <div className="flex items-center gap-2 rounded-lg bg-red-500/5 px-3 py-2">
              <XCircle className="h-3.5 w-3.5 shrink-0 text-red-400" />
              <p className="text-xs text-red-400">
                Rejected.{req.rejectionReason ? ` Reason: ${req.rejectionReason}` : ""}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}