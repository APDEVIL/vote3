/**
 * jobs/otp-cleanup.ts
 *
 * Deletes expired OTP records and stale rate limit windows.
 * Keeps the security tables lean — run hourly.
 *
 * ── How to run (pick one) ──────────────────────────────────────────────────────
 *
 * Option A — Vercel Cron (free, runs hourly):
 *   1. Create src/app/api/cron/otp-cleanup/route.ts  (same pattern as poll-scheduler)
 *   2. Add to vercel.json:
 *      { "crons": [{ "path": "/api/cron/otp-cleanup", "schedule": "0 * * * *" }] }
 *
 * Option B — cron-job.org (free external cron):
 *   Hit your deployed /api/cron/otp-cleanup once per hour.
 *
 * Option C — Direct run for testing:
 *   pnpm tsx src/server/jobs/otp-cleanup.ts
 *
 * ── Vercel Cron route file ─────────────────────────────────────────────────────
 *
 *   // src/app/api/cron/otp-cleanup/route.ts
 *   import { NextResponse } from "next/server";
 *   import { runOtpCleanup } from "@/server/jobs/otp-cleanup";
 *
 *   export const runtime = "nodejs";
 *   export const maxDuration = 30;
 *
 *   export async function GET(req: Request) {
 *     const secret = req.headers.get("authorization");
 *     if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
 *       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 *     }
 *     const result = await runOtpCleanup();
 *     return NextResponse.json(result);
 *   }
 */

import { and, lt, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "@/server/db/schema";
import { otpRecord, rateLimitRecord } from "@/server/db/schema";

// ── Config ─────────────────────────────────────────────────────────────────────

// Delete used OTPs + expired OTPs older than this many minutes
const OTP_CLEANUP_AFTER_MINUTES = 15;

// Delete rate limit records whose window is older than this many hours
const RATE_LIMIT_CLEANUP_AFTER_HOURS = 2;

// ── Core function ──────────────────────────────────────────────────────────────

export async function runOtpCleanup() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  try {
    const otpCutoff = new Date(
      Date.now() - OTP_CLEANUP_AFTER_MINUTES * 60 * 1000,
    );

    const rateLimitCutoff = new Date(
      Date.now() - RATE_LIMIT_CLEANUP_AFTER_HOURS * 60 * 60 * 1000,
    );

    // Delete OTPs that are either:
    //   - expired (expiresAt is in the past)
    //   - used AND older than OTP_CLEANUP_AFTER_MINUTES
    const deletedOtps = await db
      .delete(otpRecord)
      .where(
        or(
          lt(otpRecord.expiresAt, new Date()),                         // expired
          and(
            lt(otpRecord.createdAt, otpCutoff),                       // old
          ),
        ),
      )
      .returning({ id: otpRecord.id });

    // Delete stale rate limit windows (they reset themselves anyway,
    // but cleaning up prevents unbounded table growth)
    const deletedRateLimits = await db
      .delete(rateLimitRecord)
      .where(lt(rateLimitRecord.windowStart, rateLimitCutoff))
      .returning({ id: rateLimitRecord.id });

    const result = {
      ok: true,
      deletedOtps: deletedOtps.length,
      deletedRateLimits: deletedRateLimits.length,
    };

    console.log(
      `[otp-cleanup] Done — OTPs deleted: ${result.deletedOtps}, rate limits cleared: ${result.deletedRateLimits}`,
    );

    return result;
  } catch (err) {
    console.error("[otp-cleanup] Error:", err);
    return { ok: false, error: String(err) };
  } finally {
    await pool.end();
  }
}

// ── Direct execution ───────────────────────────────────────────────────────────

const isMain =
  process.argv[1]?.endsWith("otp-cleanup.ts") ||
  process.argv[1]?.endsWith("otp-cleanup.js");

if (isMain) {
  void runOtpCleanup().then((r) => {
    console.log("Result:", r);
    process.exit(r.ok ? 0 : 1);
  });
}