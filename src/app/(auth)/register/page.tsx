import { RegisterForm } from "@/components/auth/register-form";
import { ShieldCheck } from "lucide-react";

export const metadata = { title: "Register — VoteSecure" };

export default function RegisterPage() {
  return (
    <div className="flex flex-col gap-8">
      {/* Mobile header */}
      <div className="lg:hidden">
        <div className="mb-2 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <span className="text-sm font-bold text-foreground">VoteSecure</span>
        </div>
        <h2 className="text-2xl font-bold text-foreground">Create your account</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Join the future of secure digital voting
        </p>
      </div>

      {/* Step 1 heading — desktop */}
      <div className="hidden lg:block">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          Step 1 of 4
        </p>
        <h2 className="mt-1 text-2xl font-bold text-foreground">Personal Details</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Fill in your basic information to get started
        </p>
      </div>

      <RegisterForm />
    </div>
  );
}