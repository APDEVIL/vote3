"use client";

import { useRole } from "@/hooks/use-role";

interface RoleGateProps {
  allow:     "admin" | "voter";
  children:  React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Conditionally renders children based on user role.
 * For route-level protection use middleware — this is for UI only.
 *
 * Usage:
 *   <RoleGate allow="admin">
 *     <AdminOnlyButton />
 *   </RoleGate>
 */
export function RoleGate({ allow, children, fallback = null }: RoleGateProps) {
  const { role, isLoading } = useRole();

  if (isLoading) return null;
  if (role !== allow) return <>{fallback}</>;

  return <>{children}</>;
}