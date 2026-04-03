import { pgEnum, pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";

import { user } from "./auth";
import { poll } from "./poll";

// ── Enums ──────────────────────────────────────────────────────────────────────

export const participationStatusEnum = pgEnum("participation_status", [
	"pending",   // voter submitted, waiting for admin review
	"approved",  // admin approved — voter can now cast a vote
	"rejected",  // admin rejected — voter cannot vote in this poll
]);

// ── Tables ─────────────────────────────────────────────────────────────────────

/**
 * A voter must submit a participation request for each poll.
 * Admin reviews and approves/rejects it (SRS §3.5, §4.5).
 *
 * Only approved voters can access the voting screen for that poll.
 */
export const participationRequest = pgTable(
	"participation_request",
	{
		id: text("id").primaryKey(),

		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),

		pollId: text("poll_id")
			.notNull()
			.references(() => poll.id, { onDelete: "cascade" }),

		// Voter submits these for admin to verify (SRS §3.5)
		voterCardId: text("voter_card_id").notNull(),
		address: text("address").notNull(),
		pincode: text("pincode").notNull(),

		status: participationStatusEnum("status").notNull().default("pending"),

		// Admin who reviewed this request
		reviewedBy: text("reviewed_by").references(() => user.id, {
			onDelete: "set null",
		}),
		reviewedAt: timestamp("reviewed_at"),

		// Optional rejection reason for voter notification
		rejectionReason: text("rejection_reason"),

		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},
	(t) => ({
		// A voter can only submit one request per poll
		uniqueUserPoll: unique("uq_participation_user_poll").on(
			t.userId,
			t.pollId,
		),
	}),
);

// ── Types ──────────────────────────────────────────────────────────────────────

export type ParticipationRequest = typeof participationRequest.$inferSelect;
export type NewParticipationRequest = typeof participationRequest.$inferInsert;
export type ParticipationStatus =
	(typeof participationStatusEnum.enumValues)[number];