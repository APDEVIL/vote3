"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Vote,
  ShieldCheck,
  Activity,
  BarChart3,
  Crown,
} from "lucide-react";
import { authClient } from "@/server/better-auth/client";
import { useSession } from "@/hooks/use-session";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";
import { NavUser } from "./nav-user";

// Removed Candidates and Voters from here as they require a [pollId]
const NAV = [
  { label: "Overview",     href: "/admin/dashboard",    icon: LayoutDashboard },
  { label: "Elections",    href: "/admin/elections",    icon: Vote            },
  { label: "Verification", href: "/admin/verification", icon: ShieldCheck     },
  { label: "Live Monitor", href: "/admin/live-monitor", icon: Activity        },
  { label: "Results",      href: "/admin/results",      icon: BarChart3       },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useSession();

  async function handleSignOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/login";
        },
      },
    });
  }

  return (
    <aside className="flex h-screen w-56 flex-col border-r border-border bg-sidebar">
      {/* Logo + admin badge */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <ShieldCheck className="h-6 w-6 text-primary" />
        <span className="text-base font-semibold tracking-tight text-sidebar-foreground">
          {APP_NAME}
        </span>
      </div>

      {/* Admin control panel badge */}
      <div className="mx-3 mb-3 flex items-center gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2">
        <Crown className="h-3.5 w-3.5 text-amber-400" />
        <span className="text-xs font-medium text-amber-400">Admin Control Panel</span>
      </div>

      {/* Nav label */}
      <p className="px-5 pb-2 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
        Management
      </p>

      {/* Nav items */}
      <nav className="flex flex-1 flex-col gap-0.5 px-2">
        {NAV.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                active
                  ? "nav-active text-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom — user + sign out */}
      <div className="border-t border-sidebar-border p-3">
        <NavUser
          name={user?.name ?? "Admin User"}
          email={user?.email ?? ""}
          label="Administrator"
          labelColor="text-amber-400"
          onSignOut={handleSignOut}
        />
      </div>
    </aside>
  );
}