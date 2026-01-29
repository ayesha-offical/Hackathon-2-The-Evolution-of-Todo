/**
 * Task: T075 | Spec: TodoFusion Design System
 * Description: Tailwind CSS configuration with dark purple/indigo theme
 * Purpose: Implement TodoFusion aesthetic with glassmorphism and neon effects
 * Reference: https://todofusion.framer.website/
 */

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      /**
       * Typography System
       * TodoFusion uses Inter and Plus Jakarta Sans
       */
      fontFamily: {
        sans: [
          "Inter",
          "Plus Jakarta Sans",
          "system-ui",
          "ui-sans-serif",
          "sans-serif",
        ],
        mono: [
          "Fragment Mono",
          "system-ui",
          "ui-monospace",
          "monospace",
        ],
      },

      /**
       * Color Palette System - TodoFusion Dark Theme
       * Primary: Purple/Indigo (#8624ff)
       * Accents: Cyan (#22d2ed), Pink (#e973bb)
       * Backgrounds: Deep charcoal (#121218) to lighter surfaces (#1b1b21)
       */
      colors: {
        // Primary Purple/Indigo Theme
        primary: {
          DEFAULT: "#8624ff",
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#8624ff", // Main purple
          700: "#7c3aed",
          800: "#6b21a8",
          900: "#581c87",
          950: "#3b0764",
        },

        // Accent Colors
        accent: {
          cyan: "#22d2ed",
          pink: "#e973bb",
          purple: "#8624ff",
        },

        // Background Colors
        background: {
          DEFAULT: "#121218", // Deep charcoal
          surface: "#1b1b21", // Slightly lighter
          elevated: "#232329", // Even lighter for cards
        },

        // Text Colors
        text: {
          primary: "#ffffff",
          secondary: "#94979e", // Muted gray
          muted: "#6b6d75",
        },

        // Border Colors
        border: {
          DEFAULT: "rgba(255, 255, 255, 0.08)",
          light: "rgba(255, 255, 255, 0.05)",
          strong: "rgba(255, 255, 255, 0.12)",
        },

        // Success/Error Colors (adjusted for dark theme)
        success: {
          DEFAULT: "#10b981",
          light: "#34d399",
          dark: "#059669",
        },
        error: {
          DEFAULT: "#ef4444",
          light: "#f87171",
          dark: "#dc2626",
        },
        warning: {
          DEFAULT: "#f59e0b",
          light: "#fbbf24",
          dark: "#d97706",
        },
      },

      /**
       * Border Radius System
       * TodoFusion uses 16px for cards
       */
      borderRadius: {
        xs: "4px",
        sm: "8px",
        DEFAULT: "12px",
        md: "14px",
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
        "3xl": "32px",
        full: "9999px",
      },

      /**
       * Shadow System with Glassmorphism
       * Subtle shadows and glows for depth
       */
      boxShadow: {
        glow: "0 0 20px rgba(134, 36, 255, 0.3)",
        "glow-sm": "0 0 10px rgba(134, 36, 255, 0.2)",
        "glow-lg": "0 0 30px rgba(134, 36, 255, 0.4)",
        "glow-cyan": "0 0 20px rgba(34, 210, 237, 0.3)",
        "glow-pink": "0 0 20px rgba(233, 115, 187, 0.3)",
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        "glass-sm": "0 4px 16px 0 rgba(0, 0, 0, 0.2)",
        card: "0 4px 16px rgba(0, 0, 0, 0.4)",
        "card-hover": "0 8px 24px rgba(0, 0, 0, 0.5)",
        inner: "inset 0px 2px 4px rgba(0, 0, 0, 0.3)",
      },

      /**
       * Backdrop Blur Effects for Glassmorphism
       */
      backdropBlur: {
        xs: "2px",
        sm: "4px",
        DEFAULT: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
        "2xl": "40px",
      },

      /**
       * Background Gradients
       */
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #8624ff 0%, #a855f7 100%)",
        "gradient-accent": "linear-gradient(135deg, #8624ff 0%, #22d2ed 100%)",
        "gradient-pink": "linear-gradient(135deg, #8624ff 0%, #e973bb 100%)",
        "gradient-radial": "radial-gradient(circle, var(--tw-gradient-stops))",
      },

      /**
       * Animation System
       */
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        glow: "glow 2s ease-in-out infinite alternate",
        float: "float 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        glow: {
          "0%": { boxShadow: "0 0 10px rgba(134, 36, 255, 0.3)" },
          "100%": { boxShadow: "0 0 20px rgba(134, 36, 255, 0.6)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },

      /**
       * Transition System
       */
      transitionDuration: {
        DEFAULT: "200ms",
        fast: "150ms",
        normal: "300ms",
        slow: "500ms",
      },
    },
  },

  /**
   * Component Layer - TodoFusion Style Components
   */
  plugins: [
    function ({ addComponents, theme }) {
      addComponents({
        // Button Styles with Gradient and Glow

        ".btn-primary": {
          "@apply inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-white bg-gradient-primary hover:shadow-glow active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-normal":
            {},
        },

        ".btn-secondary": {
          "@apply inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-white border-2 border-primary/50 bg-background-elevated/50 hover:border-primary hover:bg-background-elevated backdrop-blur-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-normal":
            {},
        },

        ".btn-destructive": {
          "@apply inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-white bg-error hover:bg-error-light active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-normal":
            {},
        },

        ".btn-ghost": {
          "@apply inline-flex items-center justify-center px-4 py-2 rounded-xl font-medium text-text-secondary hover:text-white hover:bg-white/5 active:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-fast":
            {},
        },

        // Card Styles with Glassmorphism

        ".card": {
          "@apply bg-background-elevated/80 backdrop-blur-md rounded-lg border border-border shadow-card":
            {},
        },

        ".card-interactive": {
          "@apply bg-background-elevated/80 backdrop-blur-md rounded-lg border border-border shadow-card hover:shadow-card-hover hover:border-primary/30 hover:-translate-y-1 transition-all duration-normal cursor-pointer":
            {},
        },

        ".card-gradient": {
          "@apply bg-gradient-to-br from-background-elevated/90 to-background-elevated/70 backdrop-blur-md rounded-lg border border-border shadow-card":
            {},
        },

        ".card-glow": {
          "@apply bg-background-elevated/80 backdrop-blur-md rounded-lg border border-primary/50 shadow-glow":
            {},
        },

        // Input Styles with Glow on Focus

        ".input-base": {
          "@apply w-full px-4 py-3 bg-background-surface/50 border border-border rounded-lg text-white placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 focus:shadow-glow-sm backdrop-blur-sm transition-all":
            {},
        },

        ".input-error": {
          "@apply border-error bg-error/5 focus:ring-error/20 focus:shadow-none":
            {},
        },

        ".textarea-base": {
          "@apply w-full px-4 py-3 bg-background-surface/50 border border-border rounded-lg text-white placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 focus:shadow-glow-sm backdrop-blur-sm transition-all resize-none":
            {},
        },

        // Form Label

        ".label": {
          "@apply block text-sm font-semibold text-text-secondary mb-2": {},
        },

        ".label-required": {
          "@apply text-error": {},
        },

        // Layout Styles

        ".page-container": {
          "@apply min-h-screen bg-background": {},
        },

        ".content-wrapper": {
          "@apply max-w-6xl mx-auto px-4 sm:px-6 lg:px-8": {},
        },

        ".section-spacing": {
          "@apply space-y-8": {},
        },

        // Alert Styles (Dark Theme)

        ".alert": {
          "@apply rounded-lg p-4 flex items-start gap-4 backdrop-blur-sm": {},
        },

        ".alert-success": {
          "@apply bg-success/10 border border-success/30 text-success-light":
            {},
        },

        ".alert-error": {
          "@apply bg-error/10 border border-error/30 text-error-light": {},
        },

        ".alert-warning": {
          "@apply bg-warning/10 border border-warning/30 text-warning-light":
            {},
        },

        ".alert-info": {
          "@apply bg-primary/10 border border-primary/30 text-primary-300": {},
        },

        // Utility Classes

        ".glass": {
          "@apply backdrop-blur-md bg-white/5 border border-white/10": {},
        },

        ".glass-strong": {
          "@apply backdrop-blur-lg bg-white/10 border border-white/20": {},
        },

        ".glow-text": {
          "@apply text-transparent bg-clip-text bg-gradient-primary": {},
        },

        ".border-gradient": {
          "@apply relative before:absolute before:inset-0 before:rounded-lg before:p-[1px] before:bg-gradient-primary before:-z-10":
            {},
        },
      });
    },

    function ({ addUtilities }) {
      addUtilities({
        ".animation-delay-100": {
          "animation-delay": "100ms",
        },
        ".animation-delay-200": {
          "animation-delay": "200ms",
        },
        ".animation-delay-300": {
          "animation-delay": "300ms",
        },
        ".scrollbar-hide": {
          "-ms-overflow-style": "none",
          "scrollbar-width": "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        },
      });
    },
  ],
};

export default config;
