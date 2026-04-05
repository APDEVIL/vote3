import { PageHeader } from "@/components/shared/page-header";
import { VoterCard } from "@/components/voter/profile/voter-card";
import { ProfileForm } from "@/components/voter/profile/profile-form";
import { VotingHistoryList } from "@/components/voter/profile/voting-history-list";
import { RequestStatus } from "@/components/voter/participation/request-status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata = { title: "Profile — VoteSecure" };

export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Profile" description="Manage your voter account" />

      {/* Voter card ID — always visible at top */}
      <VoterCard />

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="border border-border bg-card">
          <TabsTrigger value="profile"  className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Profile</TabsTrigger>
          <TabsTrigger value="history"  className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Voting History</TabsTrigger>
          <TabsTrigger value="requests" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <div className="rounded-2xl border border-border bg-card p-6">
            <ProfileForm />
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <VotingHistoryList />
        </TabsContent>

        <TabsContent value="requests" className="mt-4">
          <RequestStatus />
        </TabsContent>
      </Tabs>
    </div>
  );
}