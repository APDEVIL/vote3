"use client";

import { Users, Vote, Zap, BarChart3 } from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { StatCardSkeleton } from "@/components/shared/loading-skeleton";
import { api } from "@/trpc/react";

export function AdminStatsGrid() {
  const { data, isLoading } = api.admin.getOverview.useQuery();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
    );
  }

  const participation =
    data?.totalVoters && data.totalVoters > 0
      ? Math.round((data.verifiedVoters / data.totalVoters) * 100)
      : 0;

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard icon={Users}    value={data?.totalVoters    ?? 0} label="Total Voters"    iconColor="text-purple-400" valueColor="text-purple-400" />
      <StatCard icon={Vote}     value={data?.totalVotesCast ?? 0} label="Votes Cast"      iconColor="text-primary"    valueColor="text-primary" />
      <StatCard icon={Zap}      value={data?.liveElections  ?? 0} label="Live Elections"  iconColor="text-amber-400"  valueColor="text-amber-400" />
      <StatCard icon={BarChart3} value={`${participation}%`}      label="Participation"   iconColor="text-green-400"  valueColor="text-green-400" />
    </div>
  );
}