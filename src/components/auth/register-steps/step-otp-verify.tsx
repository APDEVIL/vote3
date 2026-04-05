"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/trpc/react";
import { OTP_EXPIRY_MINUTES } from "@/lib/constants";

interface StepOtpVerifyProps {
  userId:     string;
  mobile:     string;
  email:      string;
  onNext:     () => void;
  onBack:     () => void;
}

/**
 * Step 2 — Verify mobile OTP + email OTP.
 * Both must be verified before proceeding.
 */
export function StepOtpVerify({ userId, mobile, email, onNext, onBack }: StepOtpVerifyProps) {
  const [mobileOtp, setMobileOtp] = useState("");
  const [emailOtp,  setEmailOtp]  = useState("");
  const [mobileVerified, setMobileVerified] = useState(false);
  const [emailVerified,  setEmailVerified]  = useState(false);

  const verifyMobile = api.auth.verifyMobileOtp.useMutation({
    onSuccess: () => {
      setMobileVerified(true);
      toast.success("Mobile number verified!");
    },
    onError: (e) => toast.error(e.message),
  });

  const verifyEmail = api.auth.verifyEmailOtp.useMutation({
    onSuccess: () => {
      setEmailVerified(true);
      toast.success("Email verified!");
    },
    onError: (e) => toast.error(e.message),
  });

  const resend = api.auth.resendOtp.useMutation({
    onSuccess: () => toast.success(`OTP resent. Valid for ${OTP_EXPIRY_MINUTES} minutes.`),
    onError: (e) => toast.error(e.message),
  });

  const canProceed = mobileVerified && emailVerified;

  return (
    <div className="flex flex-col gap-6">

      {/* Mobile OTP */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card/50 p-4">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Mobile OTP
          </Label>
          {mobileVerified && (
            <span className="text-xs font-semibold text-green-400">✓ Verified</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Sent to <span className="text-foreground">{mobile}</span>
        </p>
        <div className="flex gap-2">
          <Input
            value={mobileOtp}
            onChange={(e) => setMobileOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="6-digit OTP"
            maxLength={6}
            disabled={mobileVerified}
            className="border-border bg-input text-center text-lg font-bold tracking-[0.5em] text-foreground focus-visible:ring-primary"
          />
          <Button
            onClick={() => verifyMobile.mutate({ userId, code: mobileOtp })}
            disabled={mobileOtp.length < 6 || mobileVerified || verifyMobile.isPending}
            className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {verifyMobile.isPending ? "..." : "Verify"}
          </Button>
        </div>
        {!mobileVerified && (
          <button
            onClick={() => resend.mutate({ userId, type: "mobile_verify" })}
            disabled={resend.isPending}
            className="self-start text-xs text-muted-foreground underline-offset-2 hover:text-primary hover:underline"
          >
            Resend OTP
          </button>
        )}
      </div>

      {/* Email OTP */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card/50 p-4">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Email OTP
          </Label>
          {emailVerified && (
            <span className="text-xs font-semibold text-green-400">✓ Verified</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Sent to <span className="text-foreground">{email}</span>
        </p>
        <div className="flex gap-2">
          <Input
            value={emailOtp}
            onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="6-digit OTP"
            maxLength={6}
            disabled={emailVerified}
            className="border-border bg-input text-center text-lg font-bold tracking-[0.5em] text-foreground focus-visible:ring-primary"
          />
          <Button
            onClick={() => verifyEmail.mutate({ userId, code: emailOtp })}
            disabled={emailOtp.length < 6 || emailVerified || verifyEmail.isPending}
            className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {verifyEmail.isPending ? "..." : "Verify"}
          </Button>
        </div>
        {!emailVerified && (
          <button
            onClick={() => resend.mutate({ userId, type: "email_verify" })}
            disabled={resend.isPending}
            className="self-start text-xs text-muted-foreground underline-offset-2 hover:text-primary hover:underline"
          >
            Resend OTP
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="ghost"
          onClick={onBack}
          className="flex-1 text-muted-foreground hover:text-foreground"
        >
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!canProceed}
          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
        >
          Continue → Face Enroll
        </Button>
      </div>
    </div>
  );
}