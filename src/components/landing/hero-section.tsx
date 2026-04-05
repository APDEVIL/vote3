import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Zap } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
      {/* Background grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #ffffff 1px, transparent 1px),
            linear-gradient(to bottom, #ffffff 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
        }}
      />

      {/* Glow blob */}
      <div className="pointer-events-none absolute top-1/3 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />

      {/* Eyebrow */}
      <div className="relative mb-6 flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5">
        <ShieldCheck className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-semibold tracking-widest text-primary uppercase">
          Secure Digital Voting
        </span>
      </div>

      {/* Headline */}
      <h1 className="relative max-w-4xl text-5xl font-extrabold leading-tight tracking-tight text-foreground md:text-6xl lg:text-7xl">
        The Future of{" "}
        <span className="text-glow-cyan">Democracy</span>{" "}
        is Here.
      </h1>

      {/* Subheadline */}
      <p className="relative mt-6 max-w-xl text-base text-muted-foreground md:text-lg">
        Military-grade encryption meets intuitive design.
        Every vote counted accurately and anonymously.
      </p>

      {/* CTAs */}
      <div className="relative mt-10 flex flex-wrap items-center justify-center gap-4">
        <Button
          asChild
          size="lg"
          className="gap-2 bg-primary px-8 text-primary-foreground hover:bg-primary/90 font-semibold"
        >
          <Link href="/register">
            <Zap className="h-4 w-4" />
            Get Started — It's Free
          </Link>
        </Button>
        <Button
          asChild
          size="lg"
          variant="outline"
          className="border-border px-8 text-foreground hover:bg-white/5"
        >
          <Link href="/login">Sign In</Link>
        </Button>
      </div>

      {/* Trust indicators */}
      <div className="relative mt-16 flex flex-wrap items-center justify-center gap-8 text-xs text-muted-foreground">
        {[
          "AES-256 Encryption",
          "Zero-Knowledge Proofs",
          "100% Anonymous Votes",
          "Open Source Auditable",
        ].map((item) => (
          <div key={item} className="flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-primary" />
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}