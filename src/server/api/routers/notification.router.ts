/**
 * routers/notification.router.ts
 *
 * Epics covered:
 *   14.1 Send OTP   14.2 Send email verification
 *   14.3 Notify approval/rejection   14.4 Notify poll updates
 *
 * These are mostly internal — called by other routers.
 * Exposed here for admin log viewing only.
 */

import { eq } from "drizzle-orm";
import { z } from "zod";

import { notificationLog } from "@/server/db/schema";
import { zId, zPaginationInput } from "@/server/lib/validators";
import { adminProcedure, createTRPCRouter, protectedProcedure } from "../trpc";

export const notificationRouter = createTRPCRouter({

  // ── Admin: view notification logs ─────────────────────────────────────────

  getLogs: adminProcedure
    .input(zPaginationInput.optional())
    .query(async ({ ctx, input }) => {
      const page = input?.page ?? 1;
      const limit = input?.limit ?? 50;
      const offset = (page - 1) * limit;

      return ctx.db.query.notificationLog.findMany({
        orderBy: (n, { desc }) => [desc(n.createdAt)],
        limit,
        offset,
      });
    }),

  // ── Admin: logs for a specific user ──────────────────────────────────────

  getLogsForUser: adminProcedure
    .input(z.object({ userId: zId }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.notificationLog.findMany({
        where: eq(notificationLog.userId, input.userId),
        orderBy: (n, { desc }) => [desc(n.createdAt)],
      });
    }),

  // ── Voter: own notification log ───────────────────────────────────────────

  getMyLogs: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.notificationLog.findMany({
      where: eq(notificationLog.userId, ctx.session.user.id),
      orderBy: (n, { desc }) => [desc(n.createdAt)],
      limit: 20,
      columns: {
        id: true,
        type: true,
        status: true,
        sentAt: true,
        createdAt: true,
        // Excluded: providerResponse, meta — internal details
      },
    });
  }),
});