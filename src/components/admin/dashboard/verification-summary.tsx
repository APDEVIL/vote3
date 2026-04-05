"use client";

import { Progress } from "@/components/ui/progress";
import { api } from "@/trpc/react";

export function VerificationSummary() {
  const { data, isLoading } = api.admin.getOverview.useQuery();

  const total    = data?.totalVoters    ?? 0;
  const verified = data?.verifiedVoters ?? 0;
  const pending  = data?.pendingRequests ?? 0;
  const active   = verified;
  const pct      = total > 0 ? Math.round((verified / total) * 100) : 0;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
      <h3 className="font-semibold text-foreground">Voter Verification</h3>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-6 animate-pulse rounded bg-muted/30" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Verified bar */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Verified</span>
              <span className="font-semibold text-foreground">
                {verified}/{total}
              </span>
            </div>
            <Progress value={pct} className="h-2 bg-muted" />
          </div>

          {/* Summary rows */}
          <div className="flex flex-col gap-2 border-t border-border pt-3">
            {[
              { label: "Active",  value: active,  color: "text-green-400" },
              { label: "Pending", value: pending, color: "text-amber-400" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground uppercase tracking-wider text-xs font-semibold">
                  {label}
                </span>
                <span className={`font-bold text-lg ${color}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}