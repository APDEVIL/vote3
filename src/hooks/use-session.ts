"use client";

/**
 * hooks/use-session.ts
 *
 * Wraps better-auth's useSession hook.
 * Single import for all components that need session data.
 *
 * Usage:
 *   const { session, isLoading, isAuthenticated } = useSession();
 *   const { user } = useSession();
 */

import { authClient } from "@/server/better-auth/client";

export function useSession() {
  const { data: session, isPending: isLoading, error } = authClient.useSession();

  return {
    session,
    user: session?.user ?? null,
    isLoading,
    isAuthenticated: !!session?.user,
    error,
  };
}