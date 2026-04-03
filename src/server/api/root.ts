/**
 * src/server/api/root.ts
 *
 * AppRouter — merges all routers.
 * Import `api` from here on the client via trpc/react.tsx.
 */

import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { authRouter }          from "./routers/auth.router";
import { userRouter }          from "./routers/user.router";
import { pollRouter }          from "./routers/poll.router";
import { voteRouter }          from "./routers/vote.router";
import { participationRouter } from "./routers/participation.router";
import { adminRouter }         from "./routers/admin.router";
import { notificationRouter }  from "./routers/notification.router";

export const appRouter = createTRPCRouter({
  auth:         authRouter,
  user:         userRouter,
  poll:         pollRouter,
  vote:         voteRouter,
  participation: participationRouter,
  admin:        adminRouter,
  notification: notificationRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);