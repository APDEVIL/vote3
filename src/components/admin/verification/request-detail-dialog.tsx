"use client";

import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ParticipationBadge } from "@/components/shared/status-badge";
import { formatDateTime } from "@/lib/date";
import { api } from "@/trpc/react";

interface Props {
  requestId:     string | null;
  open:          boolean;
  onOpenChange:  (v: boolean) => void;
  onReview:      () => void;
}

export function RequestDetailDialog({ requestId, open, onOpenChange, onReview }: Props) {
  const { data: requests } = api.admin.listPendingRequests.useQuery();
  const request = requests?.find((r) => r.id === requestId);

  const reviewMutation = api.admin.reviewRequest.useMutation({
    onSuccess: (_, vars) => {
      toast.success(`Request ${vars.decision}`);
      onOpenChange(false);
      onReview();
    },
    onError: (e) => toast.error(e.message),
  });

  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Participation Request</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Voter info */}
          <div className="rounded-xl border border-border bg-background/50 p-4">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Voter Details
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: "Name",          value: request.voter?.name },
                { label: "Email",         value: request.voter?.email },
                { label: "Voter Card ID", value: request.voter?.voterCardId },
                { label: "Mobile",        value: request.voter?.mobile ?? "—" },
                { label: "Address",       value: request.address },
                { label: "Pincode",       value: request.pincode },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[10px] text-muted-foreground">{label}</p>
                  <p className="font-medium text-foreground">{value ?? "—"}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Submission info */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Submitted {formatDateTime(request.createdAt)}</span>
            <ParticipationBadge status={request.status as "pending" | "approved" | "rejected"} />
          </div>

          {/* Actions */}
          {request.status === "pending" && (
            <div className="flex gap-3">
              <Button
                onClick={() => reviewMutation.mutate({ requestId: request.id, decision: "rejected" })}
                disabled={reviewMutation.isPending}
                className="flex-1 bg-red-500/10 font-semibold text-red-400 hover:bg-red-500/20"
              >
                Reject
              </Button>
              <Button
                onClick={() => reviewMutation.mutate({ requestId: request.id, decision: "approved" })}
                disabled={reviewMutation.isPending}
                className="flex-1 bg-green-500/10 font-semibold text-green-400 hover:bg-green-500/20"
              >
                Approve
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}