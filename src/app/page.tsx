import { LandingNavbar } from "@/components/landing/landing-navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesGrid } from "@/components/landing/features-grid";
import { HowItWorks } from "@/components/landing/how-it-works";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      <LandingNavbar />
      <HeroSection />
      <FeaturesGrid />
      <HowItWorks />

      {/* Footer CTA */}
      <section className="border-t border-border px-6 py-20 text-center">
        <h2 className="text-3xl font-extrabold text-foreground">
          Ready to vote <span className="text-glow-cyan">securely</span>?
        </h2>
        <p className="mt-4 text-muted-foreground">
          Join thousands of verified voters on the platform.
        </p>
        <Button
          asChild
          size="lg"
          className="mt-8 bg-primary px-10 font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <Link href="/register">Create Your Account →</Link>
        </Button>
      </section>

      <footer className="border-t border-border px-8 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} VoteSecure. All votes are anonymous and encrypted.
      </footer>
    </main>
  );
}