import { pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm"; // Added

import { user } from "./auth";
import { candidate, poll } from "./poll";

// ── Tables ─────────────────────────────────────────────────────────────────────

/**
 * ANONYMOUS vote storage (SRS §5.2 — "Votes stored anonymously").
 *
 * !! CRITICAL PRIVACY RULE !!
 * This table intentionally has NO userId column.
 * There must be ZERO way to link a vote back to a voter.
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
 * Vote token — answers "has this user voted in this poll?" 
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

        usedAt: timestamp("used_at").notNull().defaultNow(),
    },
    (t) => ({
        uniqueUserPoll: unique("uq_vote_token_user_poll").on(t.userId, t.pollId),
    }),
);

// ── Relations (Added to fix the "undefined" crash) ───────────────────────────

export const voteRelations = relations(vote, ({ one }) => ({
	poll: one(poll, {
		fields: [vote.pollId],
		references: [poll.id],
	}),
	candidate: one(candidate, {
		fields: [vote.candidateId],
		references: [candidate.id],
	}),
}));

export const voteTokenRelations = relations(voteToken, ({ one }) => ({
	poll: one(poll, {
		fields: [voteToken.pollId],
		references: [poll.id],
	}),
	user: one(user, {
		fields: [voteToken.userId],
		references: [user.id],
	}),
}));

// ── Types ──────────────────────────────────────────────────────────────────────

export type Vote = typeof vote.$inferSelect;
export type NewVote = typeof vote.$inferInsert;
export type VoteToken = typeof voteToken.$inferSelect;
export type NewVoteToken = typeof voteToken.$inferInsert;