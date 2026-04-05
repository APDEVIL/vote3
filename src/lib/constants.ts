/**
 * lib/constants.ts
 *
 * App-wide constants — nav items, poll status config, feature list.
 * Import from here — never hardcode these in components.
 */

import type { PollStatus } from "@/server/db/schema";

// ── App ────────────────────────────────────────────────────────────────────────

export const APP_NAME = "VoteSecure";
export const APP_DESCRIPTION = "Secure, anonymous digital voting platform";

// ── Voter sidebar navigation ───────────────────────────────────────────────────

export const VOTER_NAV_ITEMS = [
  { label: "Dashboard",   href: "/dashboard",   icon: "LayoutDashboard" },
  { label: "Elections",   href: "/elections",   icon: "Vote" },
  { label: "Live Polls",  href: "/live-polls",  icon: "Zap" },
  { label: "Profile",     href: "/profile",     icon: "User" },
] as const;

// ── Admin sidebar navigation ───────────────────────────────────────────────────

export const ADMIN_NAV_ITEMS = [
  { label: "Overview",      href: "/dashboard",     icon: "LayoutDashboard" },
  { label: "Elections",     href: "/elections",     icon: "Vote" },
  { label: "Candidates",    href: "/candidates",    icon: "Users" },
  { label: "Voters",        href: "/voters",        icon: "UserCheck" },
  { label: "Verification",  href: "/verification",  icon: "ShieldCheck" },
  { label: "Live Monitor",  href: "/live-monitor",  icon: "Activity" },
  { label: "Results",       href: "/results",       icon: "BarChart3" },
] as const;

// ── Poll status display config ─────────────────────────────────────────────────

export const POLL_STATUS_CONFIG: Record<
  PollStatus,
  { label: string; color: string; dotColor: string }
> = {
  created:          { label: "Upcoming",        color: "text-yellow-400",  dotColor: "bg-yellow-400" },
  active:           { label: "Live",            color: "text-green-400",   dotColor: "bg-green-400"  },
  ended:            { label: "Ended",           color: "text-slate-400",   dotColor: "bg-slate-400"  },
  result_available: { label: "Results Ready",   color: "text-cyan-400",    dotColor: "bg-cyan-400"   },
};

// ── Participation status display ───────────────────────────────────────────────

export const PARTICIPATION_STATUS_CONFIG = {
  pending:  { label: "Pending",  color: "text-yellow-400",  bg: "bg-yellow-400/10" },
  approved: { label: "Approved", color: "text-green-400",   bg: "bg-green-400/10"  },
  rejected: { label: "Rejected", color: "text-red-400",     bg: "bg-red-400/10"    },
} as const;

// ── Registration steps (image 3) ───────────────────────────────────────────────

export const REGISTER_STEPS = [
  { step: 1, label: "Details" },
  { step: 2, label: "OTP"     },
  { step: 3, label: "Face"    },
  { step: 4, label: "Done"    },
] as const;

// ── Landing page features (images 1+2) ────────────────────────────────────────

export const LANDING_FEATURES = [
  {
    icon: "🔐",
    title: "Zero-Trust Security",
    description: "Military-grade AES-256 encryption with end-to-end verification on every ballot.",
  },
  {
    icon: "🔗",
    title: "Blockchain Integrity",
    description: "Every vote immutably recorded. Fully auditable, completely tamper-proof.",
  },
  {
    icon: "🪪",
    title: "Voter Verification",
    description: "Real-time identity verification ensures one citizen, one verified vote.",
  },
  {
    icon: "⚡",
    title: "Real-Time Results",
    description: "Live vote tallies with cryptographic counting and public audit trails.",
  },
  {
    icon: "🌐",
    title: "Universal Access",
    description: "Vote from any device, anywhere. 12 languages, offline-capable.",
  },
  {
    icon: "👁",
    title: "Public Auditability",
    description: "Anyone can verify integrity without revealing individual choices.",
  },
] as const;

// ── OTP config (must match server otp.service.ts) ─────────────────────────────

export const OTP_LENGTH = 6;
export const OTP_EXPIRY_MINUTES = 10;

// ── Pagination ─────────────────────────────────────────────────────────────────

export const DEFAULT_PAGE_SIZE = 20;