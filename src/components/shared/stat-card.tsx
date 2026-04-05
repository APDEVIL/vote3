import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon:        LucideIcon;
  value:       string | number;
  label:       string;
  iconColor?:  string;
  valueColor?: string;
  className?:  string;
}

/**
 * Dashboard stat card — matches the 4-card grid in images 4 + 5.
 *
 * Usage:
 *   <StatCard icon={CheckCircle} value={1} label="Voted" iconColor="text-green-400" />
 */
export function StatCard({
  icon: Icon,
  value,
  label,
  iconColor  = "text-primary",
  valueColor = "text-foreground",
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-6 text-center",
        className,
      )}
    >
      <Icon className={cn("h-6 w-6", iconColor)} />
      <span className={cn("text-3xl font-bold tracking-tight", valueColor)}>{value}</span>
      <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
    </div>
  );
}