"use client";

import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { RegistrationProgress } from "./registration-progress";
import { StepPersonalDetails } from "./register-steps/step-personal-details";
import { StepOtpVerify } from "./register-steps/step-otp-verify";
import { StepFaceEnroll } from "./register-steps/step-face-enroll";
import { StepSecretQuestions } from "./register-steps/step-secret-question";
import { StepComplete } from "./register-steps/step-complete";
import type { RegisterInput } from "@/lib/validators";

/**
 * Multi-step registration form orchestrator.
 * Manages step state and passes data between steps.
 */
export function RegisterForm() {
  const [step, setStep] = useState(1);

  // Persisted across steps
  const [userId,      setUserId]      = useState("");
  const [voterCardId, setVoterCardId] = useState("");
  const [formData,    setFormData]    = useState<Partial<RegisterInput>>({});

  const registerMutation = api.auth.register.useMutation({
    onSuccess: (data) => {
      setUserId(data.userId);
      setVoterCardId(data.voterCardId);
      setStep(2);
    },
    onError: (e) => toast.error(e.message),
  });

  function handleDetailsSubmit(data: RegisterInput) {
    setFormData(data);
    registerMutation.mutate(data);
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Progress indicator */}
      <RegistrationProgress currentStep={step} />

      {/* Step panels */}
      <div className="min-h-0">
        {step === 1 && (
          <StepPersonalDetails
            defaultValues={formData}
            onNext={handleDetailsSubmit}
            isLoading={registerMutation.isPending}
          />
        )}

        {step === 2 && (
          <StepOtpVerify
            userId={userId}
            mobile={formData.mobile ?? ""}
            email={formData.email ?? ""}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && (
          <StepFaceEnroll
            userId={userId} // Passing the persisted userId here
            onNext={() => setStep(4)}
            onBack={() => setStep(2)}
          />
        )}

        {step === 4 && (
          <StepSecretQuestions
            userId={userId} // FIXED: Now passing the actual userId instead of ""
            onNext={() => setStep(5)}
            onBack={() => setStep(3)}
          />
        )}

        {step === 5 && (
          <StepComplete
            voterCardId={voterCardId}
            name={formData.name ?? ""}
          />
        )}
      </div>
    </div>
  );
}