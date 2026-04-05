/**
 * src/server/api/trpc.ts
 *
 * Extended from T3 base — adds adminProcedure on top of the existing
 * publicProcedure and protectedProcedure.
 */

import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import { auth } from "@/server/better-auth";
import { db } from "@/server/db";

// ── Context ────────────────────────────────────────────────────────────────────

export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await auth.api.getSession({ headers: opts.headers });
  return { db, session, ...opts };
};

// ── Init ───────────────────────────────────────────────────────────────────────

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createCallerFactory = t.createCallerFactory;
export const createTRPCRouter = t.router;

// ── Middleware ─────────────────────────────────────────────────────────────────

const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();
  if (t._config.isDev) {
    await new Promise((r) => setTimeout(r, Math.floor(Math.random() * 400) + 100));
  }
  const result = await next();
  console.log(`[TRPC] ${path} took ${Date.now() - start}ms`);
  return result;
});

// ── Procedures ─────────────────────────────────────────────────────────────────

/** Public — no auth required */
export const publicProcedure = t.procedure.use(timingMiddleware);

/** Protected — any logged-in user */
export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(({ ctx, next }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({
      ctx: { session: { ...ctx.session, user: ctx.session.user } },
    });
  });

/**
 * Admin — logged-in user with role "admin".
 */
export const adminProcedure = t.procedure
  .use(timingMiddleware)
  .use(({ ctx, next }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    // Cast the user to include the role field we added in the config
    const user = ctx.session.user as typeof ctx.session.user & { role: string };

    if (user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "This action is restricted to admins only.",
      });
    }

    return next({
      ctx: {
        session: {
          ...ctx.session,
          user: user, // Pass the casted user with the role
        },
      },
    });
  });