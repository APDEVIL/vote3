"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { zSubmitParticipationInput, type SubmitParticipationInput } from "@/lib/validators";

interface RequestFormProps {
  pollId:   string;
  onSuccess?: () => void;
}

export function ParticipationRequestForm({ pollId, onSuccess }: RequestFormProps) {
  const { data: profile } = api.user.getProfile.useQuery();

  const form = useForm<SubmitParticipationInput>({
    resolver: zodResolver(zSubmitParticipationInput),
    defaultValues: {
      pollId,
      voterCardId: profile?.voterCardId ?? "",
      address:     profile?.address ?? "",
      pincode:     profile?.pincode ?? "",
    },
  });

  const mutation = api.participation.submit.useMutation({
    onSuccess: () => {
      toast.success("Participation request submitted. Awaiting admin approval.");
      onSuccess?.();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((d) => mutation.mutate(d))}
        className="flex flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="voterCardId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Voter Card ID
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="VC-XXXX-XXXX"
                  className="border-border bg-input font-mono text-foreground focus-visible:ring-primary"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs text-red-400" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Address
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Your registered address"
                  className="border-border bg-input text-foreground focus-visible:ring-primary"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs text-red-400" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="pincode"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Pincode
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="560001"
                  maxLength={6}
                  className="border-border bg-input text-foreground focus-visible:ring-primary"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs text-red-400" />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={mutation.isPending}
          className="w-full bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
        >
          {mutation.isPending ? "Submitting..." : "Submit Request"}
        </Button>
      </form>
    </Form>
  );
}