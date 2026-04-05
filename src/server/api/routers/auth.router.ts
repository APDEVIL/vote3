/**
 * routers/auth.router.ts
 *
 * Epics covered:
 * 1.1 Register account          1.2 Verify mobile OTP
 * 1.3 Verify email              1.4 Set secret questions
 * 1.5 Enroll face recognition   2.6 Account recovery
 */

import { eq } from "drizzle-orm";
import { z } from "zod";
import { hashPassword } from "better-auth/crypto"; // Added Better Auth hashing utility

import { account, otpRecord, secretQuestion, user } from "@/server/db/schema";
import {
  duplicateMobileError,
  otpInvalidError,
  userNotFoundError,
  validationError,
} from "@/server/lib/errors";
import { generateId } from "@/server/lib/ids";
import { hashSecret, verifySecret } from "@/server/lib/crypto";
import {
  zRegisterInput,
  zVerifyOtpInput,
  zSecretQuestionsInput,
  zSecretAnswersInput,
  zOtpCode,
} from "@/server/lib/validators";
import { checkDuplicateMobile } from "@/server/services/fraud-detection.service";
import { generateOtp, verifyOtp } from "@/server/services/otp.service";
import { enrollFace } from "@/server/services/face.service";
import { generateVoterCardId } from "@/server/services/voter-id.service";
import {
  sendOtpSms,
  sendOtpEmail,
} from "@/server/services/notification.service";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const authRouter = createTRPCRouter({

  // ── 1.1 Register ──────────────────────────────────────────────────────────

  register: publicProcedure
    .input(zRegisterInput)
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;

      // Check duplicate mobile (SRS §3.2)
      await checkDuplicateMobile(db, input.mobile);

      // Check duplicate email
      const existingEmail = await db.query.user.findFirst({
        where: eq(user.email, input.email),
        columns: { id: true },
      });
      if (existingEmail) throw validationError("An account with this email already exists.");

      const userId = generateId("usr");
      const voterCardId = await generateVoterCardId(db);

      // Insert user
      await db.insert(user).values({
        id: userId,
        name: input.name,
        email: input.email,
        mobile: input.mobile,
        address: input.address,
        pincode: input.pincode,
        voterCardId,
        role: "voter",
        emailVerified: false,
        mobileVerified: false,
        secretQuestionsSet: false,
        faceEnrolled: false,
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // MODIFIED: Using hashPassword from better-auth/crypto to ensure compatibility
      const passwordHash = await hashPassword(input.password);

      await db.insert(account).values({
        id: generateId(),
        accountId: userId,
        providerId: "credential",
        userId,
        password: passwordHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Send mobile OTP
      const mobileOtp = await generateOtp(db, userId, "mobile_verify", input.mobile);
      await sendOtpSms(db, userId, input.mobile, mobileOtp);

      // Send email OTP
      const emailOtp = await generateOtp(db, userId, "email_verify", input.email);
      await sendOtpEmail(db, userId, input.email, emailOtp);

      return { userId, voterCardId, message: "OTPs sent to mobile and email." };
    }),

  // ── 1.2 Verify mobile OTP ─────────────────────────────────────────────────

  verifyMobileOtp: publicProcedure
    .input(z.object({ userId: z.string(), code: zOtpCode }))
    .mutation(async ({ ctx, input }) => {
      await verifyOtp(ctx.db, input.userId, "mobile_verify", input.code);
      await ctx.db
        .update(user)
        .set({ mobileVerified: true, updatedAt: new Date() })
        .where(eq(user.id, input.userId));
      return { success: true };
    }),

  // ── 1.3 Verify email OTP ──────────────────────────────────────────────────

  verifyEmailOtp: publicProcedure
    .input(z.object({ userId: z.string(), code: zOtpCode }))
    .mutation(async ({ ctx, input }) => {
      await verifyOtp(ctx.db, input.userId, "email_verify", input.code);
      await ctx.db
        .update(user)
        .set({ emailVerified: true, updatedAt: new Date() })
        .where(eq(user.id, input.userId));
      return { success: true };
    }),

 // ── 1.4 Set secret questions ──────────────────────────────────────────────

  setSecretQuestions: publicProcedure 
    .input(zSecretQuestionsInput.extend({ userId: z.string() })) 
    .mutation(async ({ ctx, input }) => {
      const userId = input.userId;

      // Delete any existing secret questions first (re-setup)
      await ctx.db
        .delete(secretQuestion)
        .where(eq(secretQuestion.userId, userId));

      // Insert 3 hashed questions
      for (let i = 0; i < input.questions.length; i++) {
        const q = input.questions[i]!;
        const answerHash = await hashSecret(q.answer);
        await ctx.db.insert(secretQuestion).values({
          id: generateId(),
          userId,
          questionIndex: i + 1,
          question: q.question,
          answerHash,
          createdAt: new Date(),
        });
      }

      await ctx.db
        .update(user)
        .set({ secretQuestionsSet: true, updatedAt: new Date() })
        .where(eq(user.id, userId));

      return { success: true };
    }),

  // ── 1.5 Enroll face ───────────────────────────────────────────────────────

  enrollFace: publicProcedure 
    .input(z.object({ 
      userId: z.string(), 
      imageData: z.string().optional() 
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = input.userId;

      const result = await enrollFace(userId, input.imageData);
      if (!result.success) throw validationError(result.message);

      await ctx.db
        .update(user)
        .set({
          faceEnrolled: true,
          faceReferenceId: result.faceReferenceId,
          updatedAt: new Date(),
        })
        .where(eq(user.id, userId));

      return { success: true, faceReferenceId: result.faceReferenceId };
    }),

  // ── 2.6 Account recovery — get secret questions ───────────────────────────

  getSecretQuestions: publicProcedure
    .input(z.object({ identifier: z.string() }))
    .query(async ({ ctx, input }) => {
      const found = await ctx.db.query.user.findFirst({
        where: (u, { or, eq }) =>
          or(eq(u.email, input.identifier), eq(u.mobile, input.identifier)),
        columns: { id: true },
        with: { secretQuestions: { columns: { question: true, questionIndex: true } } },
      });

      if (!found) throw userNotFoundError();
      return { userId: found.id, questions: (found as any).secretQuestions };
    }),

  // ── 2.6 Account recovery — verify answers ─────────────────────────────────

  verifySecretAnswers: publicProcedure
    .input(zSecretAnswersInput.extend({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const questions = await ctx.db.query.secretQuestion.findMany({
        where: eq(secretQuestion.userId, input.userId),
        orderBy: (q, { asc }) => [asc(q.questionIndex)],
      });

      if (questions.length !== 3) throw validationError("Secret questions not set up.");

      for (let i = 0; i < questions.length; i++) {
        const ok = await verifySecret(input.answers[i] ?? "", questions[i]!.answerHash);
        if (!ok) throw otpInvalidError();
      }

      const found = await ctx.db.query.user.findFirst({
        where: eq(user.id, input.userId),
        columns: { email: true },
      });
      if (!found) throw userNotFoundError();

      const otp = await generateOtp(ctx.db, input.userId, "password_reset", found.email);
      await sendOtpEmail(ctx.db, input.userId, found.email, otp);

      return { success: true, message: "OTP sent to your registered email." };
    }),

  // ── Resend OTP ────────────────────────────────────────────────────────────

  resendOtp: publicProcedure
    .input(z.object({
      userId: z.string(),
      type: z.enum(["mobile_verify", "email_verify", "login", "password_reset"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const found = await ctx.db.query.user.findFirst({
        where: eq(user.id, input.userId),
        columns: { email: true, mobile: true },
      });
      if (!found) throw userNotFoundError();

      if (input.type === "mobile_verify" && found.mobile) {
        const otp = await generateOtp(ctx.db, input.userId, input.type, found.mobile);
        await sendOtpSms(ctx.db, input.userId, found.mobile, otp);
      } else if (found.email) {
        const otp = await generateOtp(ctx.db, input.userId, input.type, found.email);
        await sendOtpEmail(ctx.db, input.userId, found.email, otp);
      }

      return { success: true };
    }),
});