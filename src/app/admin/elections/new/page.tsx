import { PageHeader } from "@/components/shared/page-header";
import { PollForm }   from "@/components/admin/polls/poll-form";

export const metadata = { title: "Create Election — Admin" };

export default function NewElectionPage() {
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <PageHeader
        title="Create Election"
        description="Set up a new poll with candidates and voting window"
      />
      <div className="rounded-2xl border border-border bg-card p-6">
        <PollForm />
      </div>
    </div>
  );
}