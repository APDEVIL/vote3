"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "@/hooks/use-session";
import { authClient } from "@/server/better-auth/client";

interface TopbarProps {
  /** Show amber "ADMIN MODE" pill */
  isAdmin?: boolean;
}

export function Topbar({ isAdmin = false }: TopbarProps) {
  const { user } = useSession();

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  async function handleSignOut() {
    await authClient.signOut({
      fetchOptions: { 
        onSuccess: () => {
          window.location.href = "/login";
        } 
      },
    });
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
      {/* Left — admin mode badge */}
      <div>
        {isAdmin && (
          <div className="flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            <span className="text-xs font-semibold tracking-widest text-amber-400 uppercase">
              Admin Mode
            </span>
          </div>
        )}
      </div>

      {/* Right — bell + user */}
      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <Button variant="ghost" size="icon" className="relative h-9 w-9 text-muted-foreground hover:text-foreground">
          <Bell className="h-4.5 w-4.5" />
          {/* Unread dot */}
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary" />
        </Button>

        {/* User avatar dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              <Avatar className="h-8 w-8 border border-border">
                <AvatarFallback className="bg-primary/20 text-xs font-semibold text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-foreground">
                {user?.name?.split(" ")[0] ?? "User"}
              </span>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-44 border-border bg-card">
            <div className="px-2 py-1.5">
              <p className="text-xs font-medium text-foreground">{user?.name}</p>
              <p className="text-[11px] text-muted-foreground">{user?.email}</p>
            </div>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="cursor-pointer text-sm text-red-400 focus:bg-red-500/10 focus:text-red-400"
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}