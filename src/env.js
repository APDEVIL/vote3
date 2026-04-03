// @ts-nocheck
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
	server: {
		// ── Core ──────────────────────────────────────────────
		NODE_ENV: z
			.enum(["development", "test", "production"])
			.default("development"),
		DATABASE_URL: z.string().url(),

		// ── Better Auth ───────────────────────────────────────
		BETTER_AUTH_SECRET:
			process.env.NODE_ENV === "production"
				? z.string()
				: z.string().optional(),
		BETTER_AUTH_GITHUB_CLIENT_ID: z.string(),
		BETTER_AUTH_GITHUB_CLIENT_SECRET: z.string(),

		// ── Email  (Resend — free tier: 3000 emails/month) ────
		// Sign up at https://resend.com — no credit card needed
		RESEND_API_KEY: z.string(),
		EMAIL_FROM: z.string().default("noreply@yourdomain.com"),

		// ── SMS / OTP ─────────────────────────────────────────
		// In development OTPs are printed to console — no SMS needed.
		// In production pick ONE free option and fill it in:
		//   Option A: Fast2SMS (India) — https://fast2sms.com  free credits on signup
		//   Option B: Twilio trial    — https://twilio.com     free trial number
		//   Option C: MSG91           — https://msg91.com      free trial
		SMS_PROVIDER: z
			.enum(["fast2sms", "twilio", "msg91", "console"])
			.default("console"),

		// Fast2SMS (free option for India)
		FAST2SMS_API_KEY: z.string().optional(),

		// Twilio (free trial)
		TWILIO_ACCOUNT_SID: z.string().optional(),
		TWILIO_AUTH_TOKEN: z.string().optional(),
		TWILIO_PHONE_NUMBER: z.string().optional(),

		// ── App ───────────────────────────────────────────────
		NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),

		// ── Admin ─────────────────────────────────────────────
		// Comma-separated list of emails that are allowed to be admins
		// e.g. "admin@yourdomain.com,superadmin@yourdomain.com"
		ADMIN_EMAILS: z.string(),
	},

	client: {
		NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
	},

	runtimeEnv: {
		NODE_ENV: process.env.NODE_ENV,
		DATABASE_URL: process.env.DATABASE_URL,

		BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
		BETTER_AUTH_GITHUB_CLIENT_ID: process.env.BETTER_AUTH_GITHUB_CLIENT_ID,
		BETTER_AUTH_GITHUB_CLIENT_SECRET:
			process.env.BETTER_AUTH_GITHUB_CLIENT_SECRET,

		RESEND_API_KEY: process.env.RESEND_API_KEY,
		EMAIL_FROM: process.env.EMAIL_FROM,

		SMS_PROVIDER: process.env.SMS_PROVIDER,
		FAST2SMS_API_KEY: process.env.FAST2SMS_API_KEY,
		TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
		TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
		TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,

		NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
		ADMIN_EMAILS: process.env.ADMIN_EMAILS,
	},

	skipValidation: !!process.env.SKIP_ENV_VALIDATION,
	emptyStringAsUndefined: true,
});