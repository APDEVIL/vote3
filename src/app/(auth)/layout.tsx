import Link from "next/link";
import { ShieldCheck, Vote, Lock, Users } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

const TRUST_ITEMS = [
  { icon: ShieldCheck, label: "Aadhaar biometric verification" },
  { icon: Lock,        label: "AES-256 encrypted ballot" },
  { icon: Vote,        label: "Immutable blockchain record" },
  { icon: Users,       label: "One person, one verified vote" },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Left panel — branding + trust items (image 3 left side) */}
      <div className="hidden w-[420px] shrink-0 flex-col justify-between border-r border-border bg-card/50 p-10 lg:flex">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <span className="text-base font-bold tracking-tight text-foreground">{APP_NAME}</span>
        </Link>

        {/* Center content */}
        <div className="flex flex-col gap-8">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
              Secure Registration
            </p>
            <h1 className="text-3xl font-extrabold leading-tight text-foreground">
              Join the Future<br />of Democracy
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Create your verified voter account and participate in secure,
              transparent elections powered by blockchain.
            </p>
          </div>

          {/* Trust items */}
          <div className="flex flex-col gap-3">
            {TRUST_ITEMS.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-xl border border-border bg-card/50 px-4 py-3"
              >
                <Icon className="h-4 w-4 shrink-0 text-primary" />
                <span className="text-sm text-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom registration progress placeholder */}
        <div className="rounded-xl border border-border bg-card/50 p-4">
          <p className="mb-3 text-center text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Registration Progress
          </p>
          <div className="flex justify-center gap-2">
            {["Details", "OTP", "Face", "Done"].map((label, i) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <div className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold ${
                  i === 0
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground"
                }`}>
                  {i + 1}
                </div>
                <span className="text-[9px] text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-start justify-center overflow-y-auto px-6 py-12 md:py-16">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}