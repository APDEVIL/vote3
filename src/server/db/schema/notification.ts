import { json, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "./auth";

// ── Enums ──────────────────────────────────────────────────────────────────────

export const notificationTypeEnum = pgEnum("notification_type", [
	"otp_sms",           // OTP sent via SMS
	"otp_email",         // OTP sent via email
	"email_verify",      // Email verification link
	"approval",          // Participation request approved
	"rejection",         // Participation request rejected
	"poll_activated",    // Poll is now active — voting open
	"poll_ended",        // Poll has ended
	"result_available",  // Results are now visible
]);

export const notificationStatusEnum = pgEnum("notification_status", [
	"sent",
	"failed",
	"pending",
]);

// ── Tables ─────────────────────────────────────────────────────────────────────

/**
 * Audit log of all outbound notifications (SRS §14).
 *
 * Every SMS, email, and in-app notification is logged here.
 * Used for debugging delivery failures and admin audit trail.
 */
export const notificationLog = pgTable("notification_log", {
	id: text("id").primaryKey(),

	// Nullable — system notifications may not have a specific recipient
	userId: text("user_id").references(() => user.id, { onDelete: "set null" }),

	type: notificationTypeEnum("type").notNull(),
	status: notificationStatusEnum("status").notNull().default("pending"),

	// Destination — mobile number or email address
	recipient: text("recipient"),

	// Provider response / error message for debugging
	providerResponse: text("provider_response"),

	// Extra context — e.g. { pollId, requestId, otpExpiry }
	// Use json (not jsonb) for broad Postgres compatibility
	meta: json("meta").$type<Record<string, unknown>>(),

	sentAt: timestamp("sent_at"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Types ──────────────────────────────────────────────────────────────────────

export type NotificationLog = typeof notificationLog.$inferSelect;
export type NewNotificationLog = typeof notificationLog.$inferInsert;
export type NotificationType = (typeof notificationTypeEnum.enumValues)[number];
export type NotificationStatus =
	(typeof notificationStatusEnum.enumValues)[number];