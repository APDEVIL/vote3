"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { zRegisterInput, type RegisterInput } from "@/lib/validators";

interface StepPersonalDetailsProps {
  defaultValues?: Partial<RegisterInput>;
  onNext: (data: RegisterInput) => void;
  isLoading?: boolean;
}

/**
 * Step 1 — Personal details form.
 * Matches image 3 exactly: Full Name, Email, Mobile, Password.
 */
export function StepPersonalDetails({
  defaultValues,
  onNext,
  isLoading = false,
}: StepPersonalDetailsProps) {
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(zRegisterInput),
    defaultValues: {
      name:     "",
      email:    "",
      mobile:   "",
      password: "",
      address:  "",
      pincode:  "",
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onNext)} className="flex flex-col gap-5">

        {/* Full name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Full Name <span className="text-red-400">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Amit Kumar"
                  className="border-border bg-input text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs text-red-400" />
            </FormItem>
          )}
        />

        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Email Address <span className="text-red-400">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  className="border-border bg-input text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs text-red-400" />
            </FormItem>
          )}
        />

        {/* Mobile */}
        <FormField
          control={form.control}
          name="mobile"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Mobile Number <span className="text-red-400">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  placeholder="+919876543210"
                  className="border-border bg-input text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs text-red-400" />
            </FormItem>
          )}
        />

        {/* Password */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Password <span className="text-red-400">*</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 8 characters"
                    className="border-border bg-input pr-10 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </FormControl>
              <FormMessage className="text-xs text-red-400" />
            </FormItem>
          )}
        />

        {/* Address */}
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Address <span className="text-red-400">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="123 Main St, City"
                  className="border-border bg-input text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs text-red-400" />
            </FormItem>
          )}
        />

        {/* Pincode */}
        <FormField
          control={form.control}
          name="pincode"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Pincode <span className="text-red-400">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="560001"
                  maxLength={6}
                  className="border-border bg-input text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs text-red-400" />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isLoading}
          className="mt-2 w-full bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
        >
          {isLoading ? "Creating account..." : "Continue → Verify OTP"}
        </Button>
      </form>
    </Form>
  );
}