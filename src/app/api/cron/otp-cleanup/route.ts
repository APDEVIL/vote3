import { type NextRequest, NextResponse } from "next/server";
import { runOtpCleanup } from "@/server/jobs/otp-cleanup";

/**
 * Cron route — deletes expired OTP records and stale rate limit windows.
 * Runs hourly.
 *
 * vercel.json:
 * {
 *   "crons": [{ "path": "/api/cron/otp-cleanup", "schedule": "0 * * * *" }]
 * }
 */
export const runtime     = "nodejs";
export const maxDuration = 30;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");

  if (
    process.env.NODE_ENV === "production" &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runOtpCleanup();
  return NextResponse.json(result);
}