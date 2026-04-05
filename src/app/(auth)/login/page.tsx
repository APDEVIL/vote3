import { LoginForm } from "@/components/auth/login-form";
import { ShieldCheck } from "lucide-react";

export const metadata = { title: "Sign In — VoteSecure" };

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <div className="mb-2 flex items-center gap-2 lg:hidden">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <span className="text-sm font-bold text-foreground">VoteSecure</span>
        </div>
        <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in with your email or Voter Card ID
        </p>
      </div>

      <LoginForm />
    </div>
  );
}