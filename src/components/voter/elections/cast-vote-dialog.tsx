"use client";

import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { api } from "@/trpc/react";

interface CastVoteDialogProps {
  open:          boolean;
  onOpenChange:  (v: boolean) => void;
  pollId:        string;
  candidateId:   string;
  candidateName: string;
  onSuccess:     () => void;
}

export function CastVoteDialog({
  open, onOpenChange, pollId, candidateId, candidateName, onSuccess,
}: CastVoteDialogProps) {
  const mutation = api.vote.cast.useMutation({
    onSuccess: () => {
      toast.success("Your vote has been cast anonymously!");
      onOpenChange(false);
      onSuccess();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Confirm your vote"
      description={`You are voting for "${candidateName}". This action is permanent and cannot be changed. Your vote is stored anonymously.`}
      confirmLabel="Submit vote"
      isLoading={mutation.isPending}
      onConfirm={() => mutation.mutate({ pollId, candidateId })}
    />
  );
}