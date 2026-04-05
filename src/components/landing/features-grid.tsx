import { LANDING_FEATURES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function FeaturesGrid() {
  return (
    <section id="features" className="relative px-6 py-24">
      {/* Section header */}
      <div className="mb-14 text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
          Why VoteSecure
        </p>
        <h2 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
          Built for Trust.{" "}
          <span className="text-glow-cyan">Designed for Everyone.</span>
        </h2>
        <p className="mt-4 text-sm text-muted-foreground">
          Military-grade encryption meets intuitive design.
          Every vote counted accurately and anonymously.
        </p>
      </div>

      {/* 6-card grid — matches images 1+2 exactly */}
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {LANDING_FEATURES.slice(0, 4).map((feature, i) => (
          <FeatureCard key={i} {...feature} prominent />
        ))}
        {/* Bottom row — 2 cards centered */}
        <div className="sm:col-span-2 lg:col-span-2">
          <FeatureCard {...LANDING_FEATURES[4]!} />
        </div>
        <div className="sm:col-span-2 lg:col-span-2">
          <FeatureCard {...LANDING_FEATURES[5]!} />
        </div>
      </div>
    </section>
  );
}

interface FeatureCardProps {
  icon:        string;
  title:       string;
  description: string;
  prominent?:  boolean;
}

function FeatureCard({ icon, title, description, prominent }: FeatureCardProps) {
  return (
    <div
      className={cn(
        "card-hover flex flex-col gap-3 rounded-2xl border border-border bg-card p-6",
        prominent ? "h-full" : "",
      )}
    >
      <span className="text-3xl" role="img">{icon}</span>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}