"use client";

/**
 * hooks/use-role.ts
 *
 * Returns the current user's role and helper booleans.
 *
 * Usage:
 *   const { role, isAdmin, isVoter } = useRole();
 *
 *   if (isAdmin) { ... }
 */

import { useSession } from "./use-session";

type Role = "voter" | "admin";

export function useRole() {
  const { user, isLoading } = useSession();

  // better-auth returns custom columns on the user object at runtime
  // even though the type doesn't include them
  const role = (user as (typeof user & { role?: Role }) | null)?.role ?? null;

  return {
    role,
    isAdmin:  role === "admin",
    isVoter:  role === "voter",
    isLoading,
  };
}