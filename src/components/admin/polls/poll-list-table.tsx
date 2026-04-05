"use client";

import Link from "next/link";
import { Eye, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import { PollStatusBadge } from "./poll-status-badge";
import { formatDate } from "@/lib/date";
import { api } from "@/trpc/react";
import type { RouterOutputs } from "@/trpc/react";

type PollRow = RouterOutputs["admin"]["listPolls"][number];

export function PollListTable() {
  const { data: polls, isLoading } = api.admin.listPolls.useQuery();

  const columns = [
    {
      key: "title",
      header: "Poll",
      render: (p: PollRow) => (
        <div>
          <p className="font-medium text-foreground">{p.title}</p>
          <p className="text-xs text-muted-foreground">{p.candidateCount} candidates</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (p: PollRow) => <PollStatusBadge status={p.status} />,
    },
    {
      key: "votes",
      header: "Votes Cast",
      render: (p: PollRow) => (
        <span className="font-semibold text-primary">
          {(p.votesCast ?? 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: "dates",
      header: "Window",
      render: (p: PollRow) => (
        <span className="text-xs text-muted-foreground">
          {formatDate(p.startTime)} → {formatDate(p.endTime)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (p: PollRow) => (
        <Button
          asChild
          size="sm"
          variant="ghost"
          className="gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <Link href={`/admin/elections/${p.id}`}>
            <Eye className="h-3.5 w-3.5" /> Manage
          </Link>
        </Button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button asChild className="gap-2 bg-primary font-semibold text-primary-foreground hover:bg-primary/90">
          <Link href="/admin/elections/new">
            <Plus className="h-4 w-4" /> New Election
          </Link>
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={polls ?? []}
        keyField="id"
        isLoading={isLoading}
        emptyTitle="No elections yet"
        emptyDesc="Create your first election to get started."
      />
    </div>
  );
}