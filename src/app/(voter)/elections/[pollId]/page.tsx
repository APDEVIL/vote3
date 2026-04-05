import { PollDetail } from "@/components/voter/elections/poll-detail";
import { ParticipationRequestForm } from "@/components/voter/participation/request-form";
import { api } from "@/trpc/server";

interface Props { params: Promise<{ pollId: string }> }

export default async function PollDetailPage({ params }: Props) {
  const { pollId } = await params;

  // Check participation status server-side
  const participation = await api.participation.getByPoll({ pollId });

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <PollDetail pollId={pollId} />

      {/* Show participation request form if not yet submitted */}
      {!participation && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="mb-4 font-semibold text-foreground">Request to Participate</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Submit your voter card ID and address for admin verification before voting.
          </p>
          <ParticipationRequestForm pollId={pollId} />
        </div>
      )}
    </div>
  );
}