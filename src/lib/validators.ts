/**
 * lib/validators.ts  (client-side)
 *
 * Mirrors src/server/lib/validators.ts for use in react-hook-form.
 * Keep these in sync with the server schemas.
 *
 * Import in form components:
 *   import { zRegisterInput } from "@/lib/validators";
 */

export {
  zRegisterInput,
  zLoginInput,
  zVerifyOtpInput,
  zSecretQuestionsInput,
  zSecretAnswersInput,
  zUpdateProfileInput,
  zCreatePollInput,
  zAddCandidateInput,
  zCastVoteInput,
  zSubmitParticipationInput,
  zReviewRequestInput,
  zMobile,
  zPincode,
  zPassword,
  zOtpCode,
  zVoterCardId,
} from "@/server/lib/validators";

export type {
  RegisterInput,
  LoginInput,
  CreatePollInput,
  CastVoteInput,
  SubmitParticipationInput,
  ReviewRequestInput,
} from "@/server/lib/validators";