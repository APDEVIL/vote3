import { relations } from "drizzle-orm/relations";
import { user, voteToken, poll } from "./schema";

export const voteTokenRelations = relations(voteToken, ({one}) => ({
	user: one(user, {
		fields: [voteToken.userId],
		references: [user.id]
	}),
	poll: one(poll, {
		fields: [voteToken.pollId],
		references: [poll.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	voteTokens: many(voteToken),
}));

export const pollRelations = relations(poll, ({many}) => ({
	voteTokens: many(voteToken),
}));