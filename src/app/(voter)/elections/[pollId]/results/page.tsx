// src/app/(voter)/elections/[pollId]/results/page.tsx

"use client";

import { use } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { ErrorState } from "@/components/shared/error-state";
import { Progress } from "@/components/ui/progress";
import { api } from "@/trpc/react";
import { formatDateTime } from "@/lib/date";

interface Props { params: Promise<{ pollId: string }> }

export default function PollResultsPage({ params }: Props) {
  const { pollId } = use(params);
  const { data, isLoading, error, refetch } = api.poll.getResults.useQuery({ pollId });

  if (error) return <ErrorState onRetry={() => refetch()} />;

  const total = data?.results.reduce((s, r) => s + r.votes, 0) ?? 0;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <PageHeader
        title={data?.poll.title ?? "Results"}
        description="Final vote tally — results are public after poll closes"
      />

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-muted/30" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-sm">
            <span className="text-muted-foreground">Total votes cast</span>
            <span className="font-bold text-primary">{total.toLocaleString()}</span>
          </div>

          {data?.results.map((r, i) => {
            const pct = total > 0 ? Math.round((r.votes / total) * 100) : 0;
            return (
              <div key={r.candidateId} className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}</span>
                    <span className="font-semibold text-foreground">{r.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">{r.votes.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{pct}%</p>
                  </div>
                </div>
                <Progress value={pct} className="h-1.5 bg-muted" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}