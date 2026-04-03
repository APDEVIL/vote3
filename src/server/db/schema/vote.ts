import { pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";

import { user } from "./auth";
import { candidate, poll } from "./poll";

// ── Tables ─────────────────────────────────────────────────────────────────────

/**
 * ANONYMOUS vote storage (SRS §5.2 — "Votes stored anonymously").
 *
 * !! CRITICAL PRIVACY RULE !!
 * This table intentionally has NO userId column.
 * There must be ZERO way to link a vote back to a voter.
 * This is enforced at the schema level — not just the application layer.
 *
 * How we prevent double-voting without a userId:
 *   → See the `voteToken` table below.
 *
 * Never add a userId column here. Never join this table with `user`.
 */
export const vote = pgTable("vote", {
	id: text("id").primaryKey(),

	pollId: text("poll_id")
		.notNull()
		.references(() => poll.id, { onDelete: "restrict" }),

	candidateId: text("candidate_id")
		.notNull()
		.references(() => candidate.id, { onDelete: "restrict" }),

	// When the vote was cast — kept for audit purposes only
	castedAt: timestamp("casted_at").notNull().defaultNow(),
});

/**
 * Vote token — answers "has this user voted in this poll?" WITHOUT
 * revealing what they voted for.
 *
 * This table is the ONLY connection between a user and a poll.
 * It proves participation, never choice.
 *
 * Both tables (`vote` and `voteToken`) must be inserted in a
 * single DB transaction in vote.router.ts — if either fails,
 * both roll back.
 */
export const voteToken = pgTable(
	"vote_token",
	{
		id: text("id").primaryKey(),

		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),

		pollId: text("poll_id")
			.notNull()
			.references(() => poll.id, { onDelete: "cascade" }),

		// Timestamp used for profile voting history (SRS §3.4)
		// Shows "voted in X poll at Y time" — never shows candidate
		usedAt: timestamp("used_at").notNull().defaultNow(),
	},
	(t) => ({
		// Hard DB constraint — one vote per user per poll (SRS §3.6)
		uniqueUserPoll: unique("uq_vote_token_user_poll").on(t.userId, t.pollId),
	}),
);

// ── Types ──────────────────────────────────────────────────────────────────────

export type Vote = typeof vote.$inferSelect;
export type NewVote = typeof vote.$inferInsert;
export type VoteToken = typeof voteToken.$inferSelect;
export type NewVoteToken = typeof voteToken.$inferInsert;