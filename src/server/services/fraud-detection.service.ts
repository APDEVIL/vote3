/**
 * fraud-detection.service.ts
 *
 * Detects duplicate identities and tracks suspicious activity.
 *
 * Covers SRS §13:
 *   13.1 Detect duplicate voter ID
 *   13.2 Detect duplicate face
 *   13.3 Rate limit OTP  (handled in otp.service.ts)
 *   13.4 Track sessions
 */

import { and, eq, ne } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import type * as schema from "@/server/db/schema";
import { deviceSession, user } from "@/server/db/schema";
import { generateId } from "@/server/lib/ids";

// ── Duplicate checks ───────────────────────────────────────────────────────────

/**
 * Checks if a mobile number is already registered.
 * Throws if duplicate — call this before creating a new user (SRS §13.1, §3.2).
 */
export async function checkDuplicateMobile(
  db: PostgresJsDatabase<typeof schema>,
  mobile: string,
): Promise<void> {
  const existing = await db.query.user.findFirst({
    where: eq(user.mobile, mobile),
    columns: { id: true },
  });

  if (existing) {
    throw new Error(
      "This mobile number is already registered. Each mobile number can only be used once.",
    );
  }
}

/**
 * Checks if a face reference ID is already enrolled by a different user.
 * Prevents one person registering multiple accounts with the same face (SRS §13.2).
 *
 * @param faceReferenceId  The ID returned by the face provider on enrollment
 * @param excludeUserId    Skip checking against this userId (for re-enrollment)
 */
export async function checkDuplicateFace(
  db: PostgresJsDatabase<typeof schema>,
  faceReferenceId: string,
  excludeUserId?: string,
): Promise<void> {
  const conditions = excludeUserId
    ? and(
        eq(user.faceReferenceId, faceReferenceId),
        ne(user.id, excludeUserId),
      )
    : eq(user.faceReferenceId, faceReferenceId);

  const existing = await db.query.user.findFirst({
    where: conditions,
    columns: { id: true },
  });

  if (existing) {
    throw new Error(
      "This face is already enrolled with another account. Duplicate face registration is not allowed.",
    );
  }
}

// ── Device / session tracking ──────────────────────────────────────────────────

/**
 * Records or updates a device session for a user (SRS §13.4).
 *
 * Call this after a successful login.
 * Returns true if this is a known device, false if it's new (for alerts later).
 */
export async function trackDeviceSession(
  db: PostgresJsDatabase<typeof schema>,
  userId: string,
  deviceFingerprint: string,
  ipAddress?: string,
  userAgent?: string,
): Promise<{ isNewDevice: boolean }> {
  const existing = await db.query.deviceSession.findFirst({
    where: and(
      eq(deviceSession.userId, userId),
      eq(deviceSession.deviceFingerprint, deviceFingerprint),
    ),
  });

  if (existing) {
    // Update lastSeenAt for known device
    await db
      .update(deviceSession)
      .set({ lastSeenAt: new Date(), ipAddress: ipAddress ?? existing.ipAddress })
      .where(eq(deviceSession.id, existing.id));

    return { isNewDevice: false };
  }

  // New device — record it as untrusted until confirmed
  await db.insert(deviceSession).values({
    id: generateId(),
    userId,
    deviceFingerprint,
    ipAddress: ipAddress ?? null,
    userAgent: userAgent ?? null,
    trusted: false,
    lastSeenAt: new Date(),
    createdAt: new Date(),
  });

  return { isNewDevice: true };
}

/**
 * Returns all active device sessions for a user.
 * Useful for "active sessions" page and security alerts.
 */
export async function getUserDeviceSessions(
  db: PostgresJsDatabase<typeof schema>,
  userId: string,
) {
  return db.query.deviceSession.findMany({
    where: eq(deviceSession.userId, userId),
    orderBy: (d, { desc }) => [desc(d.lastSeenAt)],
  });
}

/**
 * Marks a device as trusted (after user confirms it's their device).
 */
export async function trustDevice(
  db: PostgresJsDatabase<typeof schema>,
  deviceSessionId: string,
  userId: string,
): Promise<void> {
  await db
    .update(deviceSession)
    .set({ trusted: true })
    .where(
      and(
        eq(deviceSession.id, deviceSessionId),
        eq(deviceSession.userId, userId),  // security: user can only trust their own devices
      ),
    );
}