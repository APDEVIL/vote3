const STEPS = [
  {
    number: "01",
    title:  "Register & Verify",
    desc:   "Create your account with mobile OTP, email verification, and face recognition enrollment.",
  },
  {
    number: "02",
    title:  "Get Approved",
    desc:   "Submit your voter card ID for admin verification. Approval grants you access to specific polls.",
  },
  {
    number: "03",
    title:  "Cast Your Vote",
    desc:   "Vote anonymously within the election window. Your choice is never linked to your identity.",
  },
  {
    number: "04",
    title:  "View Results",
    desc:   "Results are published after the poll closes. Fully auditable, completely tamper-proof.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative px-6 py-24">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-14 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
            How It Works
          </p>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            Four steps to your{" "}
            <span className="text-glow-cyan">secure vote</span>
          </h2>
        </div>

        {/* Steps */}
        <div className="relative grid grid-cols-1 gap-6 md:grid-cols-4">
          {/* Connector line on desktop */}
          <div className="absolute top-8 left-[12.5%] right-[12.5%] hidden h-px bg-gradient-to-r from-transparent via-border to-transparent md:block" />

          {STEPS.map((step) => (
            <div key={step.number} className="relative flex flex-col items-center gap-4 text-center">
              {/* Number bubble */}
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-primary/40 bg-primary/10">
                <span className="text-lg font-bold text-primary">{step.number}</span>
              </div>
              <h3 className="text-sm font-semibold text-foreground">{step.title}</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}