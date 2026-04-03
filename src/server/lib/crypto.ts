/**
 * lib/crypto.ts
 *
 * Thin wrappers around @node-rs/argon2.
 *
 * Used for:
 *   - Secret question answers   (secretQuestion.answerHash)
 *   - OTP codes                 (otpRecord.codeHash)
 *   - Admin seed passwords      (account.password)
 *
 * better-auth handles its own password hashing internally —
 * do NOT use these for better-auth login passwords.
 * Only use these for the fields WE control outside of better-auth.
 */

import { hash, verify } from "@node-rs/argon2";

// ── Argon2 config ──────────────────────────────────────────────────────────────
// These match better-auth's internal defaults for consistency.

const ARGON2_OPTIONS = {
  memoryCost: 19456,  // 19 MB
  timeCost: 2,
  outputLen: 32,
  parallelism: 1,
} as const;

// ── Exports ────────────────────────────────────────────────────────────────────

/**
 * Hashes a secret string with argon2id.
 * Use for OTP codes and secret question answers before storing.
 *
 * @example
 *   const hash = await hashSecret("123456");
 *   await db.insert(otpRecord).values({ codeHash: hash, ... });
 */
export async function hashSecret(plain: string): Promise<string> {
  return hash(plain.toLowerCase().trim(), ARGON2_OPTIONS);
}

/**
 * Verifies a plain string against an argon2 hash.
 * Returns true if they match, false otherwise.
 *
 * Input is lowercased + trimmed before comparing —
 * consistent with hashSecret so secret questions are case-insensitive.
 *
 * @example
 *   const ok = await verifySecret("123456", storedHash);
 *   if (!ok) throw new Error("Incorrect code");
 */
export async function verifySecret(
  plain: string,
  hashed: string,
): Promise<boolean> {
  try {
    return await verify(hashed, plain.toLowerCase().trim());
  } catch {
    // verify() throws if the hash format is invalid — treat as mismatch
    return false;
  }
}