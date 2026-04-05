"use client";

import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { LabelBadge } from "@/components/shared/status-badge";
import { formatDateTime } from "@/lib/date";
import { api } from "@/trpc/react";

interface VoterDetailSheetProps {
  voterId:      string | null;
  open:         boolean;
  onOpenChange: (v: boolean) => void;
}

export function VoterDetailSheet({ voterId, open, onOpenChange }: VoterDetailSheetProps) {
  const { data: voters } = api.admin.listVoters.useQuery();
  const voter = voters?.find((v) => v.id === voterId);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="border-border bg-card text-foreground">
        <SheetHeader>
          <SheetTitle className="text-foreground">Voter Details</SheetTitle>
        </SheetHeader>

        {voter && (
          <div className="mt-6 flex flex-col gap-5">
            {/* Avatar + name */}
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                {voter.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-foreground">{voter.name}</p>
                <p className="text-xs text-muted-foreground">{voter.email}</p>
              </div>
            </div>

            {/* Info grid */}
            <div className="flex flex-col gap-3 rounded-xl border border-border bg-background/50 p-4">
              {[
                { label: "Voter Card ID", value: voter.voterCardId, mono: true },
                { label: "Mobile",        value: voter.mobile ?? "—" },
                { label: "Joined",        value: formatDateTime(voter.createdAt) },
              ].map(({ label, value, mono }) => (
                <div key={label} className="flex flex-col gap-0.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {label}
                  </p>
                  <p className={`text-sm text-foreground ${mono ? "font-mono" : ""}`}>
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {/* Status badges */}
            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Verification Status
              </p>
              <div className="flex flex-wrap gap-2">
                <LabelBadge label={voter.isVerified ? "Admin Approved" : "Pending Approval"} variant={voter.isVerified ? "green" : "amber"} />
                {voter.emailVerified  && <LabelBadge label="Email Verified"  variant="cyan" />}
                {voter.mobileVerified && <LabelBadge label="Mobile Verified" variant="cyan" />}
                {voter.faceEnrolled   && <LabelBadge label="Face Enrolled"   variant="green" />}
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}