/**
 * lib/date.ts
 *
 * Date formatting utilities used across the UI.
 * No external date library needed — native Intl API.
 */

/** "Mar 28, 2026" */
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day:   "numeric",
    month: "short",
    year:  "numeric",
  }).format(new Date(date));
}

/** "Mar 28, 2026 at 6:30 PM" */
export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day:    "numeric",
    month:  "short",
    year:   "numeric",
    hour:   "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(date));
}

/** "6:30 PM" */
export function formatTime(date: Date | string): string {
  return new Intl.DateTimeFormat("en-IN", {
    hour:   "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(date));
}

/** Returns true if current time is within poll's voting window */
export function isWithinVotingWindow(startTime: Date | string, endTime: Date | string): boolean {
  const now = Date.now();
  return now >= new Date(startTime).getTime() && now <= new Date(endTime).getTime();
}

/** "2 hours ago" / "in 3 days" */
export function timeAgo(date: Date | string): string {
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const diff = new Date(date).getTime() - Date.now();
  const seconds = Math.round(diff / 1000);
  const minutes = Math.round(seconds / 60);
  const hours   = Math.round(minutes / 60);
  const days    = Math.round(hours / 24);

  if (Math.abs(days)    > 0) return rtf.format(days,    "day");
  if (Math.abs(hours)   > 0) return rtf.format(hours,   "hour");
  if (Math.abs(minutes) > 0) return rtf.format(minutes, "minute");
  return rtf.format(seconds, "second");
}

/** Duration between two dates in human-readable form: "3 days" */
export function formatDuration(start: Date | string, end: Date | string): string {
  const diffMs = new Date(end).getTime() - new Date(start).getTime();
  const hours  = Math.round(diffMs / (1000 * 60 * 60));
  const days   = Math.round(hours / 24);

  if (days >= 1) return `${days} day${days !== 1 ? "s" : ""}`;
  return `${hours} hour${hours !== 1 ? "s" : ""}`;
}