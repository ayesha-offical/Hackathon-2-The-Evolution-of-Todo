/**
 * Task: Enhancement to T059 & T060
 * Description: Reusable password input component with visibility toggle
 * Purpose: Allow users to show/hide password as they type with eye icon
 * Reference: @specs/001-sdd-initialization/ui/pages.md §Login Page & §Registration Page
 */

"use client";

import { forwardRef, useState } from "react";

/**
 * Props for PasswordInput component
 * Designed to work seamlessly with react-hook-form
 */
interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
}

/**
 * Eye Icon Component - Closed eye (password hidden)
 */
function EyeIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-text-muted"
    >
      <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

/**
 * Eye-Slash Icon Component - Crossed eye (password visible)
 */
function EyeSlashIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-text-muted"
    >
      <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}

/**
 * PasswordInput Component
 *
 * Features:
 * - Toggleable password visibility with eye icon
 * - Compatible with react-hook-form via forwardRef
 * - Dark mode support
 * - Accessible with aria-label
 * - Maintains standard input styling from globals.css
 * - Disabled state support
 *
 * Usage with react-hook-form:
 * ```tsx
 * const { register } = useForm();
 * <PasswordInput
 *   id="password"
 *   placeholder="••••••••"
 *   {...register("password")}
 * />
 * ```
 *
 * Reference: Constitution VI (UI Components), plan.md Step 4
 */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    { id, placeholder = "••••••••", disabled = false, className = "", ...props },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    /**
     * Toggle password visibility
     * Switches input type between "password" and "text"
     */
    function togglePasswordVisibility() {
      setShowPassword(!showPassword);
    }

    return (
      <div className="relative">
        {/* Password Input Field */}
        <input
          ref={ref}
          id={id}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          disabled={disabled}
          className={`input pr-10 ${className}`}
          {...props}
        />

        {/* Visibility Toggle Button */}
        <button
          type="button"
          onClick={togglePasswordVisibility}
          disabled={disabled}
          aria-label={showPassword ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-muted hover:text-text-secondary disabled:text-text-muted/50 cursor-pointer transition-colors"
        >
          {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
        </button>
      </div>
    );
  }
);

// Display name for better debugging
PasswordInput.displayName = "PasswordInput";
