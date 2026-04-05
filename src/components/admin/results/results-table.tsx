"use client";

import { Trophy } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/shared/empty-state";
import { api } from "@/trpc/react";
import { cn } from "@/lib/utils";

interface ResultsTableProps {
  pollId: string;
}

export function ResultsTable({ pollId }: ResultsTableProps) {
  const { data, isLoading } = api.admin.getResults.useQuery({ pollId });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-muted/30" />
        ))}
      </div>
    );
  }

  if (!data?.results.length) {
    return <EmptyState icon={Trophy} title="No results" description="No votes have been cast." />;
  }

  const total   = data.totalVotes;
  const winner  = data.results[0];

  return (
    <div className="flex flex-col gap-3">
      {/* Total */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
        <span className="text-sm text-muted-foreground">Total votes cast</span>
        <span className="text-lg font-bold text-primary">{total.toLocaleString()}</span>
      </div>

      {/* Rows */}
      {data.results.map((r, i) => {
        const pct = total > 0 ? Math.round((r.votes / total) * 100) : 0;
        const isWinner = r.candidateId === winner?.candidateId;

        return (
          <div
            key={r.candidateId}
            className={cn(
              "flex flex-col gap-2 rounded-xl border p-4 transition-all",
              isWinner ? "border-amber-500/30 bg-amber-500/5" : "border-border bg-card",
            )}
          >
            <div className="flex items-center justify-between gap-3">
              {/* Rank + name */}
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                    i === 0
                      ? "bg-amber-500/20 text-amber-400"
                      : i === 1
                        ? "bg-slate-400/20 text-slate-300"
                        : i === 2
                          ? "bg-orange-600/20 text-orange-400"
                          : "bg-muted text-muted-foreground",
                  )}
                >
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                </div>
                <div>
                  <p className={cn("font-semibold", isWinner ? "text-amber-300" : "text-foreground")}>
                    {r.name}
                  </p>
                  {isWinner && (
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-400">
                      Winner
                    </p>
                  )}
                </div>
              </div>

              {/* Votes + pct */}
              <div className="flex flex-col items-end gap-0.5">
                <span className="font-bold text-foreground">{r.votes.toLocaleString()}</span>
                <span className="text-xs text-muted-foreground">{pct}%</span>
              </div>
            </div>

            <Progress
              value={pct}
              className={cn(
                "h-1.5",
                isWinner ? "bg-amber-500/20" : "bg-muted",
              )}
            />
          </div>
        );
      })}
    </div>
  );
}