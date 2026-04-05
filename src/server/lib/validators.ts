/**
 * lib/validators.ts
 *
 * Shared Zod schemas used across routers.
 *
 * Why keep these here instead of inside routers?
 *   - Reused across multiple routers (e.g. mobile validation in auth + user)
 *   - Single source of truth for field rules
 *   - Easy to update constraints in one place
 */

import { z } from "zod";

// ── Primitives ─────────────────────────────────────────────────────────────────

export const zId = z.string().min(1, "ID is required");

export const zMobile = z
  .string()
  .regex(/^\+?[1-9]\d{9,14}$/, "Enter a valid mobile number with country code (e.g. +919876543210)");

export const zPincode = z
  .string()
  .regex(/^\d{6}$/, "Pincode must be 6 digits");

export const zPassword = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password too long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

export const zOtpCode = z
  .string()
  .length(6, "OTP must be 6 digits")
  .regex(/^\d{6}$/, "OTP must contain only digits");

export const zVoterCardId = z
  .string()
  .regex(/^VC-[A-Z0-9]{4}-[A-Z0-9]{4}$/, "Invalid voter card ID format");

// ── Auth schemas ───────────────────────────────────────────────────────────────

export const zRegisterInput = z.object({
  name:     z.string().min(2, "Name must be at least 2 characters").max(100),
  email:    z.string().email("Enter a valid email address"),
  mobile:   zMobile,
  password: zPassword,
  address:  z.string().min(5, "Enter your full address").max(500),
  pincode:  zPincode,
});

export const zLoginInput = z.object({
  // Either mobile or voterCardId — union resolved in router
  identifier: z.string().min(1, "Enter your mobile number or voter card ID"),
  password:   z.string().min(1, "Password is required"),
});

export const zVerifyOtpInput = z.object({
  type: z.enum(["mobile_verify", "email_verify", "login", "password_reset"]),
  code: zOtpCode,
});

export const zSecretQuestionsInput = z.object({
  questions: z
    .array(
      z.object({
        question: z.string().min(5, "Question too short").max(200),
        answer:   z.string().min(1, "Answer is required").max(200),
      }),
    )
    .length(3, "Exactly 3 secret questions are required"),
});

export const zSecretAnswersInput = z.object({
  answers: z
    .array(z.string().min(1, "Answer is required"))
    .length(3, "All 3 answers are required"),
});

// ── Profile schemas ────────────────────────────────────────────────────────────

export const zUpdateProfileInput = z.object({
  name:    z.string().min(2).max(100).optional(),
  address: z.string().min(5).max(500).optional(),
  pincode: zPincode.optional(),
});

// ── Poll schemas ───────────────────────────────────────────────────────────────

export const zCreatePollInput = z.object({
  title:       z.string().min(3, "Poll title is required").max(200),
  description: z.string().max(1000).optional(),
  startTime:   z.date().min(new Date(), "Start time must be in the future"),
  endTime:     z.date(),
}).refine(
  (d) => d.endTime > d.startTime,
  { message: "End time must be after start time", path: ["endTime"] },
);

export const zAddCandidateInput = z.object({
  pollId:      zId,
  name:        z.string().min(2, "Candidate name is required").max(200),
  description: z.string().max(500).optional(),
  order:       z.number().int().min(0).optional(),
});

export const zUpdatePollStatusInput = z.object({
  pollId:    zId,
  newStatus: z.enum(["active", "ended", "result_available"]),
});

// ── Vote schemas ───────────────────────────────────────────────────────────────

export const zCastVoteInput = z.object({
  pollId:      zId,
  candidateId: zId,
});

// ── Participation schemas ──────────────────────────────────────────────────────

export const zSubmitParticipationInput = z.object({
  pollId:      zId,
  voterCardId: zVoterCardId,
  address:     z.string().min(5).max(500),
  pincode:     zPincode,
});

export const zReviewRequestInput = z.object({
  requestId:       zId,
  decision:        z.enum(["approved", "rejected"]),
  rejectionReason: z.string().max(500).optional(),
});

// ── Pagination ─────────────────────────────────────────────────────────────────

export const zPaginationInput = z.object({
  page:  z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export type RegisterInput            = z.infer<typeof zRegisterInput>;
export type LoginInput               = z.infer<typeof zLoginInput>;
export type UpdateProfileInput       = z.infer<typeof zUpdateProfileInput>; // Added this
export type CreatePollInput          = z.infer<typeof zCreatePollInput>;
export type CastVoteInput            = z.infer<typeof zCastVoteInput>;
export type SubmitParticipationInput = z.infer<typeof zSubmitParticipationInput>;
export type ReviewRequestInput       = z.infer<typeof zReviewRequestInput>;