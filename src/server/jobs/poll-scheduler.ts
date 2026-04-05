/**
 * jobs/poll-scheduler.ts
 *
 * Auto-activates and auto-ends polls based on their startTime / endTime.
 *
 * This runs on a schedule — every minute is ideal.
 *
 * ── How to run (pick one based on your deployment) ────────────────────────────
 *
 * Option A — Vercel Cron (free on hobby plan, runs every minute):
 *   1. Create src/app/api/cron/poll-scheduler/route.ts  (see below)
 *   2. Add to vercel.json:
 *      {
 *        "crons": [{ "path": "/api/cron/poll-scheduler", "schedule": "* * * * *" }]
 *      }
 *
 * Option B — Next.js API route hit by an external cron (cron-job.org — free):
 *   Same route file, protected by CRON_SECRET header.
 *   Set up a free job at https://cron-job.org hitting your deployed URL.
 *
 * Option C — Local dev testing:
 *   pnpm tsx src/server/jobs/poll-scheduler.ts
 *
 * ── Vercel Cron route file ─────────────────────────────────────────────────────
 *
 *   // src/app/api/cron/poll-scheduler/route.ts
 *   import { NextResponse } from "next/server";
 *   import { runPollScheduler } from "@/server/jobs/poll-scheduler";
 *
 *   export const runtime = "nodejs";
 *   export const maxDuration = 30;
 *
 *   export async function GET(req: Request) {
 *     const secret = req.headers.get("authorization");
 *     if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
 *       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 *     }
 *     const result = await runPollScheduler();
 *     return NextResponse.json(result);
 *   }
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "@/server/db/schema";
import { syncPollStatuses } from "@/server/services/poll-lifecycle.service";

// ── Core function (called by cron route or directly) ──────────────────────────

export async function runPollScheduler() {
  const client = postgres(process.env.DATABASE_URL!);
  const db = drizzle(client, { schema });

  try {
    const result = await syncPollStatuses(db);
    console.log(
      `[poll-scheduler] Done — activated: ${result.activated}, ended: ${result.ended}`,
    );
    return { ok: true, ...result };
  } catch (err) {
    console.error("[poll-scheduler] Error:", err);
    return { ok: false, error: String(err) };
  } finally {
    await client.end();
  }
}

// ── Direct execution (pnpm tsx src/server/jobs/poll-scheduler.ts) ─────────────

const isMain =
  process.argv[1]?.endsWith("poll-scheduler.ts") ||
  process.argv[1]?.endsWith("poll-scheduler.js");

if (isMain) {
  void runPollScheduler().then((r) => {
    console.log("Result:", r);
    process.exit(r.ok ? 0 : 1);
  });
}