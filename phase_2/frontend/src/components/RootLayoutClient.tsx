/**
 * Task: T065 | Spec: plan.md Step 5 §frontend/RootLayoutClient.tsx
 * Description: Client-side root layout wrapper
 * Purpose: Provide AuthContext and Navigation to entire application with error handling
 * Reference: Constitution II (JWT Bridge), Constitution VI (App Structure), Constitution I (Robustness)
 */

"use client";

import React from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { Header } from "@/components/common/Header";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import  Footer  from "@/components/common/fotter";
export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Header />
        {children}       
        <Footer />  
      </AuthProvider>
    </ErrorBoundary>
  );
}
