// Task: Better Auth client initialization for frontend authentication
// @specs/001-sdd-initialization/features/authentication.md §Better Auth Integration

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:8000/api/v1/auth",
  fetchOptions: {
    credentials: "include",
  },
});

export const { useSession, signOut } = authClient;
