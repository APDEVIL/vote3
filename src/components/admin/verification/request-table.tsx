"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, X, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import { ParticipationBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/date";
import { api } from "@/trpc/react";
import { RequestDetailDialog } from "./request-detail-dialog";

export function RequestTable() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: requests, isLoading, refetch } = api.admin.listPendingRequests.useQuery();

  const reviewMutation = api.admin.reviewRequest.useMutation({
    onSuccess: (_, vars) => {
      toast.success(`Request ${vars.decision}`);
      void refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  const columns = [
    {
      key: "voter",
      header: "Voter",
      render: (r: NonNullable<typeof requests>[number]) => (
        <div>
          <p className="text-sm font-medium text-foreground">{r.voter?.name}</p>
          <p className="text-xs text-muted-foreground">{r.voter?.voterCardId}</p>
        </div>
      ),
    },
    {
      key: "poll",
      header: "Poll",
      render: (r: NonNullable<typeof requests>[number]) => (
        <span className="text-sm text-foreground">{(r as any).poll?.title ?? "—"}</span>
      ),
    },
    {
      key: "submitted",
      header: "Submitted",
      render: (r: NonNullable<typeof requests>[number]) => (
        <span className="text-sm text-muted-foreground">{formatDate(r.createdAt)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (r: NonNullable<typeof requests>[number]) => (
        <ParticipationBadge status={r.status as "pending" | "approved" | "rejected"} />
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (r: NonNullable<typeof requests>[number]) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSelectedId(r.id)}
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            onClick={() => reviewMutation.mutate({ requestId: r.id, decision: "approved" })}
            disabled={reviewMutation.isPending}
            className="h-7 gap-1 bg-green-500/10 px-2 text-xs font-semibold text-green-400 hover:bg-green-500/20"
          >
            <Check className="h-3 w-3" /> Approve
          </Button>
          <Button
            size="sm"
            onClick={() => reviewMutation.mutate({ requestId: r.id, decision: "rejected" })}
            disabled={reviewMutation.isPending}
            className="h-7 gap-1 bg-red-500/10 px-2 text-xs font-semibold text-red-400 hover:bg-red-500/20"
          >
            <X className="h-3 w-3" /> Reject
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={requests ?? []}
        keyField="id"
        isLoading={isLoading}
        emptyTitle="No pending requests"
        emptyDesc="All participation requests have been reviewed."
      />
      <RequestDetailDialog
        requestId={selectedId}
        open={!!selectedId}
        onOpenChange={(v) => !v && setSelectedId(null)}
        onReview={() => void refetch()}
      />
    </>
  );
}