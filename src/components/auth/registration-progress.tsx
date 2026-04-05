import { cn } from "@/lib/utils";
import { REGISTER_STEPS } from "@/lib/constants";
import { Check } from "lucide-react";

interface RegistrationProgressProps {
  currentStep: number; // 1–4
}

/**
 * Step progress indicator matching image 3.
 * Shows numbered dots: 1 Details → 2 OTP → 3 Face → 4 Done
 */
export function RegistrationProgress({ currentStep }: RegistrationProgressProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        Registration Progress
      </p>

      <div className="flex items-center gap-0">
        {REGISTER_STEPS.map((s, i) => {
          const done    = currentStep > s.step;
          const active  = currentStep === s.step;
          const isLast  = i === REGISTER_STEPS.length - 1;

          return (
            <div key={s.step} className="flex items-center">
              {/* Dot */}
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold transition-all",
                    done
                      ? "border-primary bg-primary text-primary-foreground"
                      : active
                        ? "border-primary bg-primary/20 text-primary"
                        : "border-border bg-card text-muted-foreground",
                  )}
                >
                  {done ? <Check className="h-3.5 w-3.5" /> : s.step}
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {s.label}
                </span>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div
                  className={cn(
                    "mx-1 mb-4 h-px w-10 transition-all",
                    done ? "bg-primary" : "bg-border",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}