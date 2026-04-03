import {
	boolean,
	integer,
	pgEnum,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

import { user } from "./auth";

// ── Enums ──────────────────────────────────────────────────────────────────────

export const otpTypeEnum = pgEnum("otp_type", [
	"mobile_verify",   // verify mobile number on registration
	"email_verify",    // verify email on registration
	"login",           // OTP step during login
	"password_reset",  // account recovery flow
]);

// ── Tables ─────────────────────────────────────────────────────────────────────

/**
 * OTP records (SRS §11.2).
 *
 * The `code` column stores a bcrypt/argon2 HASH of the OTP — never plaintext.
 * Rate limiting is enforced via `rateLimitRecord` table below.
 */
export const otpRecord = pgTable("otp_record", {
	id: text("id").primaryKey(),

	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),

	type: otpTypeEnum("type").notNull(),

	// Hashed OTP code — use crypto.ts helpers to compare
	codeHash: text("code_hash").notNull(),

	// OTP expires after N minutes (configured in otp.service.ts)
	expiresAt: timestamp("expires_at").notNull(),

	// Track failed attempts to lock out brute force
	attempts: integer("attempts").notNull().default(0),

	// Marked true once successfully verified — cannot be reused
	used: boolean("used").notNull().default(false),

	createdAt: timestamp("created_at").notNull().defaultNow(),
});

/**
 * Secret questions — exactly 3 per user (SRS §3.1).
 *
 * `answerHash` stores a bcrypt hash of the lowercased, trimmed answer.
 * Question text is stored so we can display it back to the user during recovery.
 */
export const secretQuestion = pgTable("secret_question", {
	id: text("id").primaryKey(),

	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),

	// 1, 2, or 3 — position in the set of 3 questions
	questionIndex: integer("question_index").notNull(),

	// The question text chosen/written by the user
	question: text("question").notNull(),

	// bcrypt hash of lowercased + trimmed answer
	answerHash: text("answer_hash").notNull(),

	createdAt: timestamp("created_at").notNull().defaultNow(),
});

/**
 * Device sessions — for fraud detection and session tracking (SRS §13.4).
 *
 * Tracks which devices a user has logged in from.
 * Used to flag suspicious activity (new device, new country, etc.).
 */
export const deviceSession = pgTable("device_session", {
	id: text("id").primaryKey(),

	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),

	// Browser/device fingerprint (user-agent hash or FingerprintJS id)
	deviceFingerprint: text("device_fingerprint").notNull(),

	ipAddress: text("ip_address"),

	// Human-readable device info for admin review
	userAgent: text("user_agent"),

	// Whether this device has been seen before and is considered trusted
	trusted: boolean("trusted").notNull().default(false),

	lastSeenAt: timestamp("last_seen_at").notNull().defaultNow(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
});

/**
 * Rate limit records (SRS §13.3 — rate limit OTP).
 *
 * Key format examples:
 *   otp:mobile:+919876543210   → OTP requests for a mobile number
 *   otp:email:user@domain.com  → OTP requests for an email
 *   login:ip:192.168.1.1       → Login attempts from an IP
 *
 * Window resets after windowDurationSeconds.
 * Max attempts enforced in otp.service.ts / fraud-detection.service.ts.
 */
export const rateLimitRecord = pgTable("rate_limit_record", {
	id: text("id").primaryKey(),

	// Composite key identifying what is being rate limited
	key: text("key").notNull().unique(),

	// Number of attempts in the current window
	attempts: integer("attempts").notNull().default(1),

	// Start of the current window — reset when windowDurationSeconds has elapsed
	windowStart: timestamp("window_start").notNull().defaultNow(),

	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── Types ──────────────────────────────────────────────────────────────────────

export type OtpRecord = typeof otpRecord.$inferSelect;
export type NewOtpRecord = typeof otpRecord.$inferInsert;
export type OtpType = (typeof otpTypeEnum.enumValues)[number];

export type SecretQuestion = typeof secretQuestion.$inferSelect;
export type NewSecretQuestion = typeof secretQuestion.$inferInsert;

export type DeviceSession = typeof deviceSession.$inferSelect;
export type RateLimitRecord = typeof rateLimitRecord.$inferSelect;