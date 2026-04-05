"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Vote,
  Zap,
  User,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { authClient } from "@/server/better-auth/client";
import { useSession } from "@/hooks/use-session";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";
import { NavUser } from "./nav-user";

const NAV = [
  { label: "Dashboard",  href: "/dashboard",  icon: LayoutDashboard },
  { label: "Elections",  href: "/elections",  icon: Vote             },
  { label: "Live Polls", href: "/live-polls", icon: Zap              },
  { label: "Profile",    href: "/profile",    icon: User             },
];

export function VoterSidebar() {
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
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <ShieldCheck className="h-6 w-6 text-primary" />
        <span className="text-base font-semibold tracking-tight text-sidebar-foreground">
          {APP_NAME}
        </span>
      </div>

      {/* Nav label */}
      <p className="px-5 pb-2 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
        Navigation
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
          name={user?.name ?? ""}
          email={user?.email ?? ""}
          label="Verified Voter"
          onSignOut={handleSignOut}
        />
      </div>
    </aside>
  );
}