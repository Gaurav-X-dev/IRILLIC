import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },
        irillic: {
          DEFAULT: "#0091D0",
          50: "#e6f6fc",
          100: "#ccecf9",
          500: "#0091D0",
          600: "#007ab0",
          700: "#00628e",
        },
        motherson: {
          DEFAULT: "#DA2128",
          hover: "#120304",
        },
        charcoal: "#120304",
        slate: {
          body: "#555555",
          heading: "#3A3A3C",
          border: "#E3E3E3",
        },
        canvas: "#F8F9FA",
        /* Administration panel tokens. Each resolves to a CSS variable that
           the dark theme redefines, so one utility works in both themes. */
        ad: {
          canvas: "rgb(var(--adc-canvas) / <alpha-value>)",
          surface: "rgb(var(--adc-surface) / <alpha-value>)",
          raised: "rgb(var(--adc-raised) / <alpha-value>)",
          sunken: "rgb(var(--adc-sunken) / <alpha-value>)",
          line: "rgb(var(--adc-line) / <alpha-value>)",
          hairline: "rgb(var(--adc-hairline) / <alpha-value>)",
          ink: "rgb(var(--adc-ink) / <alpha-value>)",
          muted: "rgb(var(--adc-muted) / <alpha-value>)",
          faint: "rgb(var(--adc-faint) / <alpha-value>)",
          accent: "rgb(var(--adc-accent) / <alpha-value>)",
          "accent-soft": "rgb(var(--adc-accent-soft) / <alpha-value>)",
        },
        /* The navigation rail follows the theme, so light mode is light
           throughout rather than a dark bar beside white content. */
        rail: {
          DEFAULT: "rgb(var(--adc-rail) / <alpha-value>)",
          line: "rgb(var(--adc-rail-line) / <alpha-value>)",
          ink: "rgb(var(--adc-rail-ink) / <alpha-value>)",
          muted: "rgb(var(--adc-rail-muted) / <alpha-value>)",
          faint: "rgb(var(--adc-rail-faint) / <alpha-value>)",
          hover: "rgb(var(--adc-rail-hover) / <alpha-value>)",
          active: "rgb(var(--adc-rail-active) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        jakarta: [
          "Graphik",
          "var(--font-jakarta)",
          "Helvetica Neue",
          "Arial",
          "system-ui",
          "sans-serif",
        ],
      },
      borderRadius: {
        pill: "9999px",
      },
      boxShadow: {
        /* A three-step elevation set; the panel uses nothing heavier. */
        "ad-sm": "0 1px 2px rgb(var(--adc-shadow) / 0.06)",
        "ad-md":
          "0 1px 2px rgb(var(--adc-shadow) / 0.05), 0 8px 24px -12px rgb(var(--adc-shadow) / 0.18)",
        "ad-lg":
          "0 1px 2px rgb(var(--adc-shadow) / 0.06), 0 24px 48px -24px rgb(var(--adc-shadow) / 0.32)",
        "ad-rail": "inset -1px 0 0 rgb(255 255 255 / 0.04)",
      },
      transitionTimingFunction: {
        theme: "cubic-bezier(0.25, 0.8, 0.25, 1)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
