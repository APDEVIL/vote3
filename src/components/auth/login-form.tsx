"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authClient } from "@/server/better-auth/client";
import { zLoginInput, type LoginInput } from "@/lib/validators";

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading,    setIsLoading]    = useState(false);

  const form = useForm<LoginInput>({
    resolver: zodResolver(zLoginInput),
    defaultValues: { identifier: "", password: "" },
  });

  async function onSubmit(data: LoginInput) {
    setIsLoading(true);
    try {
      // better-auth email+password sign in
      // identifier can be email (voter card ID login handled server-side)
      const result = await authClient.signIn.email({
        email:    data.identifier,
        password: data.password,
      });

      if (result.error) {
        toast.error(result.error.message ?? "Invalid credentials");
        return;
      }

      // Redirect based on role — server sets this in the session
      const session = await authClient.getSession();
      const role = (session?.data?.user as any)?.role;

      if (role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">

        {/* Identifier — email or voter card ID */}
        <FormField
          control={form.control}
          name="identifier"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Email or Voter Card ID
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="you@example.com or VC-XXXX-XXXX"
                  autoComplete="username"
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
              <div className="flex items-center justify-between">
                <FormLabel className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Password
                </FormLabel>
                <Link
                  href="/recover"
                  className="text-xs text-muted-foreground underline-offset-2 hover:text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Your password"
                    autoComplete="current-password"
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

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
        >
          {isLoading ? "Signing in..." : "Sign In →"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-primary underline-offset-2 hover:underline"
          >
            Register
          </Link>
        </p>
      </form>
    </Form>
  );
}