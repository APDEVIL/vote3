import { boolean, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

// ── Enums ──────────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum("user_role", ["voter", "admin"]);

// ── Tables ─────────────────────────────────────────────────────────────────────

/**
 * better-auth owns the base shape of this table.
 * We extend it with voting-system specific columns.
 *
 * IMPORTANT: Column names here must match what better-auth expects.
 * Do NOT rename: id, name, email, emailVerified, image, createdAt, updatedAt.
 */
export const user = pgTable("user", {
	// ── better-auth core columns (do not rename) ──
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").notNull().default(false),
	image: text("image"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),

	// ── Voting system extensions ──────────────────
	// System-generated, user-facing ID (e.g. VC-X7K2-M9P1)
	// Visible on profile, used for participation requests
	voterCardId: text("voter_card_id").unique(),

	// Role — voter by default, admin set via ADMIN_EMAILS env
	role: userRoleEnum("role").notNull().default("voter"),

	// Mobile — unique constraint enforced at DB level (SRS §3.2)
	mobile: text("mobile").unique(),
	mobileVerified: boolean("mobile_verified").notNull().default(false),

	// Address fields — required for participation requests
	address: text("address"),
	pincode: text("pincode"),

	// Security setup completion flags
	secretQuestionsSet: boolean("secret_questions_set").notNull().default(false),
	faceEnrolled: boolean("face_enrolled").notNull().default(false),

	// Face recognition — stores reference ID from face provider
	// (e.g. AWS Rekognition FaceId, FaceIO faceId, etc.)
	faceReferenceId: text("face_reference_id"),

	// Admin has approved this voter (SRS §3.5)
	isVerified: boolean("is_verified").notNull().default(false),
});

/**
 * better-auth session table — no changes needed.
 */
export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expires_at").notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
});

/**
 * better-auth account table — handles OAuth + email/password links.
 * No changes needed.
 */
export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at"),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * better-auth verification table — used for email verification tokens.
 * No changes needed.
 */
export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

// ── Types ──────────────────────────────────────────────────────────────────────

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;
export type Session = typeof session.$inferSelect;