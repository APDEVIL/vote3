"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader }        from "@/components/shared/page-header";
import { CandidateManager }  from "@/components/admin/polls/candidate-manager";

interface Props { params: Promise<{ pollId: string }> }

export default function CandidatesPage({ params }: Props) {
  const { pollId } = use(params);

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <Link href={`/admin/elections/${pollId}`} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground w-fit">
        <ArrowLeft className="h-4 w-4" /> Back to Poll
      </Link>
      <PageHeader
        title="Manage Candidates"
        description="Add or remove candidates. Only available before poll activates."
      />
      <div className="rounded-2xl border border-border bg-card p-6">
        <CandidateManager pollId={pollId} />
      </div>
    </div>
  );
}