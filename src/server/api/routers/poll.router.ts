// src/server/api/routers/poll.router.ts

/**
 * routers/poll.router.ts
 *
 * Epics covered:
 * 5.1 View available polls
 * 5.2 View poll details
 * 8.1–8.3 Poll monitoring (counts, status)
 */

import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { candidate, participationRequest, poll, voteToken } from "@/server/db/schema";
import { pollNotFoundError, pollResultsNotAvailableError } from "@/server/lib/errors";
import { zId } from "@/server/lib/validators";
import { calculateResults } from "@/server/services/poll-lifecycle.service";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const pollRouter = createTRPCRouter({

  // ── 5.1 List polls available to this voter ────────────────────────────────
  // Only shows polls where voter has an approved participation request

  list: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    // Get all approved participation requests for this user
    const approvedRequests = await ctx.db.query.participationRequest.findMany({
      where: and(
        eq(participationRequest.userId, userId),
        eq(participationRequest.status, "approved"),
      ),
      columns: { pollId: true },
    });

    const approvedPollIds = approvedRequests.map((r) => r.pollId);

    if (approvedPollIds.length === 0) return [];

    // Get those polls
    const polls = await ctx.db.query.poll.findMany({
      where: (p, { inArray }) => inArray(p.id, approvedPollIds),
      orderBy: (p, { desc }) => [desc(p.startTime)],
      with: {
        candidates: { columns: { id: true } },
        // Added: Fetch votes to get the count
        votes: { columns: { id: true } },
      },
    });

    // Check which polls this user has already voted in
    const votedTokens = await ctx.db.query.voteToken.findMany({
      where: eq(voteToken.userId, userId),
      columns: { pollId: true },
    });
    const votedPollIds = new Set(votedTokens.map((t) => t.pollId));

    return polls.map((p) => ({
      ...p,
      candidateCount: (p as any).candidates?.length ?? 0,
      // Added: Map the votes array length to votesCast for the frontend
      votesCast: (p as any).votes?.length ?? 0,
      hasVoted: votedPollIds.has(p.id),
    }));
  }),

  // ── 5.2 Poll details + candidates ────────────────────────────────────────

  getById: protectedProcedure
    .input(z.object({ pollId: zId }))
    .query(async ({ ctx, input }) => {
      const found = await ctx.db.query.poll.findFirst({
        where: eq(poll.id, input.pollId),
        with: {
          candidates: {
            // Fix: Use the 'c' argument which represents the table fields, not the table definition
            orderBy: (c, { asc }) => [asc(c.order)],
          },
        },
      });

      if (!found) throw pollNotFoundError();

      // Check if user has voted
      const token = await ctx.db.query.voteToken.findFirst({
        where: and(
          eq(voteToken.userId, ctx.session.user.id),
          eq(voteToken.pollId, input.pollId),
        ),
        columns: { usedAt: true },
      });

      // Fix: Spread 'found' and explicitly cast/handle candidates to resolve 'never' errors
      return {
        ...found,
        candidates: ((found as any).candidates ?? []) as (typeof candidate.$inferSelect)[],
        hasVoted: !!token,
        votedAt: token?.usedAt ?? null,
      };
    }),

  // ── Poll results (only when result_available) ─────────────────────────────

  getResults: protectedProcedure
    .input(z.object({ pollId: zId }))
    .query(async ({ ctx, input }) => {
      const found = await ctx.db.query.poll.findFirst({
        where: eq(poll.id, input.pollId),
        columns: { id: true, status: true, title: true },
        // FETCH CANDIDATES HERE TO GET NAMES
        with: {
          candidates: {
            columns: { id: true, name: true }
          }
        }
      });

      if (!found) throw pollNotFoundError();
      if (found.status !== "result_available") throw pollResultsNotAvailableError();

      const rawResults = await calculateResults(ctx.db, input.pollId);

      // MERGE NAMES WITH VOTE COUNTS
      const results = (found.candidates ?? []).map((c) => {
        const voteData = rawResults.find((r) => r.candidateId === c.id);
        return {
          candidateId: c.id,
          name: c.name,
          votes: voteData?.votes ?? 0,
        };
      }).sort((a, b) => b.votes - a.votes); // Sort by winner first

      return { poll: found, results };
    }),

  // ── All polls — public listing (upcoming, active) ─────────────────────────
  // Used on voter dashboard to show all polls they can request to join

  listAll: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const allPolls = await ctx.db.query.poll.findMany({
      orderBy: (p, { desc }) => [desc(p.createdAt)],
      columns: {
        id: true,
        title: true,
        description: true,
        status: true,
        startTime: true,
        endTime: true,
      },
    });

    // Get this user's participation requests
    const requests = await ctx.db.query.participationRequest.findMany({
      where: eq(participationRequest.userId, userId),
      columns: { pollId: true, status: true },
    });

    const requestMap = new Map(requests.map((r) => [r.pollId, r.status]));

    return allPolls.map((p) => ({
      ...p,
      participationStatus: requestMap.get(p.id) ?? null,
    }));
  }),
});