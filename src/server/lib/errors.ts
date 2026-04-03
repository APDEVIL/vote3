/**
 * lib/errors.ts
 *
 * Typed TRPCError factories.
 *
 * Why use these instead of throwing TRPCError directly?
 *   - Consistent error messages across all routers
 *   - Single place to change wording
 *   - Autocomplete on error types
 *   - Easier to find all places a specific error is thrown
 *
 * Usage in routers:
 *   throw alreadyVotedError();
 *   throw pollNotActiveError();
 *   throw unauthorizedError("You must be logged in");
 */

import { TRPCError } from "@trpc/server";

// ── Auth errors ────────────────────────────────────────────────────────────────

export function unauthorizedError(message = "You must be logged in to do this") {
  return new TRPCError({ code: "UNAUTHORIZED", message });
}

export function forbiddenError(message = "You do not have permission to do this") {
  return new TRPCError({ code: "FORBIDDEN", message });
}

export function adminOnlyError() {
  return new TRPCError({
    code: "FORBIDDEN",
    message: "This action is restricted to admins only",
  });
}

// ── User / registration errors ─────────────────────────────────────────────────

export function duplicateMobileError() {
  return new TRPCError({
    code: "CONFLICT",
    message: "This mobile number is already registered. Each mobile number can only be used once.",
  });
}

export function duplicateEmailError() {
  return new TRPCError({
    code: "CONFLICT",
    message: "An account with this email already exists.",
  });
}

export function duplicateFaceError() {
  return new TRPCError({
    code: "CONFLICT",
    message: "This face is already enrolled with another account.",
  });
}

export function userNotFoundError() {
  return new TRPCError({
    code: "NOT_FOUND",
    message: "User not found.",
  });
}

export function invalidCredentialsError() {
  return new TRPCError({
    code: "UNAUTHORIZED",
    message: "Invalid credentials. Please check and try again.",
  });
}

// ── OTP errors ─────────────────────────────────────────────────────────────────

export function otpExpiredError() {
  return new TRPCError({
    code: "BAD_REQUEST",
    message: "OTP has expired. Please request a new one.",
  });
}

export function otpInvalidError(attemptsRemaining?: number) {
  const suffix = attemptsRemaining !== undefined
    ? ` ${attemptsRemaining} attempt(s) remaining.`
    : "";
  return new TRPCError({
    code: "BAD_REQUEST",
    message: `Incorrect OTP.${suffix}`,
  });
}

export function otpRateLimitError(retryAfterMin: number) {
  return new TRPCError({
    code: "TOO_MANY_REQUESTS",
    message: `Too many OTP requests. Try again in ${retryAfterMin} minute(s).`,
  });
}

// ── Poll errors ────────────────────────────────────────────────────────────────

export function pollNotFoundError() {
  return new TRPCError({
    code: "NOT_FOUND",
    message: "Poll not found.",
  });
}

export function pollNotActiveError() {
  return new TRPCError({
    code: "BAD_REQUEST",
    message: "This poll is not currently active. Voting is only allowed during the active period.",
  });
}

export function pollResultsNotAvailableError() {
  return new TRPCError({
    code: "BAD_REQUEST",
    message: "Results are not available yet. They will be published after the poll ends.",
  });
}

export function invalidPollTransitionError(from: string, to: string) {
  return new TRPCError({
    code: "BAD_REQUEST",
    message: `Cannot transition poll from "${from}" to "${to}".`,
  });
}

// ── Vote errors ────────────────────────────────────────────────────────────────

export function alreadyVotedError() {
  return new TRPCError({
    code: "CONFLICT",
    message: "You have already voted in this poll. Each voter can only vote once.",
  });
}

export function notApprovedToVoteError() {
  return new TRPCError({
    code: "FORBIDDEN",
    message: "Your participation request for this poll has not been approved yet.",
  });
}

export function candidateNotFoundError() {
  return new TRPCError({
    code: "NOT_FOUND",
    message: "Candidate not found or does not belong to this poll.",
  });
}

// ── Participation errors ───────────────────────────────────────────────────────

export function participationRequestNotFoundError() {
  return new TRPCError({
    code: "NOT_FOUND",
    message: "Participation request not found.",
  });
}

export function alreadySubmittedRequestError() {
  return new TRPCError({
    code: "CONFLICT",
    message: "You have already submitted a participation request for this poll.",
  });
}

// ── Generic errors ─────────────────────────────────────────────────────────────

export function notFoundError(entity = "Resource") {
  return new TRPCError({
    code: "NOT_FOUND",
    message: `${entity} not found.`,
  });
}

export function internalError(message = "Something went wrong. Please try again.") {
  return new TRPCError({ code: "INTERNAL_SERVER_ERROR", message });
}

export function validationError(message: string) {
  return new TRPCError({ code: "BAD_REQUEST", message });
}