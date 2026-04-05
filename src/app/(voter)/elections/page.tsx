import { PageHeader } from "@/components/shared/page-header";
import { PollList } from "@/components/voter/elections/poll-list";

export const metadata = { title: "Elections — VoteSecure" };

export default function ElectionsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Elections"
        description="Browse all elections and submit participation requests"
      />
      <PollList />
    </div>
  );
}