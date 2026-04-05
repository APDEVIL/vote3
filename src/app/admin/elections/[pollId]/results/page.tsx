"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader }    from "@/components/shared/page-header";
import { ResultsTable }  from "@/components/admin/results/results-table";
import { ResultsChart }  from "@/components/admin/results/result-chart";

interface Props { params: Promise<{ pollId: string }> }

export default function AdminPollResultsPage({ params }: Props) {
  const { pollId } = use(params);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <Link href={`/admin/elections/${pollId}`} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground w-fit">
        <ArrowLeft className="h-4 w-4" /> Back to Poll
      </Link>
      <PageHeader title="Poll Results" description="Final tally — no individual votes are shown" />
      <ResultsChart pollId={pollId} />
      <ResultsTable pollId={pollId} />
    </div>
  );
}