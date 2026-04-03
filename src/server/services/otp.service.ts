/**
 * otp.service.ts
 *
 * Handles OTP generation, hashing, verification, and rate limiting.
 *
 * Rules:
 *  - OTP is 6 digits
 *  - Expires in OTP_EXPIRY_MINUTES (default 10)
 *  - Max OTP_MAX_ATTEMPTS wrong guesses before record is invalidated
 *  - Max OTP_RATE_LIMIT requests per OTP_RATE_WINDOW_MINUTES per key
 *  - In development (SMS_PROVIDER=console) OTP is printed to terminal
 */

import { hash, verify } from "@node-rs/argon2";
import { and, eq, gt } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import type * as schema from "@/server/db/schema";
import { otpRecord, rateLimitRecord } from "@/server/db/schema";
import type { OtpType } from "@/server/db/schema";
import { generateId } from "@/server/lib/ids";

// ── Config ─────────────────────────────────────────────────────────────────────

const OTP_EXPIRY_MINUTES = 10;
const OTP_MAX_ATTEMPTS = 5;
const OTP_RATE_LIMIT = 3;            // max OTPs per window per key
const OTP_RATE_WINDOW_MINUTES = 10;  // window duration

// ── Helpers ────────────────────────────────────────────────────────────────────

function generateRawOtp(): string {
  // Cryptographically random 6-digit OTP
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return String(array[0]! % 1_000_000).padStart(6, "0");
}

function getRateLimitKey(type: OtpType, identifier: string): string {
  return `otp:${type}:${identifier}`;
}

// ── Exports ────────────────────────────────────────────────────────────────────

/**
 * Checks rate limit for OTP requests.
 * Throws a descriptive error if the limit is exceeded.
 *
 * @param identifier  Mobile number or email — used as part of the key
 */
export async function checkOtpRateLimit(
  db: PostgresJsDatabase<typeof schema>,
  type: OtpType,
  identifier: string,
): Promise<void> {
  const key = getRateLimitKey(type, identifier);
  const windowStart = new Date(
    Date.now() - OTP_RATE_WINDOW_MINUTES * 60 * 1000,
  );

  const existing = await db.query.rateLimitRecord.findFirst({
    where: eq(rateLimitRecord.key, key),
  });

  if (!existing) return; // no previous attempts — allow

  // Reset window if it has expired
  if (existing.windowStart < windowStart) {
    await db
      .update(rateLimitRecord)
      .set({ attempts: 1, windowStart: new Date(), updatedAt: new Date() })
      .where(eq(rateLimitRecord.key, key));
    return;
  }

  if (existing.attempts >= OTP_RATE_LIMIT) {
    const retryAfterMs =
      existing.windowStart.getTime() +
      OTP_RATE_WINDOW_MINUTES * 60 * 1000 -
      Date.now();
    const retryAfterMin = Math.ceil(retryAfterMs / 60_000);
    throw new Error(
      `Too many OTP requests. Try again in ${retryAfterMin} minute(s).`,
    );
  }
}

/**
 * Generates a new OTP for a user, hashes it, stores it in the DB,
 * and returns the raw OTP for sending via SMS/email.
 *
 * Invalidates any previous unused OTPs of the same type for this user.
 */
export async function generateOtp(
  db: PostgresJsDatabase<typeof schema>,
  userId: string,
  type: OtpType,
  identifier: string,  // mobile or email — for rate limiting
): Promise<string> {
  await checkOtpRateLimit(db, type, identifier);

  const rawOtp = generateRawOtp();

  // Hash before storing — never store plaintext OTPs
  const codeHash = await hash(rawOtp, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });

  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  // Invalidate old OTPs of same type for this user
  await db
    .update(otpRecord)
    .set({ used: true })
    .where(and(eq(otpRecord.userId, userId), eq(otpRecord.type, type)));

  // Insert new OTP record
  await db.insert(otpRecord).values({
    id: generateId(),
    userId,
    type,
    codeHash,
    expiresAt,
    attempts: 0,
    used: false,
    createdAt: new Date(),
  });

  // Update rate limit counter
  const key = getRateLimitKey(type, identifier);
  const existing = await db.query.rateLimitRecord.findFirst({
    where: eq(rateLimitRecord.key, key),
  });

  if (existing) {
    await db
      .update(rateLimitRecord)
      .set({ attempts: existing.attempts + 1, updatedAt: new Date() })
      .where(eq(rateLimitRecord.key, key));
  } else {
    await db.insert(rateLimitRecord).values({
      id: generateId(),
      key,
      attempts: 1,
      windowStart: new Date(),
      updatedAt: new Date(),
    });
  }

  // In development, print OTP to console — no SMS needed
  if (process.env.SMS_PROVIDER === "console" || process.env.NODE_ENV === "development") {
    console.log(`\n🔑 OTP [${type}] for ${identifier}: ${rawOtp} (expires in ${OTP_EXPIRY_MINUTES}min)\n`);
  }

  return rawOtp;
}

/**
 * Verifies an OTP code submitted by the user.
 * Increments attempt counter on failure.
 * Marks as used on success.
 *
 * @returns true if valid, throws descriptive error if not
 */
export async function verifyOtp(
  db: PostgresJsDatabase<typeof schema>,
  userId: string,
  type: OtpType,
  submittedCode: string,
): Promise<true> {
  const now = new Date();

  const record = await db.query.otpRecord.findFirst({
    where: and(
      eq(otpRecord.userId, userId),
      eq(otpRecord.type, type),
      eq(otpRecord.used, false),
      gt(otpRecord.expiresAt, now),
    ),
    orderBy: (o, { desc }) => [desc(o.createdAt)],
  });

  if (!record) {
    throw new Error("OTP expired or not found. Please request a new one.");
  }

  if (record.attempts >= OTP_MAX_ATTEMPTS) {
    throw new Error("Too many incorrect attempts. Please request a new OTP.");
  }

  const isValid = await verify(record.codeHash, submittedCode);

  if (!isValid) {
    // Increment attempts
    await db
      .update(otpRecord)
      .set({ attempts: record.attempts + 1 })
      .where(eq(otpRecord.id, record.id));

    const remaining = OTP_MAX_ATTEMPTS - (record.attempts + 1);
    throw new Error(
      `Incorrect OTP. ${remaining} attempt(s) remaining.`,
    );
  }

  // Mark as used — cannot be reused
  await db
    .update(otpRecord)
    .set({ used: true })
    .where(eq(otpRecord.id, record.id));

  return true;
}