/**
 * poll-lifecycle.service.ts
 *
 * Manages poll state transitions and result calculation.
 *
 * Valid transitions (SRS §4.3):
 *   created → active → ended → result_available
 *
 * Any other transition throws — enforced here so no router can
 * accidentally skip a stage.
 */

import { eq, sql } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import type * as schema from "@/server/db/schema";
import { candidate, poll, vote } from "@/server/db/schema";
import type { Poll, PollStatus } from "@/server/db/schema";

// ── Valid transition map ───────────────────────────────────────────────────────

const ALLOWED_TRANSITIONS: Record<PollStatus, PollStatus[]> = {
  created:          ["active"],
  active:           ["ended"],
  ended:            ["result_available"],
  result_available: [],              // terminal state
};

// ── Exports ────────────────────────────────────────────────────────────────────

/**
 * Transitions a poll to a new status.
 * Validates the transition is allowed before updating.
 */
export async function transitionPollStatus(
  db: PostgresJsDatabase<typeof schema>,
  pollId: string,
  newStatus: PollStatus,
): Promise<Poll> {
  const existing = await db.query.poll.findFirst({
    where: eq(poll.id, pollId),
  });

  if (!existing) {
    throw new Error(`Poll not found: ${pollId}`);
  }

  const allowed = ALLOWED_TRANSITIONS[existing.status];

  if (!allowed.includes(newStatus)) {
    throw new Error(
      `Invalid transition: ${existing.status} → ${newStatus}. ` +
      `Allowed: ${allowed.join(", ") || "none (terminal state)"}`,
    );
  }

  const [updated] = await db
    .update(poll)
    .set({ status: newStatus, updatedAt: new Date() })
    .where(eq(poll.id, pollId))
    .returning();

  if (!updated) throw new Error("Poll update failed");

  return updated;
}

/**
 * Returns true if the poll is currently accepting votes.
 * Checks both status AND the startTime/endTime window.
 */
export function isPollActive(p: Poll): boolean {
  if (p.status !== "active") return false;
  const now = new Date();
  return now >= p.startTime && now <= p.endTime;
}

/**
 * Calculates vote tallies for a poll.
 * Only callable when poll status is "result_available" (enforced in router).
 *
 * Returns candidates with their vote counts, sorted descending.
 * Never returns any voter identity — pure aggregate counts only.
 */
export async function calculateResults(
  db: PostgresJsDatabase<typeof schema>,
  pollId: string,
): Promise<Array<{ candidateId: string; name: string; votes: number; order: number }>> {
  // Get all candidates for this poll
  const candidates = await db.query.candidate.findMany({
    where: eq(candidate.pollId, pollId),
    orderBy: (c, { asc }) => [asc(c.order)],
  });

  if (candidates.length === 0) return [];

  // Count votes per candidate — pure aggregate, no voter data
  const voteCounts = await db
    .select({
      candidateId: vote.candidateId,
      count: sql<number>`cast(count(*) as int)`,
    })
    .from(vote)
    .where(eq(vote.pollId, pollId))
    .groupBy(vote.candidateId);

  const countMap = new Map(voteCounts.map((v) => [v.candidateId, v.count]));

  return candidates
    .map((c) => ({
      candidateId: c.id,
      name: c.name,
      votes: countMap.get(c.id) ?? 0,
      order: c.order,
    }))
    .sort((a, b) => b.votes - a.votes);  // highest votes first
}

/**
 * Auto-activates polls whose startTime has passed and status is "created".
 * Auto-ends polls whose endTime has passed and status is "active".
 *
 * Called by jobs/poll-scheduler.ts on a cron.
 */
export async function syncPollStatuses(
  db: PostgresJsDatabase<typeof schema>,
): Promise<{ activated: number; ended: number }> {
  const now = new Date();

  // Activate polls that should have started
  const toActivate = await db.query.poll.findMany({
    where: (p, { and, eq, lte }) =>
      and(eq(p.status, "created"), lte(p.startTime, now)),
    columns: { id: true },
  });

  for (const p of toActivate) {
    await transitionPollStatus(db, p.id, "active");
  }

  // End polls that should have closed
  const toEnd = await db.query.poll.findMany({
    where: (p, { and, eq, lte }) =>
      and(eq(p.status, "active"), lte(p.endTime, now)),
    columns: { id: true },
  });

  for (const p of toEnd) {
    await transitionPollStatus(db, p.id, "ended");
  }

  if (toActivate.length > 0 || toEnd.length > 0) {
    console.log(
      `[poll-scheduler] Activated: ${toActivate.length}, Ended: ${toEnd.length}`,
    );
  }

  return { activated: toActivate.length, ended: toEnd.length };
}