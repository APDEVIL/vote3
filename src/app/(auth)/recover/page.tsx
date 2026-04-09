import type { Metadata } from "next"; // <-- Added "type" here
import { RecoverForm } from "@/components/auth/recover-form";

export const metadata: Metadata = {
  title: "Recover Account - VoteSecure",
  description: "Reset your password to access your VoteSecure account.",
};

export default function RecoverPage() {
  return (
    <div className="flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Reset Password
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your email or Voter ID and we'll send you a link to reset your password.
        </p>
      </div>
      <RecoverForm />
    </div>
  );
}