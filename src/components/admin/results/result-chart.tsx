"use client";

import { api } from "@/trpc/react";

interface ResultsChartProps {
  pollId: string;
}

/** Bar chart showing vote distribution per candidate */
export function ResultsChart({ pollId }: ResultsChartProps) {
  const { data, isLoading } = api.admin.getResults.useQuery({ pollId });

  if (isLoading) {
    return <div className="h-48 animate-pulse rounded-xl bg-muted/30" />;
  }

  if (!data?.results.length) return null;

  const total  = data.totalVotes;
  const max    = data.results[0]?.votes ?? 1;

  const BAR_COLORS = [
    "bg-amber-400",
    "bg-primary",
    "bg-purple-400",
    "bg-green-400",
    "bg-coral-400",
    "bg-pink-400",
  ];

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
      <h3 className="font-semibold text-foreground">Vote Distribution</h3>

      {/* Bar chart */}
      <div className="flex items-end gap-3 overflow-x-auto pb-2" style={{ height: 160 }}>
        {data.results.map((r, i) => {
          const heightPct = max > 0 ? (r.votes / max) * 100 : 0;
          const pct       = total > 0 ? Math.round((r.votes / total) * 100) : 0;
          const color     = BAR_COLORS[i % BAR_COLORS.length]!;

          return (
            <div
              key={r.candidateId}
              className="flex min-w-[64px] flex-1 flex-col items-center gap-1"
            >
              {/* Value label */}
              <span className="text-xs font-semibold text-foreground">{pct}%</span>

              {/* Bar */}
              <div className="flex w-full flex-col justify-end rounded-md bg-muted/30" style={{ height: 120 }}>
                <div
                  className={`w-full rounded-md transition-all duration-700 ${color} opacity-80`}
                  style={{ height: `${heightPct}%`, minHeight: r.votes > 0 ? 4 : 0 }}
                />
              </div>

              {/* Label */}
              <span className="w-full truncate text-center text-[10px] text-muted-foreground">
                {r.name}
              </span>
              <span className="text-[10px] font-semibold text-foreground">
                {r.votes.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}