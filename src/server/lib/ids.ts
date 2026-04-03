/**
 * lib/ids.ts
 *
 * Centralized ID generation for all tables.
 *
 * Why not use uuid()?
 *   UUIDs are long and ugly in URLs (550e8400-e29b-41d4-a716-446655440000).
 *   These IDs are shorter, URL-safe, and still cryptographically random.
 *
 * Format:
 *   generateId()          → "x7k2m9p1q3rs"     (12 chars, ~72 bits entropy)
 *   generateId("usr")     → "usr_x7k2m9p1q3rs"
 *   generateId("poll")    → "poll_x7k2m9p1q3rs"
 *
 * Voter card IDs are handled separately in voter-id.service.ts
 * because they have a specific human-readable format (VC-XXXX-XXXX).
 */

import { randomBytes } from "crypto";

/**
 * Generates a short, URL-safe, cryptographically random ID.
 *
 * @param prefix  Optional prefix — e.g. "usr", "poll", "vote"
 * @param bytes   Random byte length (default 9 → 12 base64url chars, ~72 bits)
 */
export function generateId(prefix?: string, bytes = 9): string {
  const id = randomBytes(bytes).toString("base64url");
  return prefix ? `${prefix}_${id}` : id;
}