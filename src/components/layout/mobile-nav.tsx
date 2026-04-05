"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Vote, Zap, User } from "lucide-react";
import { cn } from "@/lib/utils";

const VOTER_TABS = [
  { label: "Home",      href: "/dashboard",  icon: LayoutDashboard },
  { label: "Elections", href: "/elections",  icon: Vote            },
  { label: "Live",      href: "/live-polls", icon: Zap             },
  { label: "Profile",   href: "/profile",    icon: User            },
];

/** Bottom tab bar shown on mobile for voter layout */
export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-border bg-card md:hidden">
      {VOTER_TABS.map(({ label, href, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors",
              active ? "text-primary" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}