"use client";

/**
 * providers/index.tsx
 *
 * Single wrapper that composes all providers.
 * Used in src/app/layout.tsx:
 *
 *   <Providers>
 *     {children}
 *   </Providers>
 *
 * Provider order matters:
 *   ThemeProvider → TRPCProvider → Sonner (toast)
 */

import { Toaster } from "sonner";
import { ThemeProvider } from "./theme-provider";
import { TRPCProvider } from "./trpc-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <TRPCProvider>
        {children}

        {/* Sonner toast — dark theme, top-right position */}
        <Toaster
          theme="dark"
          position="top-right"
          richColors
          toastOptions={{
            style: {
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              color: "hsl(var(--card-foreground))",
            },
          }}
        />
      </TRPCProvider>
    </ThemeProvider>
  );
}