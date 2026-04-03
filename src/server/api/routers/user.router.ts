/**
 * routers/user.router.ts
 *
 * Epics covered:
 *   3.1–3.5 Profile management
 *   3.4 View voter card ID
 *   3.5 View voting history (polls participated — no vote choice)
 */

import { eq } from "drizzle-orm";
import { z } from "zod";

import { user, voteToken, poll } from "@/server/db/schema";
import { userNotFoundError } from "@/server/lib/errors";
import { zUpdateProfileInput } from "@/server/lib/validators";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const userRouter = createTRPCRouter({

  // ── 3.3 / 3.4 Get profile + voterCardId ──────────────────────────────────

  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const found = await ctx.db.query.user.findFirst({
      where: eq(user.id, ctx.session.user.id),
      columns: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        address: true,
        pincode: true,
        voterCardId: true,
        role: true,
        emailVerified: true,
        mobileVerified: true,
        secretQuestionsSet: true,
        faceEnrolled: true,
        isVerified: true,
        createdAt: true,
        // Excluded: password, faceReferenceId — never sent to client
      },
    });

    if (!found) throw userNotFoundError();
    return found;
  }),

  // ── 3.2 Update profile ────────────────────────────────────────────────────

  updateProfile: protectedProcedure
    .input(zUpdateProfileInput)
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(user)
        .set({ ...input, updatedAt: new Date() })
        .where(eq(user.id, ctx.session.user.id));

      return { success: true };
    }),

  // ── 3.5 Voting history ────────────────────────────────────────────────────
  // Returns polls the user has participated in + timestamp.
  // NEVER returns vote choice — voteToken has no candidateId.

  getVotingHistory: protectedProcedure.query(async ({ ctx }) => {
    const tokens = await ctx.db.query.voteToken.findMany({
      where: eq(voteToken.userId, ctx.session.user.id),
      orderBy: (t, { desc }) => [desc(t.usedAt)],
      with: {
        poll: {
          columns: {
            id: true,
            title: true,
            status: true,
            startTime: true,
            endTime: true,
          },
        },
      },
    });

    return tokens.map((t) => ({
      pollId: t.pollId,
      votedAt: t.usedAt,
      poll: (t as any).poll,
    }));
  }),

  // ── Setup completion status ───────────────────────────────────────────────
  // Used to show progress on registration steps UI

  getSetupStatus: protectedProcedure.query(async ({ ctx }) => {
    const found = await ctx.db.query.user.findFirst({
      where: eq(user.id, ctx.session.user.id),
      columns: {
        emailVerified: true,
        mobileVerified: true,
        secretQuestionsSet: true,
        faceEnrolled: true,
        isVerified: true,
      },
    });

    if (!found) throw userNotFoundError();

    return {
      emailVerified:      found.emailVerified,
      mobileVerified:     found.mobileVerified,
      secretQuestionsSet: found.secretQuestionsSet,
      faceEnrolled:       found.faceEnrolled,
      isVerified:         found.isVerified,
      // Completion percentage for UI progress bar
      completionPercent: [
        found.emailVerified,
        found.mobileVerified,
        found.secretQuestionsSet,
        found.faceEnrolled,
      ].filter(Boolean).length * 25,
    };
  }),
});