"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";

interface CandidateManagerProps {
  pollId: string;
}

export function CandidateManager({ pollId }: CandidateManagerProps) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  const { data, refetch } = api.admin.getPollDetail.useQuery({ pollId });

  const addMutation = api.admin.addCandidate.useMutation({
    onSuccess: () => {
      toast.success("Candidate added!");
      setName("");
      setDesc("");
      void refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  const removeMutation = api.admin.removeCandidate.useMutation({
    onSuccess: () => { toast.success("Candidate removed."); void refetch(); },
    onError:   (e) => toast.error(e.message),
  });

  const canEdit = data?.status === "created";

  return (
    <div className="flex flex-col gap-4">
      {/* Existing candidates */}
      <div className="flex flex-col gap-2">
        {data?.candidates.map((c, i) => (
          <div
            key={c.id}
            className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              {i + 1}
            </div>
            <div className="flex flex-1 flex-col">
              <span className="text-sm font-medium text-foreground">{c.name}</span>
              {c.description && (
                <span className="text-xs text-muted-foreground">{c.description}</span>
              )}
            </div>
            {canEdit && (
              <button
                onClick={() => removeMutation.mutate({ candidateId: c.id })}
                disabled={removeMutation.isPending}
                className="text-muted-foreground transition-colors hover:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}

        {!data?.candidates.length && (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No candidates yet. Add at least one below.
          </p>
        )}
      </div>

      {/* Add form */}
      {canEdit && (
        <div className="flex flex-col gap-3 rounded-xl border border-dashed border-border bg-card/50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Add Candidate
          </p>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Candidate name"
            className="border-border bg-input text-foreground focus-visible:ring-primary"
          />
          <Input
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Description (optional)"
            className="border-border bg-input text-foreground focus-visible:ring-primary"
          />
          <Button
            onClick={() => addMutation.mutate({ pollId, name, description: desc || undefined, order: data?.candidates.length ?? 0 })}
            disabled={!name.trim() || addMutation.isPending}
            className="w-full gap-2 bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            {addMutation.isPending ? "Adding..." : "Add Candidate"}
          </Button>
        </div>
      )}
    </div>
  );
}