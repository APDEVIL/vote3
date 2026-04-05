CREATE TYPE "public"."user_role" AS ENUM('voter', 'admin');--> statement-breakpoint
CREATE TYPE "public"."notification_status" AS ENUM('sent', 'failed', 'pending');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('otp_sms', 'otp_email', 'email_verify', 'approval', 'rejection', 'poll_activated', 'poll_ended', 'result_available');--> statement-breakpoint
CREATE TYPE "public"."participation_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."poll_status" AS ENUM('created', 'active', 'ended', 'result_available');--> statement-breakpoint
CREATE TYPE "public"."otp_type" AS ENUM('mobile_verify', 'email_verify', 'login', 'password_reset');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"voter_card_id" text,
	"role" "user_role" DEFAULT 'voter' NOT NULL,
	"mobile" text,
	"mobile_verified" boolean DEFAULT false NOT NULL,
	"address" text,
	"pincode" text,
	"secret_questions_set" boolean DEFAULT false NOT NULL,
	"face_enrolled" boolean DEFAULT false NOT NULL,
	"face_reference_id" text,
	"is_verified" boolean DEFAULT false NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_voter_card_id_unique" UNIQUE("voter_card_id"),
	CONSTRAINT "user_mobile_unique" UNIQUE("mobile")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notification_log" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"type" "notification_type" NOT NULL,
	"status" "notification_status" DEFAULT 'pending' NOT NULL,
	"recipient" text,
	"provider_response" text,
	"meta" json,
	"sent_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "participation_request" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"poll_id" text NOT NULL,
	"voter_card_id" text NOT NULL,
	"address" text NOT NULL,
	"pincode" text NOT NULL,
	"status" "participation_status" DEFAULT 'pending' NOT NULL,
	"reviewed_by" text,
	"reviewed_at" timestamp,
	"rejection_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uq_participation_user_poll" UNIQUE("user_id","poll_id")
);
--> statement-breakpoint
CREATE TABLE "candidate" (
	"id" text PRIMARY KEY NOT NULL,
	"poll_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "poll" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" "poll_status" DEFAULT 'created' NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "device_session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"device_fingerprint" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"trusted" boolean DEFAULT false NOT NULL,
	"last_seen_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "otp_record" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" "otp_type" NOT NULL,
	"code_hash" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"used" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rate_limit_record" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"attempts" integer DEFAULT 1 NOT NULL,
	"window_start" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "rate_limit_record_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "secret_question" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"question_index" integer NOT NULL,
	"question" text NOT NULL,
	"answer_hash" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vote" (
	"id" text PRIMARY KEY NOT NULL,
	"poll_id" text NOT NULL,
	"candidate_id" text NOT NULL,
	"casted_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vote_token" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"poll_id" text NOT NULL,
	"used_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uq_vote_token_user_poll" UNIQUE("user_id","poll_id")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_log" ADD CONSTRAINT "notification_log_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participation_request" ADD CONSTRAINT "participation_request_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participation_request" ADD CONSTRAINT "participation_request_poll_id_poll_id_fk" FOREIGN KEY ("poll_id") REFERENCES "public"."poll"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participation_request" ADD CONSTRAINT "participation_request_reviewed_by_user_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidate" ADD CONSTRAINT "candidate_poll_id_poll_id_fk" FOREIGN KEY ("poll_id") REFERENCES "public"."poll"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poll" ADD CONSTRAINT "poll_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "device_session" ADD CONSTRAINT "device_session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "otp_record" ADD CONSTRAINT "otp_record_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "secret_question" ADD CONSTRAINT "secret_question_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vote" ADD CONSTRAINT "vote_poll_id_poll_id_fk" FOREIGN KEY ("poll_id") REFERENCES "public"."poll"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vote" ADD CONSTRAINT "vote_candidate_id_candidate_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidate"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vote_token" ADD CONSTRAINT "vote_token_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vote_token" ADD CONSTRAINT "vote_token_poll_id_poll_id_fk" FOREIGN KEY ("poll_id") REFERENCES "public"."poll"("id") ON DELETE cascade ON UPDATE no action;