"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";

export function LandingNavbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b border-white/5 bg-background/80 px-8 py-4 backdrop-blur-md">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5">
        <ShieldCheck className="h-6 w-6 text-primary" />
        <span className="text-base font-bold tracking-tight text-foreground">
          {APP_NAME}
        </span>
      </Link>

      {/* Center nav links */}
      <div className="hidden items-center gap-8 md:flex">
        {["Features", "Security", "How It Works", "About"].map((item) => (
          <a
            key={item}
            href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {item}
          </a>
        ))}
      </div>

      {/* CTA buttons */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          asChild
          className="text-sm text-foreground hover:bg-white/5"
        >
          <Link href="/login">Sign In</Link>
        </Button>
        <Button
          asChild
          className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-semibold"
        >
          <Link href="/register">Get Started →</Link>
        </Button>
      </div>
    </nav>
  );
}