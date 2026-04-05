/**
 * notification.service.ts
 *
 * Dispatches SMS and email notifications, logs every attempt to notificationLog.
 */

import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import type * as schema from "@/server/db/schema";
import { notificationLog } from "@/server/db/schema";
import type { NotificationType } from "@/server/db/schema";
import { generateId } from "@/server/lib/ids";

// ── Email via Resend ───────────────────────────────────────────────────────────

export async function sendEmail(
  db: PostgresJsDatabase<typeof schema>,
  opts: {
    to: string;
    subject: string;
    html: string;
    userId?: string;
    type: NotificationType;
  },
): Promise<void> {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM ?? "noreply@yourdomain.com",
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
      }),
    });

    const body = (await res.json()) as { id?: string; message?: string };

    // Generate unique ID at the moment of insertion
    await db.insert(notificationLog).values({
      id: generateId(), 
      userId: opts.userId ?? null,
      type: opts.type,
      status: res.ok ? "sent" : "failed",
      recipient: opts.to,
      providerResponse: JSON.stringify(body),
      sentAt: res.ok ? new Date() : null,
      createdAt: new Date(),
    });

    // MODIFIED: We no longer throw an error if the email fails.
    // This prevents localhost domain verification issues from crashing the app.
    if (!res.ok) {
      console.warn(`📧 Email not sent (Normal for localhost/unverified): ${body.message ?? "unknown"}`);
    }
  } catch (err) {
    // Generate a fresh unique ID for the failure log
    await db.insert(notificationLog).values({
      id: generateId(),
      userId: opts.userId ?? null,
      type: opts.type,
      status: "failed",
      recipient: opts.to,
      providerResponse: String(err),
      sentAt: null,
      createdAt: new Date(),
    });
    // MODIFIED: Do not throw error here, let registration proceed.
    console.error("❌ Email service error:", err);
  }
}

// ── SMS ────────────────────────────────────────────────────────────────────────

export async function sendSms(
  db: PostgresJsDatabase<typeof schema>,
  opts: {
    to: string;       // mobile number with country code e.g. +919876543210
    message: string;
    userId?: string;
    type: NotificationType;
  },
): Promise<void> {
  const provider = process.env.SMS_PROVIDER ?? "console";

  if (provider === "console" || process.env.NODE_ENV === "development") {
    await _sendSmsConsole(db, opts);
  } else if (provider === "fast2sms") {
    await _sendSmsFast2Sms(db, opts);
  } else if (provider === "twilio") {
    await _sendSmsTwilio(db, opts);
  } else {
    console.warn(`Unknown SMS_PROVIDER "${provider}", falling back to console`);
    await _sendSmsConsole(db, opts);
  }
}

// ── SMS providers ──────────────────────────────────────────────────────────────

async function _sendSmsConsole(
  db: PostgresJsDatabase<typeof schema>,
  opts: { to: string; message: string; userId?: string; type: NotificationType },
) {
  console.log(`\n📱 [SMS CONSOLE] To: ${opts.to}`);
  console.log(`   Message: ${opts.message}\n`);

  await db.insert(notificationLog).values({
    id: generateId(),
    userId: opts.userId ?? null,
    type: opts.type,
    status: "sent",
    recipient: opts.to,
    providerResponse: "console (dev stub)",
    sentAt: new Date(),
    createdAt: new Date(),
  });
}

async function _sendSmsFast2Sms(
  db: PostgresJsDatabase<typeof schema>,
  opts: { to: string; message: string; userId?: string; type: NotificationType },
) {
  try {
    const res = await fetch("https://www.fast2sms.com/dev/bulkV2", {
      method: "POST",
      headers: {
        authorization: process.env.FAST2SMS_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        route: "q",
        message: opts.message,
        language: "english",
        flash: 0,
        numbers: opts.to.replace("+91", ""),
      }),
    });

    const body = (await res.json()) as { return: boolean; message: string[] };

    await db.insert(notificationLog).values({
      id: generateId(),
      userId: opts.userId ?? null,
      type: opts.type,
      status: body.return ? "sent" : "failed",
      recipient: opts.to,
      providerResponse: JSON.stringify(body),
      sentAt: body.return ? new Date() : null,
      createdAt: new Date(),
    });

    if (!body.return) throw new Error(`Fast2SMS error: ${body.message.join(", ")}`);
  } catch (err) {
    await db.insert(notificationLog).values({
      id: generateId(),
      userId: opts.userId ?? null,
      type: opts.type,
      status: "failed",
      recipient: opts.to,
      providerResponse: String(err),
      sentAt: null,
      createdAt: new Date(),
    });
    throw err;
  }
}

async function _sendSmsTwilio(
  db: PostgresJsDatabase<typeof schema>,
  opts: { to: string; message: string; userId?: string; type: NotificationType },
) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID!;
  const authToken = process.env.TWILIO_AUTH_TOKEN!;

  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          From: process.env.TWILIO_PHONE_NUMBER!,
          To: opts.to,
          Body: opts.message,
        }),
      },
    );

    const body = (await res.json()) as { sid?: string; message?: string };

    await db.insert(notificationLog).values({
      id: generateId(),
      userId: opts.userId ?? null,
      type: opts.type,
      status: res.ok ? "sent" : "failed",
      recipient: opts.to,
      providerResponse: JSON.stringify(body),
      sentAt: res.ok ? new Date() : null,
      createdAt: new Date(),
    });

    if (!res.ok) throw new Error(`Twilio error: ${body.message ?? "unknown"}`);
  } catch (err) {
    await db.insert(notificationLog).values({
      id: generateId(),
      userId: opts.userId ?? null,
      type: opts.type,
      status: "failed",
      recipient: opts.to,
      providerResponse: String(err),
      sentAt: null,
      createdAt: new Date(),
    });
    throw err;
  }
}

// ── Convenience wrappers ───────────────────────────────────────────────────────

export async function sendOtpSms(
  db: PostgresJsDatabase<typeof schema>,
  userId: string,
  mobile: string,
  otp: string,
) {
  await sendSms(db, {
    to: mobile,
    message: `Your VotePoll OTP is ${otp}. Valid for 10 minutes. Do not share this with anyone.`,
    userId,
    type: "otp_sms",
  });
}

export async function sendOtpEmail(
  db: PostgresJsDatabase<typeof schema>,
  userId: string,
  email: string,
  otp: string,
) {
  await sendEmail(db, {
    to: email,
    subject: "Your VotePoll OTP",
    html: `
      <p>Your OTP is: <strong style="font-size:24px;letter-spacing:4px">${otp}</strong></p>
      <p>Valid for 10 minutes. Do not share this with anyone.</p>
    `,
    userId,
    type: "otp_email",
  });
}

export async function sendParticipationDecision(
  db: PostgresJsDatabase<typeof schema>,
  userId: string,
  email: string,
  pollTitle: string,
  approved: boolean,
  reason?: string,
) {
  await sendEmail(db, {
    to: email,
    subject: `VotePoll — Participation request ${approved ? "approved" : "rejected"}`,
    html: approved
      ? `<p>Your participation request for <strong>${pollTitle}</strong> has been <strong>approved</strong>. You can now cast your vote.</p>`
      : `<p>Your participation request for <strong>${pollTitle}</strong> was <strong>rejected</strong>.</p>${reason ? `<p>Reason: ${reason}</p>` : ""}`,
    userId,
    type: approved ? "approval" : "rejection",
  });
}