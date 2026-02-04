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
       * Color Palette System - To-Do App Light Theme
       * Primary: Red/Coral (#EE7063)
       * Accents: Orange-Red (#FF6B35), Blues for progress
       * Backgrounds: Light gray (#F5F5F5) to white
       */
      colors: {
        // Primary Red/Coral Theme
        primary: {
          DEFAULT: "#EE7063",
          50: "#FEF6F5",
          100: "#FDEDEA",
          200: "#FAD5CF",
          300: "#F6B5A6",
          400: "#F29382",
          500: "#EE7063",
          600: "#E85543",
          700: "#D94C3A",
          800: "#C24233",
          900: "#A0362A",
          950: "#752621",
        },

        // Accent Colors
        accent: {
          orange: "#FF6B35",
          blue: "#4A90E2",
          purple: "#9B59B6",
          green: "#52C41A",
          yellow: "#FAAD14",
        },

        // Background Colors (Light Theme)
        background: {
          DEFAULT: "#F5F5F5", // Light gray
          surface: "#FFFFFF", // White for cards
          elevated: "#FAFAFA", // Slightly darker
        },

        // Text Colors (Dark on light)
        text: {
          primary: "#2C2C2C",
          secondary: "#666666",
          muted: "#999999",
          light: "#FFFFFF",
        },

        // Border Colors
        border: {
          DEFAULT: "#E0E0E0",
          light: "#F0F0F0",
          strong: "#CCCCCC",
        },

        // Status Colors
        success: {
          DEFAULT: "#52C41A",
          light: "#95DE64",
          dark: "#389E0D",
        },
        error: {
          DEFAULT: "#FF4D4F",
          light: "#FF7875",
          dark: "#CF1322",
        },
        warning: {
          DEFAULT: "#FAAD14",
          light: "#FFC53D",
          dark: "#D48806",
        },
        info: {
          DEFAULT: "#1890FF",
          light: "#40A9FF",
          dark: "#0050B3",
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
       * Shadow System - Light Theme
       * Subtle shadows for depth and elevation
       */
      boxShadow: {
        glow: "0 0 20px rgba(238, 112, 99, 0.15)",
        "glow-sm": "0 0 10px rgba(238, 112, 99, 0.1)",
        "glow-lg": "0 0 30px rgba(238, 112, 99, 0.2)",
        glass: "0 2px 8px rgba(0, 0, 0, 0.08)",
        "glass-sm": "0 1px 4px rgba(0, 0, 0, 0.05)",
        card: "0 2px 8px rgba(0, 0, 0, 0.1)",
        "card-hover": "0 4px 16px rgba(0, 0, 0, 0.15)",
        "card-lg": "0 4px 12px rgba(0, 0, 0, 0.12)",
        inner: "inset 0px 1px 2px rgba(0, 0, 0, 0.05)",
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
          "@apply inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-white bg-primary hover:bg-primary-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-normal shadow-card hover:shadow-card-hover":
            {},
        },

        ".btn-secondary": {
          "@apply inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-primary border-2 border-primary bg-white hover:bg-primary-50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-normal shadow-card":
            {},
        },

        ".btn-destructive": {
          "@apply inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-white bg-error hover:bg-error-dark active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-normal shadow-card":
            {},
        },

        ".btn-ghost": {
          "@apply inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium text-text-secondary hover:text-primary hover:bg-primary/5 active:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-fast":
            {},
        },

        ".btn-accent": {
          "@apply inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-white bg-accent-orange hover:bg-orange-600 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-normal shadow-card":
            {},
        },

        // Card Styles

        ".card": {
          "@apply bg-background-surface border border-border rounded-lg shadow-card":
            {},
        },

        ".card-interactive": {
          "@apply bg-background-surface border border-border rounded-lg shadow-card hover:shadow-card-hover hover:border-primary/50 hover:-translate-y-1 transition-all duration-normal cursor-pointer":
            {},
        },

        ".card-gradient": {
          "@apply bg-gradient-to-br from-background-surface to-background-elevated border border-border rounded-lg shadow-card":
            {},
        },

        ".card-glow": {
          "@apply bg-background-surface border-2 border-primary rounded-lg shadow-glow":
            {},
        },

        // Input Styles

        ".input-base": {
          "@apply w-full px-4 py-3 bg-white border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-glass-sm":
            {},
        },

        ".input-error": {
          "@apply border-error bg-error/5 focus:ring-error/20":
            {},
        },

        ".textarea-base": {
          "@apply w-full px-4 py-3 bg-white border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none shadow-glass-sm":
            {},
        },

        // Form Label

        ".label": {
          "@apply block text-sm font-semibold text-text-primary mb-2": {},
        },

        ".label-required": {
          "@apply text-error": {},
        },

        // Layout Styles

        ".page-container": {
          "@apply min-h-screen bg-background": {},
        },

        ".content-wrapper": {
          "@apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8": {},
        },

        ".section-spacing": {
          "@apply space-y-8": {},
        },

        // Alert Styles (Light Theme)

        ".alert": {
          "@apply rounded-lg p-4 flex items-start gap-4 border": {},
        },

        ".alert-success": {
          "@apply bg-success/5 border-success/30 text-success-dark":
            {},
        },

        ".alert-error": {
          "@apply bg-error/5 border-error/30 text-error-dark": {},
        },

        ".alert-warning": {
          "@apply bg-warning/5 border-warning/30 text-warning-dark":
            {},
        },

        ".alert-info": {
          "@apply bg-info/5 border-info/30 text-info-dark": {},
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
