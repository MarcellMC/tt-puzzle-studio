"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

// Initialize Convex client - will be null if not configured
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex = convexUrl
  ? new ConvexReactClient(convexUrl)
  : null;

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  if (!convex) {
    // Convex not configured - show a setup message in development
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "⚠️  Convex is not configured. Please run 'npx convex dev' and set NEXT_PUBLIC_CONVEX_URL in .env.local"
      );
    }
    // Return children without Convex provider (app will fall back to localStorage)
    return <>{children}</>;
  }

  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
