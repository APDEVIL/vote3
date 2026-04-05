"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { zCreatePollInput, type CreatePollInput } from "@/lib/validators";

export function PollForm() {
  const router = useRouter();

  const form = useForm<CreatePollInput>({
    resolver: zodResolver(zCreatePollInput),
    defaultValues: { title: "", description: "" },
  });

  const mutation = api.admin.createPoll.useMutation({
    onSuccess: ({ pollId }) => {
      toast.success("Poll created!");
      router.push(`/admin/elections/${pollId}`);
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((d) => mutation.mutate(d))}
        className="flex flex-col gap-5"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Poll Title
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="National Student Council 2026"
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Description (optional)
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Brief description of the poll"
                  className="border-border bg-input text-foreground focus-visible:ring-primary"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs text-red-400" />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Start Time
                </FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    className="border-border bg-input text-foreground focus-visible:ring-primary"
                    onChange={(e) => field.onChange(new Date(e.target.value))}
                  />
                </FormControl>
                <FormMessage className="text-xs text-red-400" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  End Time
                </FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    className="border-border bg-input text-foreground focus-visible:ring-primary"
                    onChange={(e) => field.onChange(new Date(e.target.value))}
                  />
                </FormControl>
                <FormMessage className="text-xs text-red-400" />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          disabled={mutation.isPending}
          className="w-full bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
        >
          {mutation.isPending ? "Creating..." : "Create Poll"}
        </Button>
      </form>
    </Form>
  );
}