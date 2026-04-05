import { cn } from "@/lib/utils";
import type { PollStatus } from "@/server/db/schema";
import { POLL_STATUS_CONFIG, PARTICIPATION_STATUS_CONFIG } from "@/lib/constants";

// ── Poll status badge ──────────────────────────────────────────────────────────

interface PollStatusBadgeProps {
  status:    PollStatus;
  className?: string;
}

export function PollStatusBadge({ status, className }: PollStatusBadgeProps) {
  const config = POLL_STATUS_CONFIG[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        "border border-current/20 bg-current/10",
        config.color,
        className,
      )}
    >
      {/* Animated dot for live polls */}
      {status === "active" ? (
        <span className="live-dot" />
      ) : (
        <span className={cn("h-1.5 w-1.5 rounded-full", config.dotColor)} />
      )}
      {config.label}
    </span>
  );
}

// ── Participation status badge ─────────────────────────────────────────────────

type ParticipationStatus = "pending" | "approved" | "rejected";

interface ParticipationBadgeProps {
  status:    ParticipationStatus;
  className?: string;
}

export function ParticipationBadge({ status, className }: ParticipationBadgeProps) {
  const config = PARTICIPATION_STATUS_CONFIG[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        config.color,
        config.bg,
        className,
      )}
    >
      {status === "pending"  && "● Pending"}
      {status === "approved" && "✓ Approved"}
      {status === "rejected" && "✕ Rejected"}
    </span>
  );
}

// ── Generic label badge ────────────────────────────────────────────────────────

interface LabelBadgeProps {
  label:     string;
  variant?:  "cyan" | "green" | "amber" | "red" | "slate";
  className?: string;
}

const VARIANT_STYLES: Record<NonNullable<LabelBadgeProps["variant"]>, string> = {
  cyan:  "bg-cyan-500/10  text-cyan-400  border-cyan-500/20",
  green: "bg-green-500/10 text-green-400 border-green-500/20",
  amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  red:   "bg-red-500/10   text-red-400   border-red-500/20",
  slate: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

export function LabelBadge({ label, variant = "cyan", className }: LabelBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        VARIANT_STYLES[variant],
        className,
      )}
    >
      {label}
    </span>
  );
}