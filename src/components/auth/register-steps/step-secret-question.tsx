"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { Loader2 } from "lucide-react";

const PRESET_QUESTIONS = [
  "What was the name of your first pet?",
  "What is your mother's maiden name?",
  "What city were you born in?",
  "What was the name of your first school?",
  "What is your favourite childhood movie?",
];

const schema = z.object({
  questions: z.array(
    z.object({
      question: z.string().min(5),
      answer:   z.string().min(1, "Answer is required"),
    }),
  ).length(3),
});

type FormData = z.infer<typeof schema>;

interface StepSecretQuestionsProps {
  userId: string;
  onNext: () => void;
  onBack: () => void;
}

/** Step 4 — Set 3 secret questions for account recovery */
export function StepSecretQuestions({ userId, onNext, onBack }: StepSecretQuestionsProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      questions: [
        { question: PRESET_QUESTIONS[0]!, answer: "" },
        { question: PRESET_QUESTIONS[1]!, answer: "" },
        { question: PRESET_QUESTIONS[2]!, answer: "" },
      ],
    },
  });

  const mutation = api.auth.setSecretQuestions.useMutation({
    onSuccess: () => {
      toast.success("Secret questions saved!");
      onNext();
    },
    onError: (e) => toast.error(e.message),
  });

  // Handler for form submission
  const onSubmit = (data: FormData) => {
    mutation.mutate({
      userId, // Passing the prop userId
      questions: data.questions, // Passing the array of questions/answers
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-5"
      >
        <p className="text-sm text-muted-foreground">
          Set 3 secret questions used for account recovery. Answers are stored securely and used if you lose access to your account.
        </p>

        {[0, 1, 2].map((i) => (
          <div key={i} className="flex flex-col gap-3 rounded-xl border border-border bg-card/50 p-4 shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Question {i + 1}
            </p>

            {/* Question selection using standard select for simplicity or your UI preference */}
            <FormField
              control={form.control}
              name={`questions.${i}.question`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <select
                      {...field}
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    >
                      {PRESET_QUESTIONS.map((q) => (
                        <option key={q} value={q}>{q}</option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage className="text-xs text-red-400" />
                </FormItem>
              )}
            />

            {/* Answer input */}
            <FormField
              control={form.control}
              name={`questions.${i}.answer`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Your Secret Answer
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Type your answer..."
                      className="border-border bg-background text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-primary"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-400" />
                </FormItem>
              )}
            />
          </div>
        ))}

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            disabled={mutation.isPending}
            className="flex-1 text-muted-foreground hover:text-foreground"
          >
            Back
          </Button>
          <Button
            type="submit"
            disabled={mutation.isPending}
            className="flex-1 bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Complete Registration →"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}