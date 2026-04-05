"use client";

import Link from "next/link";
import { CheckCircle, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface StepCompleteProps {
  voterCardId: string;
  name:        string;
}

/**
 * Step 5 — Registration complete.
 * Shows the generated Voter Card ID prominently.
 * User must copy/note this before proceeding.
 */
export function StepComplete({ voterCardId, name }: StepCompleteProps) {
  function copyVoterCardId() {
    void navigator.clipboard.writeText(voterCardId);
    toast.success("Voter Card ID copied!");
  }

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      {/* Success icon */}
      <div className="flex h-20 w-20 items-center justify-center rounded-full border border-green-500/30 bg-green-500/10">
        <CheckCircle className="h-10 w-10 text-green-400" />
      </div>

      <div>
        <h3 className="text-xl font-bold text-foreground">
          Welcome, {name.split(" ")[0]}!
        </h3>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Your voter account has been created successfully.
        </p>
      </div>

      {/* Voter Card ID — prominent display */}
      <div className="w-full rounded-xl border border-primary/30 bg-primary/5 p-5">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Your Voter Card ID
        </p>
        <div className="flex items-center justify-center gap-3">
          <span className="text-2xl font-bold tracking-[0.15em] text-primary">
            {voterCardId}
          </span>
          <button
            onClick={copyVoterCardId}
            className="text-muted-foreground transition-colors hover:text-primary"
          >
            <Copy className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Save this ID — you'll need it to request election participation.
        </p>
      </div>

      {/* What's next info */}
      <div className="w-full rounded-xl border border-border bg-card/50 p-4 text-left">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          What's next?
        </p>
        <ul className="flex flex-col gap-1.5 text-xs text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-primary">→</span>
            Log in to your voter dashboard
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-primary">→</span>
            Browse available elections
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-primary">→</span>
            Submit a participation request using your Voter Card ID
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-primary">→</span>
            Once approved by admin, cast your vote
          </li>
        </ul>
      </div>

      <Button
        asChild
        className="w-full bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
      >
        <Link href="/login">Go to Login →</Link>
      </Button>
    </div>
  );
}