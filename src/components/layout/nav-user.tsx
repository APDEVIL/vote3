"use client";

import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface NavUserProps {
  name:        string;
  email:       string;
  label:       string;
  labelColor?: string;
  onSignOut:   () => void;
}

export function NavUser({ name, email, label, labelColor = "text-green-400", onSignOut }: NavUserProps) {
  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <div className="flex items-center gap-2.5">
      {/* Avatar */}
      <Avatar className="h-8 w-8 shrink-0 border border-sidebar-border">
        <AvatarFallback className="bg-primary/20 text-xs font-semibold text-primary">
          {initials}
        </AvatarFallback>
      </Avatar>

      {/* Name + role */}
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-xs font-medium text-sidebar-foreground">{name}</span>
        <span className={cn("text-[10px] font-medium", labelColor)}>
          ● {label}
        </span>
      </div>

      {/* Sign out */}
      <button
        onClick={onSignOut}
        className="ml-auto shrink-0 text-muted-foreground transition-colors hover:text-red-400"
        title="Sign out"
      >
        <LogOut className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}