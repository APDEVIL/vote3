"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { zUpdateProfileInput, type UpdateProfileInput } from "@/server/lib/validators";

export function ProfileForm() {
  const { data: profile, isLoading } = api.user.getProfile.useQuery();
  const utils = api.useUtils();

  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(zUpdateProfileInput),
    defaultValues: { name: "", address: "", pincode: "" },
  });

  // Populate form when profile loads
  useEffect(() => {
    if (profile) {
      form.reset({
        name:    profile.name ?? "",
        address: profile.address ?? "",
        pincode: profile.pincode ?? "",
      });
    }
  }, [profile, form]);

  const mutation = api.user.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile updated!");
      void utils.user.getProfile.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-xl bg-muted/30" />
        ))}
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((d) => mutation.mutate(d))}
        className="flex flex-col gap-5"
      >
        {/* Email — read-only */}
        <div className="flex flex-col gap-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Email Address
          </p>
          <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2">
            <span className="text-sm text-muted-foreground">{profile?.email}</span>
            {profile?.emailVerified && (
              <span className="ml-auto text-xs font-semibold text-green-400">✓ Verified</span>
            )}
          </div>
        </div>

        {/* Mobile — read-only */}
        <div className="flex flex-col gap-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Mobile Number
          </p>
          <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2">
            <span className="text-sm text-muted-foreground">{profile?.mobile ?? "—"}</span>
            {profile?.mobileVerified && (
              <span className="ml-auto text-xs font-semibold text-green-400">✓ Verified</span>
            )}
          </div>
        </div>

        {/* Editable fields */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Full Name
              </FormLabel>
              <FormControl>
                <Input
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
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Address
              </FormLabel>
              <FormControl>
                <Input
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
          className="bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
        >
          {mutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </Form>
  );
}