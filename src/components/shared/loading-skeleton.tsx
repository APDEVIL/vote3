import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// ── Generic skeleton block ─────────────────────────────────────────────────────

interface SkeletonBlockProps {
  className?: string;
}

export function SkeletonBlock({ className }: SkeletonBlockProps) {
  return <Skeleton className={cn("rounded-xl bg-muted/60", className)} />;
}

// ── Stat card skeleton (dashboard grid) ───────────────────────────────────────

export function StatCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
      <SkeletonBlock className="h-8 w-8 rounded-lg" />
      <SkeletonBlock className="h-7 w-16" />
      <SkeletonBlock className="h-3.5 w-24" />
    </div>
  );
}

// ── Election card skeleton ─────────────────────────────────────────────────────

export function ElectionCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <SkeletonBlock className="h-5 w-16 rounded-full" />
        <SkeletonBlock className="h-4 w-20" />
      </div>
      <SkeletonBlock className="h-5 w-3/4" />
      <SkeletonBlock className="h-4 w-full" />
      <div className="flex items-center gap-3">
        <SkeletonBlock className="h-4 w-24" />
        <SkeletonBlock className="h-4 w-24" />
      </div>
      <SkeletonBlock className="h-9 w-full rounded-lg" />
    </div>
  );
}

// ── Table row skeleton ─────────────────────────────────────────────────────────

interface TableSkeletonProps {
  rows?:    number;
  cols?:    number;
}

export function TableSkeleton({ rows = 5, cols = 4 }: TableSkeletonProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      {/* Header */}
      <div className="flex gap-4 border-b border-border bg-muted/30 px-4 py-3">
        {Array.from({ length: cols }).map((_, i) => (
          <SkeletonBlock key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, row) => (
        <div
          key={row}
          className="flex gap-4 border-b border-border/50 px-4 py-3 last:border-0"
        >
          {Array.from({ length: cols }).map((_, col) => (
            <SkeletonBlock
              key={col}
              className={cn("h-4 flex-1", col === 0 ? "max-w-[120px]" : "")}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Dashboard skeleton (full page) ────────────────────────────────────────────

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Welcome banner */}
      <SkeletonBlock className="h-28 w-full" />
      {/* Stat grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
      {/* Cards */}
      <SkeletonBlock className="h-5 w-40" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => <ElectionCardSkeleton key={i} />)}
      </div>
    </div>
  );
}