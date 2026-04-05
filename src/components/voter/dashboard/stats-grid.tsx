"use client";

import { CheckSquare, Zap, Bell, ShieldCheck } from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { StatCardSkeleton } from "@/components/shared/loading-skeleton";
import { api } from "@/trpc/react";

export function VoterStatsGrid() {
  const { data: polls, isLoading } = api.poll.list.useQuery();
  const { data: allPolls }         = api.poll.listAll.useQuery();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
    );
  }

  const voted    = polls?.filter((p) => p.hasVoted).length ?? 0;
  const active   = polls?.filter((p) => p.status === "active").length ?? 0;
  const upcoming = allPolls?.filter((p) => p.status === "created").length ?? 0;

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard icon={CheckSquare} value={voted}    label="Voted"    iconColor="text-green-400"  valueColor="text-green-400" />
      <StatCard icon={Zap}         value={active}   label="Active"   iconColor="text-primary"    valueColor="text-primary" />
      <StatCard icon={Bell}        value={upcoming} label="Upcoming" iconColor="text-amber-400"  valueColor="text-amber-400" />
      <StatCard icon={ShieldCheck} value="100%"     label="Trust"    iconColor="text-purple-400" valueColor="text-purple-400" />
    </div>
  );
}