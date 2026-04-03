/**
 * routers/admin.router.ts
 *
 * Epics covered:
 *   6.1–6.3 Admin authentication (handled by better-auth + adminProcedure)
 *   7.1–7.5 Poll management
 *   8.1–8.3 Poll monitoring
 *   9.1–9.3 Result management
 *   10.1–10.4 Voter verification
 *
 * ALL procedures use adminProcedure — non-admins get FORBIDDEN.
 */

import { and, count, eq, sql } from "drizzle-orm";
import { z } from "zod";

import {
  candidate,
  participationRequest,
  poll,
  user,
  vote,
  voteToken,
} from "@/server/db/schema";
import {
  candidateNotFoundError,
  participationRequestNotFoundError,
  pollNotFoundError,
} from "@/server/lib/errors";
import { generateId } from "@/server/lib/ids";
import {
  zAddCandidateInput,
  zCreatePollInput,
  zId,
  zPaginationInput,
  zReviewRequestInput,
  zUpdatePollStatusInput,
} from "@/server/lib/validators";
import {
  calculateResults,
  transitionPollStatus,
} from "@/server/services/poll-lifecycle.service";
import { sendParticipationDecision } from "@/server/services/notification.service";
import { adminProcedure, createTRPCRouter } from "../trpc";

export const adminRouter = createTRPCRouter({

  // ── Dashboard overview stats ───────────────────────────────────────────────

  getOverview: adminProcedure.query(async ({ ctx }) => {
    const [totalVoters] = await ctx.db
      .select({ count: count() })
      .from(user)
      .where(eq(user.role, "voter"));

    const [totalVotesCast] = await ctx.db
      .select({ count: count() })
      .from(vote);

    const activePolls = await ctx.db.query.poll.findMany({
      where: eq(poll.status, "active"),
      columns: { id: true },
    });

    const pendingRequests = await ctx.db.query.participationRequest.findMany({
      where: eq(participationRequest.status, "pending"),
      columns: { id: true },
    });

    const verifiedVoters = await ctx.db.query.user.findMany({
      where: and(eq(user.role, "voter"), eq(user.isVerified, true)),
      columns: { id: true },
    });

    return {
      totalVoters:    totalVoters?.count ?? 0,
      totalVotesCast: totalVotesCast?.count ?? 0,
      liveElections:  activePolls.length,
      pendingRequests: pendingRequests.length,
      verifiedVoters: verifiedVoters.length,
    };
  }),

  // ── 7.1 Create poll ───────────────────────────────────────────────────────

  createPoll: adminProcedure
    .input(zCreatePollInput)
    .mutation(async ({ ctx, input }) => {
      const pollId = generateId("poll");

      await ctx.db.insert(poll).values({
        id: pollId,
        title: input.title,
        description: input.description ?? null,
        startTime: input.startTime,
        endTime: input.endTime,
        status: "created",
        createdBy: ctx.session.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return { pollId, success: true };
    }),

  // ── 7.2 Add candidate ─────────────────────────────────────────────────────

  addCandidate: adminProcedure
    .input(zAddCandidateInput)
    .mutation(async ({ ctx, input }) => {
      const foundPoll = await ctx.db.query.poll.findFirst({
        where: eq(poll.id, input.pollId),
        columns: { id: true, status: true },
      });
      if (!foundPoll) throw pollNotFoundError();

      if (foundPoll.status !== "created") {
        throw new Error("Candidates can only be added while poll is in 'created' status.");
      }

      const candidateId = generateId("cand");

      await ctx.db.insert(candidate).values({
        id: candidateId,
        pollId: input.pollId,
        name: input.name,
        description: input.description ?? null,
        order: input.order ?? 0,
        createdAt: new Date(),
      });

      return { candidateId, success: true };
    }),

  // ── Remove candidate ──────────────────────────────────────────────────────

  removeCandidate: adminProcedure
    .input(z.object({ candidateId: zId }))
    .mutation(async ({ ctx, input }) => {
      const found = await ctx.db.query.candidate.findFirst({
        where: eq(candidate.id, input.candidateId),
        with: { poll: { columns: { status: true } } },
      });
      if (!found) throw candidateNotFoundError();
      if ((found as any).poll?.status !== "created") {
        throw new Error("Candidates can only be removed while poll is in 'created' status.");
      }

      await ctx.db.delete(candidate).where(eq(candidate.id, input.candidateId));
      return { success: true };
    }),

  // ── 7.3–7.5 Update poll status ────────────────────────────────────────────

  updatePollStatus: adminProcedure
    .input(zUpdatePollStatusInput)
    .mutation(async ({ ctx, input }) => {
      const updated = await transitionPollStatus(ctx.db, input.pollId, input.newStatus);
      return { success: true, poll: updated };
    }),

  // ── 8.1 List all polls (admin view) ──────────────────────────────────────

  listPolls: adminProcedure
    .input(zPaginationInput.optional())
    .query(async ({ ctx }) => {
      const polls = await ctx.db.query.poll.findMany({
        orderBy: (p, { desc }) => [desc(p.createdAt)],
        with: {
          candidates: { columns: { id: true } },
        },
      });

      // Get vote counts per poll
      const voteCounts = await ctx.db
        .select({
          pollId: vote.pollId,
          count: count(),
        })
        .from(vote)
        .groupBy(vote.pollId);

      const voteCountMap = new Map(voteCounts.map((v) => [v.pollId, v.count]));

      return polls.map((p) => ({
        ...p,
        candidateCount: (p as any).candidates.length,
        votesCast: voteCountMap.get(p.id) ?? 0,
      }));
    }),

  // ── 8.2 / 8.3 Poll detail + participation count ───────────────────────────

  getPollDetail: adminProcedure
    .input(z.object({ pollId: zId }))
    .query(async ({ ctx, input }) => {
      const found = await ctx.db.query.poll.findFirst({
        where: eq(poll.id, input.pollId),
        with: {
          candidates: { orderBy: (c: { order: any; }, { asc }: any) => [asc(c.order)] },
        },
      });
      if (!found) throw pollNotFoundError();

      const [voteCount] = await ctx.db
        .select({ count: count() })
        .from(vote)
        .where(eq(vote.pollId, input.pollId));

      const [approvedCount] = await ctx.db
        .select({ count: count() })
        .from(participationRequest)
        .where(and(
          eq(participationRequest.pollId, input.pollId),
          eq(participationRequest.status, "approved"),
        ));

      return {
        ...found,
        votesCast: voteCount?.count ?? 0,
        approvedParticipants: approvedCount?.count ?? 0,
      };
    }),

  // ── 9.1 / 9.2 View results (admin) ───────────────────────────────────────

  getResults: adminProcedure
    .input(z.object({ pollId: zId }))
    .query(async ({ ctx, input }) => {
      const found = await ctx.db.query.poll.findFirst({
        where: eq(poll.id, input.pollId),
        columns: { id: true, status: true, title: true },
      });
      if (!found) throw pollNotFoundError();
      if (found.status !== "result_available" && found.status !== "ended") {
        throw new Error("Results are only available after the poll ends.");
      }

      const results = await calculateResults(ctx.db, input.pollId);
      const [total] = await ctx.db
        .select({ count: count() })
        .from(vote)
        .where(eq(vote.pollId, input.pollId));

      return {
        poll: found,
        results,
        totalVotes: total?.count ?? 0,
      };
    }),

  // ── 10.1 List pending participation requests ──────────────────────────────

  listPendingRequests: adminProcedure
    .input(z.object({ pollId: zId.optional() }).optional())
    .query(async ({ ctx, input }) => {
      const conditions = input?.pollId
        ? and(
            eq(participationRequest.status, "pending"),
            eq(participationRequest.pollId, input.pollId),
          )
        : eq(participationRequest.status, "pending");

      const requests = await ctx.db.query.participationRequest.findMany({
        where: conditions,
        orderBy: (r, { asc }) => [asc(r.createdAt)],
        with: {
          poll: { columns: { id: true, title: true, status: true } },
        },
      });

      // Attach voter profile for each request
      const result = await Promise.all(
        requests.map(async (r) => {
          const voter = await ctx.db.query.user.findFirst({
            where: eq(user.id, r.userId),
            columns: {
              id: true,
              name: true,
              email: true,
              mobile: true,
              voterCardId: true,
              isVerified: true,
            },
          });
          return { ...r, voter };
        }),
      );

      return result;
    }),

  // ── 10.3 / 10.4 Approve or reject request ────────────────────────────────

  reviewRequest: adminProcedure
    .input(zReviewRequestInput)
    .mutation(async ({ ctx, input }) => {
      const found = await ctx.db.query.participationRequest.findFirst({
        where: eq(participationRequest.id, input.requestId),
        with: {
          poll: { columns: { title: true } },
        },
      });
      if (!found) throw participationRequestNotFoundError();

      const newStatus = input.decision === "approved" ? "approved" : "rejected";

      await ctx.db
        .update(participationRequest)
        .set({
          status: newStatus,
          reviewedBy: ctx.session.user.id,
          reviewedAt: new Date(),
          rejectionReason: input.rejectionReason ?? null,
          updatedAt: new Date(),
        })
        .where(eq(participationRequest.id, input.requestId));

      // Notify voter via email
      const voter = await ctx.db.query.user.findFirst({
        where: eq(user.id, found.userId),
        columns: { email: true },
      });

      if (voter?.email) {
        await sendParticipationDecision(
          ctx.db,
          found.userId,
          voter.email,
          (found as any).poll?.title ?? "the poll",
          input.decision === "approved",
          input.rejectionReason,
        );
      }

      return { success: true, status: newStatus };
    }),

  // ── 10.2 All voters list ──────────────────────────────────────────────────

  listVoters: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.query.user.findMany({
      where: eq(user.role, "voter"),
      columns: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        voterCardId: true,
        isVerified: true,
        emailVerified: true,
        mobileVerified: true,
        faceEnrolled: true,
        createdAt: true,
      },
      orderBy: (u, { desc }) => [desc(u.createdAt)],
    });
  }),
});