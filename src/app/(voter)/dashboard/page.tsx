import { WelcomeBanner } from "@/components/voter/dashboard/welcome-banner";
import { VoterStatsGrid } from "@/components/voter/dashboard/stats-grid";
import { ActiveElectionsList } from "@/components/voter/dashboard/active-elections-list";

export const metadata = { title: "Dashboard — VoteSecure" };

export default function VoterDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <WelcomeBanner />
      <VoterStatsGrid />
      <ActiveElectionsList />
    </div>
  );
}