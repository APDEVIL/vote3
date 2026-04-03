/**
 * routers/vote.router.ts
 *
 * Epics covered:
 *   5.3 Cast vote   5.4 Submit vote   5.5 Prevent multiple voting
 *   12.1 Store votes anonymously      12.2 Prevent vote-user mapping
 *
 * CRITICAL: vote and voteToken are inserted in a SINGLE transaction.
 * If either fails, BOTH roll back. This guarantees:
 *   - No ghost votes (vote without token)
 *   - No orphan tokens (token without vote)
 */

import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { candidate, participationRequest, poll, vote, voteToken } from "@/server/db/schema";
import {
  alreadyVotedError,
  candidateNotFoundError,
  notApprovedToVoteError,
  pollNotActiveError,
  pollNotFoundError,
} from "@/server/lib/errors";
import { generateId } from "@/server/lib/ids";
import { zCastVoteInput } from "@/server/lib/validators";
import { isPollActive } from "@/server/services/poll-lifecycle.service";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const voteRouter = createTRPCRouter({

  // ── 5.3 / 5.4 Cast vote ───────────────────────────────────────────────────

  cast: protectedProcedure
    .input(zCastVoteInput)
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      const userId = session.user.id;

      // 1. Poll exists and is active
      const foundPoll = await db.query.poll.findFirst({
        where: eq(poll.id, input.pollId),
      });
      if (!foundPoll) throw pollNotFoundError();
      if (!isPollActive(foundPoll)) throw pollNotActiveError();

      // 2. Voter is approved for this poll
      const approval = await db.query.participationRequest.findFirst({
        where: and(
          eq(participationRequest.userId, userId),
          eq(participationRequest.pollId, input.pollId),
          eq(participationRequest.status, "approved"),
        ),
        columns: { id: true },
      });
      if (!approval) throw notApprovedToVoteError();

      // 3. Not already voted (check voteToken — NOT vote table)
      const existingToken = await db.query.voteToken.findFirst({
        where: and(
          eq(voteToken.userId, userId),
          eq(voteToken.pollId, input.pollId),
        ),
        columns: { id: true },
      });
      if (existingToken) throw alreadyVotedError();

      // 4. Candidate belongs to this poll
      const foundCandidate = await db.query.candidate.findFirst({
        where: and(
          eq(candidate.id, input.candidateId),
          eq(candidate.pollId, input.pollId),
        ),
        columns: { id: true },
      });
      if (!foundCandidate) throw candidateNotFoundError();

      // 5. Insert BOTH in a single transaction ─────────────────────────────
      //    vote  → anonymous (NO userId)
      //    token → proves participation (NO candidateId)
      await db.transaction(async (tx) => {
        // Anonymous vote — no userId stored here
        await tx.insert(vote).values({
          id: generateId("vote"),
          pollId: input.pollId,
          candidateId: input.candidateId,
          castedAt: new Date(),
        });

        // Token — proves this user voted, never reveals what they chose
        await tx.insert(voteToken).values({
          id: generateId("tok"),
          userId,           // the ONLY user reference in this whole flow
          pollId: input.pollId,
          usedAt: new Date(),
        });
      });

      return { success: true, message: "Your vote has been cast anonymously." };
    }),

  // ── 3.7 / 5.5 Has voted check ────────────────────────────────────────────
  // Returns boolean only — never returns what the user voted for

  hasVoted: protectedProcedure
    .input(z.object({ pollId: z.string() }))
    .query(async ({ ctx, input }) => {
      const token = await ctx.db.query.voteToken.findFirst({
        where: and(
          eq(voteToken.userId, ctx.session.user.id),
          eq(voteToken.pollId, input.pollId),
        ),
        columns: { usedAt: true },
      });

      return {
        hasVoted: !!token,
        votedAt: token?.usedAt ?? null,
      };
    }),
});