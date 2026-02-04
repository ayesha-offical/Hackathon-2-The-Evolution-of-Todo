/**
 * Task: T065 | Spec: plan.md Step 5 §frontend/RootLayoutClient.tsx
 * Description: Client-side root layout wrapper
 * Purpose: Provide AuthContext and Navigation to entire application
 * Reference: Constitution II (JWT Bridge), Constitution VI (App Structure)
 */

"use client";

import React from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { Navigation } from "@/components/common/Navigation";

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Navigation />
      {children}
    </AuthProvider>
  );
}
