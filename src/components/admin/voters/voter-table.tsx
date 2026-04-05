"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import { LabelBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/date";
import { api } from "@/trpc/react";
import { VoterDetailSheet } from "./voter-detail-sheet";
import type { RouterOutputs } from "@/trpc/react";

type VoterRow = RouterOutputs["admin"]["listVoters"][number];

export function VoterTable() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: voters, isLoading } = api.admin.listVoters.useQuery();

  const columns = [
    {
      key: "name",
      header: "Voter",
      render: (v: VoterRow) => (
        <div>
          <p className="font-medium text-foreground">{v.name}</p>
          <p className="text-xs text-muted-foreground font-mono">{v.voterCardId}</p>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      render: (v: VoterRow) => (
        <div>
          <p className="text-sm text-foreground">{v.email}</p>
          <p className="text-xs text-muted-foreground">{v.mobile ?? "—"}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (v: VoterRow) => (
        <div className="flex flex-col gap-1">
          <LabelBadge
            label={v.isVerified ? "Approved" : "Pending"}
            variant={v.isVerified ? "green" : "amber"}
          />
        </div>
      ),
    },
    {
      key: "setup",
      header: "Setup",
      render: (v: VoterRow) => (
        <div className="flex gap-1.5 flex-wrap">
          {v.emailVerified  && <LabelBadge label="Email"  variant="cyan"  />}
          {v.mobileVerified && <LabelBadge label="Mobile" variant="cyan"  />}
          {v.faceEnrolled   && <LabelBadge label="Face"   variant="green" />}
        </div>
      ),
    },
    {
      key: "joined",
      header: "Joined",
      render: (v: VoterRow) => (
        <span className="text-xs text-muted-foreground">{formatDate(v.createdAt)}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (v: VoterRow) => (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setSelectedId(v.id)}
          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
        >
          <Eye className="h-3.5 w-3.5" />
        </Button>
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={voters ?? []}
        keyField="id"
        isLoading={isLoading}
        emptyTitle="No voters registered"
        emptyDesc="Voters will appear here after registration."
      />
      <VoterDetailSheet
        voterId={selectedId}
        open={!!selectedId}
        onOpenChange={(v) => !v && setSelectedId(null)}
      />
    </>
  );
}