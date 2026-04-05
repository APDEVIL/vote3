import { type NextRequest, NextResponse } from "next/server";
import { runPollScheduler } from "@/server/jobs/poll-scheduler";

/**
 * Cron route — auto-activates and auto-ends polls by startTime/endTime.
 *
 * Called every minute by Vercel Cron or cron-job.org (free).
 *
 * vercel.json:
 * {
 *   "crons": [{ "path": "/api/cron/poll-scheduler", "schedule": "* * * * *" }]
 * }
 *
 * Protected by CRON_SECRET header — set this in your .env:
 *   CRON_SECRET="your-random-secret-string"
 */
export const runtime   = "nodejs";
export const maxDuration = 30;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");

  // Allow Vercel internal cron (no secret needed in that case)
  // For external crons (cron-job.org), require the secret
  if (
    process.env.NODE_ENV === "production" &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runPollScheduler();
  return NextResponse.json(result);
}