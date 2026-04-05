"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, ShieldOff } from "lucide-react";
import { toast } from "sonner";
import { PageHeader }       from "@/components/shared/page-header";
import { LabelBadge }       from "@/components/shared/status-badge";
import { ErrorState }       from "@/components/shared/error-state";
import { ApproveRejectButtons } from "@/components/admin/verification/approve-reject-button";
import { formatDateTime }   from "@/lib/date";
import { api }              from "@/trpc/react";

interface Props { params: Promise<{ userId: string }> }

export default function AdminVoterDetailPage({ params }: Props) {
  const { userId } = use(params);

  const { data: voters, isLoading, error, refetch } = api.admin.listVoters.useQuery();
  const voter = voters?.find((v) => v.id === userId);

  // Get pending participation requests for this voter
  const { data: requests } = api.admin.listPendingRequests.useQuery({ pollId: undefined });
  const voterRequests = requests?.filter((r) => r.userId === userId) ?? [];

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl bg-muted/30" />
        ))}
      </div>
    );
  }

  if (error || !voter) {
    return <ErrorState onRetry={() => refetch()} description="Voter not found." />;
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      {/* Back */}
      <Link
        href="/admin/voters"
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Voters
      </Link>

      <PageHeader title={voter.name} description={voter.email} />

      {/* Voter Card ID */}
      <div className="gradient-border rounded-2xl p-5">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Voter Card ID
        </p>
        <p className="font-mono text-2xl font-extrabold tracking-[0.12em] text-primary">
          {voter.voterCardId ?? "Not generated"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Joined {formatDateTime(voter.createdAt)}
        </p>
      </div>

      {/* Contact info */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Contact Details
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            { label: "Full Name",  value: voter.name },
            { label: "Email",      value: voter.email },
            { label: "Mobile",     value: voter.mobile ?? "—" },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col gap-0.5">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
              <p className="text-sm text-foreground">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Verification status */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Verification Status
        </p>
        <div className="flex flex-wrap gap-2">
          <LabelBadge
            label={voter.isVerified ? "Admin Approved" : "Pending Approval"}
            variant={voter.isVerified ? "green" : "amber"}
          />
          {voter.emailVerified  && <LabelBadge label="Email Verified"  variant="cyan"  />}
          {voter.mobileVerified && <LabelBadge label="Mobile Verified" variant="cyan"  />}
          {voter.faceEnrolled   && <LabelBadge label="Face Enrolled"   variant="green" />}
          {!voter.emailVerified  && <LabelBadge label="Email Pending"   variant="slate" />}
          {!voter.mobileVerified && <LabelBadge label="Mobile Pending"  variant="slate" />}
          {!voter.faceEnrolled   && <LabelBadge label="Face Not Set"    variant="slate" />}
        </div>
      </div>

      {/* Pending participation requests for this voter */}
      {voterRequests.length > 0 && (
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Pending Participation Requests
          </p>

          {voterRequests.map((req) => (
            <div
              key={req.id}
              className="flex flex-col gap-3 rounded-xl border border-border bg-background/50 p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-foreground">
                    {(req as any).poll?.title ?? "Unknown poll"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Submitted {formatDateTime(req.createdAt)}
                  </p>
                </div>
              </div>

              {/* Submitted details */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Submitted Voter Card ID
                  </p>
                  <p className="font-mono text-foreground">{req.voterCardId}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Pincode
                  </p>
                  <p className="text-foreground">{req.pincode}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Address
                  </p>
                  <p className="text-foreground">{req.address}</p>
                </div>
              </div>

              <ApproveRejectButtons
                requestId={req.id}
                onSuccess={() => void refetch()}
              />
            </div>
          ))}
        </div>
      )}

      {/* No pending requests note */}
      {voterRequests.length === 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card/50 px-4 py-3">
          <ShieldCheck className="h-4 w-4 shrink-0 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No pending participation requests from this voter.
          </p>
        </div>
      )}
    </div>
  );
}