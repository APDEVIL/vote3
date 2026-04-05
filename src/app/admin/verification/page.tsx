import { PageHeader }   from "@/components/shared/page-header";
import { RequestTable } from "@/components/admin/verification/request-table";

export const metadata = { title: "Voter Verification — Admin" };

export default function AdminVerificationPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Voter Verification"
        description="Review and approve participation requests"
      />
      <RequestTable />
    </div>
  );
}