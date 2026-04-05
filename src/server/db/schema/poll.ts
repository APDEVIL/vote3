import {
	integer,
	pgEnum,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm"; // Added

import { user } from "./auth";
import { vote } from "./vote"; // Added to link relations

// ── Enums ──────────────────────────────────────────────────────────────────────

/**
 * Poll lifecycle (SRS §4.3):
 * created         → poll configured, not yet open
 * active          → voting is ongoing (within startTime–endTime)
 * ended           → voting closed, results not yet published
 * result_available → results visible to admin + voters
 */
export const pollStatusEnum = pgEnum("poll_status", [
	"created",
	"active",
	"ended",
	"result_available",
]);

// ── Tables ─────────────────────────────────────────────────────────────────────

export const poll = pgTable("poll", {
	id: text("id").primaryKey(),

	title: text("title").notNull(),
	description: text("description"),

	// Lifecycle status — transitions managed by poll-lifecycle.service.ts
	status: pollStatusEnum("status").notNull().default("created"),

	// Voting window — enforced at application layer before inserting votes
	startTime: timestamp("start_time").notNull(),
	endTime: timestamp("end_time").notNull(),

	// Admin who created the poll
	createdBy: text("created_by")
		.notNull()
		.references(() => user.id, { onDelete: "restrict" }),

	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const candidate = pgTable("candidate", {
	id: text("id").primaryKey(),

	pollId: text("poll_id")
		.notNull()
		.references(() => poll.id, { onDelete: "cascade" }),

	name: text("name").notNull(),
	description: text("description"),

	// Display order within the poll
	order: integer("order").notNull().default(0),

	createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Relations (Added to fix the "undefined" crash) ───────────────────────────

export const pollRelations = relations(poll, ({ many, one }) => ({
	candidates: many(candidate),
	votes: many(vote),
	author: one(user, {
		fields: [poll.createdBy],
		references: [user.id],
	}),
}));

export const candidateRelations = relations(candidate, ({ one, many }) => ({
	poll: one(poll, {
		fields: [candidate.pollId],
		references: [poll.id],
	}),
	votes: many(vote),
}));

// ── Types ──────────────────────────────────────────────────────────────────────

export type Poll = typeof poll.$inferSelect;
export type NewPoll = typeof poll.$inferInsert;
export type Candidate = typeof candidate.$inferSelect;
export type NewCandidate = typeof candidate.$inferInsert;
export type PollStatus = (typeof pollStatusEnum.enumValues)[number];