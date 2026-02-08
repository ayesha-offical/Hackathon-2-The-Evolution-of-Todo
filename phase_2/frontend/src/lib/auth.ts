// Task: Better Auth client initialization for frontend authentication
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // YAHAN BACKEND (Hugging Face) KA URL HONA CHAHIYE
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "https://ayeshamughal2513-focus-hub.hf.space",
  fetchOptions: {
    credentials: "include", // Taake cookies cross-domain save hon
  },
});

export const { useSession, signOut } = authClient;