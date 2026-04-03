/**
 * routers/participation.router.ts
 *
 * Epics covered:
 *   4.1 Submit participation request
 *   4.2 Enter voter card ID, address, pincode
 *   4.3 View request status
 */

import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { participationRequest, poll } from "@/server/db/schema";
import {
  alreadySubmittedRequestError,
  pollNotFoundError,
} from "@/server/lib/errors";
import { generateId } from "@/server/lib/ids";
import { zSubmitParticipationInput, zId } from "@/server/lib/validators";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const participationRouter = createTRPCRouter({

  // ── 4.1 / 4.2 Submit participation request ────────────────────────────────

  submit: protectedProcedure
    .input(zSubmitParticipationInput)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Poll exists
      const foundPoll = await ctx.db.query.poll.findFirst({
        where: eq(poll.id, input.pollId),
        columns: { id: true, status: true },
      });
      if (!foundPoll) throw pollNotFoundError();

      // Cannot request for ended/result_available polls
      if (foundPoll.status === "ended" || foundPoll.status === "result_available") {
        throw new Error("Cannot request participation — this poll has ended.");
      }

      // Check if already submitted
      const existing = await ctx.db.query.participationRequest.findFirst({
        where: and(
          eq(participationRequest.userId, userId),
          eq(participationRequest.pollId, input.pollId),
        ),
        columns: { id: true, status: true },
      });
      if (existing) throw alreadySubmittedRequestError();

      await ctx.db.insert(participationRequest).values({
        id: generateId("req"),
        userId,
        pollId: input.pollId,
        voterCardId: input.voterCardId,
        address: input.address,
        pincode: input.pincode,
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return { success: true, message: "Participation request submitted. Awaiting admin approval." };
    }),

  // ── 4.3 View own request status ───────────────────────────────────────────

  getMyRequests: protectedProcedure.query(async ({ ctx }) => {
    const requests = await ctx.db.query.participationRequest.findMany({
      where: eq(participationRequest.userId, ctx.session.user.id),
      orderBy: (r, { desc }) => [desc(r.createdAt)],
      with: {
        poll: {
          columns: { id: true, title: true, status: true, startTime: true, endTime: true },
        },
      },
    });

    return requests.map((r) => ({
      id: r.id,
      pollId: r.pollId,
      status: r.status,
      rejectionReason: r.rejectionReason,
      createdAt: r.createdAt,
      reviewedAt: r.reviewedAt,
      poll: (r as any).poll,
    }));
  }),

  // ── Single request status by poll ─────────────────────────────────────────

  getByPoll: protectedProcedure
    .input(z.object({ pollId: zId }))
    .query(async ({ ctx, input }) => {
      const found = await ctx.db.query.participationRequest.findFirst({
        where: and(
          eq(participationRequest.userId, ctx.session.user.id),
          eq(participationRequest.pollId, input.pollId),
        ),
      });

      return found ?? null;
    }),
});