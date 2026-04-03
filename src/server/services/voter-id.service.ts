/**
 * voter-id.service.ts
 *
 * Generates globally unique, human-readable IDs for voters.
 *
 * voterCardId format : VC-XXXX-XXXX  (user-facing, shown on profile)
 * internalUserId     : uses generateId() from lib/ids — used internally only
 *
 * Both IDs are checked for uniqueness against the DB before returning.
 * Neither can be edited after creation (enforced in routers).
 */

import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";

import { user } from "@/server/db/schema";
import type * as schema from "@/server/db/schema";

// ── Helpers ────────────────────────────────────────────────────────────────────

function randomSegment(length: number): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I — avoid confusion
  let result = "";
  // crypto.getRandomValues works in Node 19+ and all browsers
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  for (const byte of array) {
    result += chars[byte % chars.length];
  }
  return result;
}

/**
 * Generates a voter card ID in the format VC-XXXX-XXXX.
 * Retries up to 5 times if there's a collision (astronomically unlikely).
 */
export async function generateVoterCardId(
  db: PostgresJsDatabase<typeof schema>,
): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = `VC-${randomSegment(4)}-${randomSegment(4)}`;

    const existing = await db.query.user.findFirst({
      where: eq(user.voterCardId, candidate),
      columns: { id: true },
    });

    if (!existing) return candidate;
  }

  throw new Error("Failed to generate unique voterCardId after 5 attempts");
}