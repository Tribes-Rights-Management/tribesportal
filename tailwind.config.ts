import type { Config } from "tailwindcss";

export default {
  darkMode: ['class'],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2rem",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1200px",
      },
    },
    extend: {
      // NOTE: Custom spacing removed to restore Tailwind defaults
      // (h-4 = 16px, not 32px). Add only NEW custom values if needed.
      fontSize: {
        /* Institutional typography scale — Apple/Bloomberg density */
        "2xs": ["10px", { lineHeight: "1.3" }],
        "xs": ["11px", { lineHeight: "1.35" }],
        "sm": ["13px", { lineHeight: "1.4" }],
        "base": ["14px", { lineHeight: "1.4" }],
        "lg": ["15px", { lineHeight: "1.35" }],
        "xl": ["17px", { lineHeight: "1.3" }],
        "2xl": ["20px", { lineHeight: "1.2" }],
        "3xl": ["26px", { lineHeight: "1.15" }],
        "4xl": ["32px", { lineHeight: "1.1" }],
      },
      colors: {
        /* ═══════════════════════════════════════════════════════════════════════
           TRIBES CANONICAL TOKENS — Mapped from src/styles/tribes-theme.css
           These are the AUTHORITATIVE colors. No hardcoded values in components.
           ═══════════════════════════════════════════════════════════════════════ */
        tribes: {
          bg: "var(--tribes-bg)",
          "header-bg": "var(--tribes-header-bg)",
          fg: "var(--tribes-fg)",
          "fg-secondary": "var(--tribes-fg-secondary)",
          "fg-muted": "var(--tribes-fg-muted)",
          surface: "var(--tribes-surface)",
          "surface-elevated": "var(--tribes-surface-elevated)",
          "surface-nested": "var(--tribes-surface-nested)",
          border: "var(--tribes-border)",
          "border-strong": "var(--tribes-border-strong)",
        },
        
        /* Mercury/Stripe 4-surface system tokens */
        "page-bg": "var(--page-bg)",
        "panel-bg": "var(--panel-bg)",
        "sidebar-bg": "var(--sidebar-bg)",
        "card-bg": "var(--card-bg)",
        
        /* Shadcn semantic tokens */
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        "app-surface": "hsl(var(--app-surface))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        // Only add custom keys, don't override Tailwind defaults (lg/md/sm)
        input: "14px",
        button: "16px",
        "xl": "16px",
        "2xl": "20px",
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0", opacity: "0" },
          to: { height: "var(--radix-accordion-content-height)", opacity: "1" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)", opacity: "1" },
          to: { height: "0", opacity: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-out": {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.98)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "scale-out": {
          from: { opacity: "1", transform: "scale(1)" },
          to: { opacity: "0", transform: "scale(0.98)" },
        },
        "slide-in-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        "slide-out-right": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(100%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 320ms ease-in-out",
        "accordion-up": "accordion-up 320ms ease-in-out",
        "fade-in": "fade-in 280ms ease-in-out",
        "fade-out": "fade-out 280ms ease-in-out",
        "scale-in": "scale-in 320ms ease-in-out",
        "scale-out": "scale-out 280ms ease-in-out",
        "slide-in-right": "slide-in-right 360ms ease-in-out",
        "slide-out-right": "slide-out-right 320ms ease-in-out",
        "enter": "fade-in 280ms ease-in-out, scale-in 320ms ease-in-out",
        "exit": "fade-out 280ms ease-in-out, scale-out 280ms ease-in-out",
      },
      transitionDuration: {
        '180': '180ms',
        '200': '200ms',
        '220': '220ms',
        '280': '280ms',
        '320': '320ms',
      },
      transitionTimingFunction: {
        /* Marketing site alignment: precise, calm easing */
        'institutional': 'cubic-bezier(0.2, 0.8, 0.2, 1)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
