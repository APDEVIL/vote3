"use client";

import { Copy, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { APP_NAME } from "@/lib/constants";

export function VoterCard() {
  const { data: profile } = api.user.getProfile.useQuery();

  function copy() {
    if (!profile?.voterCardId) return;
    void navigator.clipboard.writeText(profile.voterCardId);
    toast.success("Voter Card ID copied!");
  }

  return (
    <div className="gradient-border relative overflow-hidden rounded-2xl p-6">
      <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-primary/10 blur-2xl" />

      <div className="relative flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              {APP_NAME}
            </span>
          </div>
          <span className="rounded-full border border-green-500/30 bg-green-500/10 px-2 py-0.5 text-[10px] font-semibold text-green-400">
            OFFICIAL
          </span>
        </div>

        {/* Name */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Voter Name
          </p>
          <p className="mt-0.5 text-lg font-bold text-foreground">{profile?.name ?? "—"}</p>
        </div>

        {/* Voter Card ID */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Voter Card ID
          </p>
          <div className="mt-1 flex items-center gap-3">
            <span className="text-2xl font-extrabold tracking-[0.15em] text-primary">
              {profile?.voterCardId ?? "VC-XXXX-XXXX"}
            </span>
            <button
              onClick={copy}
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Status row */}
        <div className="flex gap-4 border-t border-border pt-3 text-xs">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Email</p>
            <p className={profile?.emailVerified ? "text-green-400" : "text-red-400"}>
              {profile?.emailVerified ? "✓ Verified" : "✗ Unverified"}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Mobile</p>
            <p className={profile?.mobileVerified ? "text-green-400" : "text-red-400"}>
              {profile?.mobileVerified ? "✓ Verified" : "✗ Unverified"}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Admin</p>
            <p className={profile?.isVerified ? "text-green-400" : "text-amber-400"}>
              {profile?.isVerified ? "✓ Approved" : "⏳ Pending"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}