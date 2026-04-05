import { PageHeader }  from "@/components/shared/page-header";
import { VoterTable }  from "@/components/admin/voters/voter-table";

export const metadata = { title: "Voters — Admin" };

export default function AdminVotersPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Voters"
        description="All registered voters and their verification status"
      />
      <VoterTable />
    </div>
  );
}