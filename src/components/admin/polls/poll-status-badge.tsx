import { cn } from "@/lib/utils";
import type { PollStatus } from "@/server/db/schema";
import { POLL_STATUS_CONFIG } from "@/lib/constants";

interface PollStatusBadgeProps {
  status:     PollStatus;
  size?:      "sm" | "md";
  className?: string;
}

/** Admin-specific poll status badge — same as shared but with transition controls */
export function PollStatusBadge({ status, size = "md", className }: PollStatusBadgeProps) {
  const config = POLL_STATUS_CONFIG[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-current/20 bg-current/10 font-semibold",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-xs",
        config.color,
        className,
      )}
    >
      {status === "active" ? (
        <span className="live-dot" />
      ) : (
        <span className={cn("h-1.5 w-1.5 rounded-full", config.dotColor)} />
      )}
      {config.label}
    </span>
  );
}