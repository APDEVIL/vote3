import Link from "next/link";
import { Vote, Zap, Users } from "lucide-react";

const ACTIONS = [
  { icon: Vote,  label: "Create Election", sub: "Launch new vote",    href: "/admin/elections/new" },
  { icon: Zap,   label: "Create Poll",     sub: "Quick opinion poll", href: "/admin/elections/new" },
  { icon: Users, label: "Add Candidate",   sub: "Assign to election", href: "/admin/elections" },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {ACTIONS.map(({ icon: Icon, label, sub, href }) => (
        <Link
          key={label}
          href={href}
          className="card-hover flex items-center gap-3 rounded-xl border border-border bg-card p-4"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-4.5 w-4.5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{label}</p>
            <p className="text-xs text-muted-foreground">{sub}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}