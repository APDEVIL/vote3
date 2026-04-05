import { pgTable, foreignKey, unique, text, timestamp, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const notificationStatus = pgEnum("notification_status", ['sent', 'failed', 'pending'])
export const notificationType = pgEnum("notification_type", ['otp_sms', 'otp_email', 'email_verify', 'approval', 'rejection', 'poll_activated', 'poll_ended', 'result_available'])
export const otpType = pgEnum("otp_type", ['mobile_verify', 'email_verify', 'login', 'password_reset'])
export const participationStatus = pgEnum("participation_status", ['pending', 'approved', 'rejected'])
export const pollStatus = pgEnum("poll_status", ['created', 'active', 'ended', 'result_available'])
export const userRole = pgEnum("user_role", ['voter', 'admin'])


export const voteToken = pgTable("vote_token", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	pollId: text("poll_id").notNull(),
	usedAt: timestamp("used_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "vote_token_user_id_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.pollId],
			foreignColumns: [poll.id],
			name: "vote_token_poll_id_poll_id_fk"
		}).onDelete("cascade"),
	unique("uq_vote_token_user_poll").on(table.userId, table.pollId),
]);
