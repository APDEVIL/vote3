import Link from "next/link";
import { CheckCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/date";

interface VoteConfirmationProps {
  pollTitle: string;
  votedAt:   Date | string;
  pollId:    string;
}

/** Success state shown after a vote is cast successfully */
export function VoteConfirmation({ pollTitle, votedAt, pollId }: VoteConfirmationProps) {
  return (
    <div className="flex flex-col items-center gap-6 rounded-2xl border border-green-500/20 bg-green-500/5 px-6 py-10 text-center">
      {/* Icon */}
      <div className="flex h-20 w-20 items-center justify-center rounded-full border border-green-500/30 bg-green-500/10">
        <CheckCircle className="h-10 w-10 text-green-400" />
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-xl font-bold text-foreground">Vote Cast Successfully!</h3>
        <p className="text-sm text-muted-foreground">
          Your vote in <span className="font-medium text-foreground">"{pollTitle}"</span> has been
          recorded anonymously.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Recorded at {formatDateTime(votedAt)}
        </p>
      </div>

      {/* Privacy note */}
      <div className="flex w-full items-center gap-3 rounded-xl border border-border bg-card/50 px-4 py-3 text-left">
        <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
        <p className="text-xs text-muted-foreground">
          Your vote is stored anonymously. It cannot be traced back to you and cannot be changed.
        </p>
      </div>

      <div className="flex w-full gap-3">
        <Button
          asChild
          variant="outline"
          className="flex-1 border-border text-foreground hover:bg-muted/30"
        >
          <Link href="/elections">All Elections</Link>
        </Button>
        <Button
          asChild
          className="flex-1 bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <Link href="/dashboard">Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}