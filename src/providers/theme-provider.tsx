"use client";

/**
 * providers/theme-provider.tsx
 *
 * Forces dark theme globally — matches your VoteSecure navy design.
 * next-themes handles SSR hydration safely.
 */

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}   // always dark — no system preference
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}