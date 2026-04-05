import { PageHeader }    from "@/components/shared/page-header";
import { PollListTable } from "@/components/admin/polls/poll-list-table";

export const metadata = { title: "Elections — Admin" };

export default function AdminElectionsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Elections"
        description="Create and manage all polls"
      />
      <PollListTable />
    </div>
  );
}