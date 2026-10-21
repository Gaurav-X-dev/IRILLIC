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
      transitionTimingFunction: {
        theme: "cubic-bezier(0.25, 0.8, 0.25, 1)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
