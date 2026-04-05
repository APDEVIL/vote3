"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/trpc/react";

interface ApproveRejectButtonsProps {
  requestId:  string;
  onSuccess?: () => void;
}

export function ApproveRejectButtons({ requestId, onSuccess }: ApproveRejectButtonsProps) {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason,     setReason]     = useState("");

  const mutation = api.admin.reviewRequest.useMutation({
    onSuccess: (_, vars) => {
      toast.success(`Request ${vars.decision === "approved" ? "approved" : "rejected"}.`);
      setRejectOpen(false);
      setReason("");
      onSuccess?.();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <>
      <div className="flex gap-2">
        {/* Approve */}
        <Button
          onClick={() => mutation.mutate({ requestId, decision: "approved" })}
          disabled={mutation.isPending}
          className="flex-1 gap-1.5 bg-green-500/10 font-semibold text-green-400 hover:bg-green-500/20"
        >
          <Check className="h-4 w-4" />
          Approve
        </Button>

        {/* Reject — opens reason dialog */}
        <Button
          onClick={() => setRejectOpen(true)}
          disabled={mutation.isPending}
          className="flex-1 gap-1.5 bg-red-500/10 font-semibold text-red-400 hover:bg-red-500/20"
        >
          <X className="h-4 w-4" />
          Reject
        </Button>
      </div>

      {/* Rejection reason dialog */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="border-border bg-card sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground">Reject Request</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Reason (optional)
            </Label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Address mismatch, invalid voter card..."
              className="border-border bg-input text-foreground focus-visible:ring-primary"
            />
            <p className="text-xs text-muted-foreground">
              The voter will be notified by email with this reason.
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => setRejectOpen(false)}
              className="text-muted-foreground"
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                mutation.mutate({
                  requestId,
                  decision: "rejected",
                  rejectionReason: reason || undefined,
                })
              }
              disabled={mutation.isPending}
              className="bg-red-500/10 font-semibold text-red-400 hover:bg-red-500/20"
            >
              {mutation.isPending ? "Rejecting..." : "Confirm Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}