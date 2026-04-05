import { AdminOverviewBanner }   from "@/components/admin/dashboard/overview-banner";
import { QuickActions }          from "@/components/admin/dashboard/quick-actions";
import { AdminStatsGrid }        from "@/components/admin/dashboard/stats-grid";
import { ElectionStatusList }    from "@/components/admin/dashboard/election-status-list";
import { VerificationSummary }   from "@/components/admin/dashboard/verification-summary";

export const metadata = { title: "Admin Dashboard — VoteSecure" };

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <AdminOverviewBanner />
      <QuickActions />
      <AdminStatsGrid />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ElectionStatusList />
        <VerificationSummary />
      </div>
    </div>
  );
}