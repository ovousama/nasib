import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary:       "var(--color-primary)",
        "primary-hover": "var(--color-primary-hover)",
        "primary-light": "var(--color-primary-light)",
        secondary:     "var(--color-secondary)",
        accent:        "var(--color-accent)",
        "accent-dark": "var(--color-accent-dark)",
        blush:         "var(--color-blush)",
        warm:          "var(--color-warm)",
        "n-bg":        "var(--color-bg)",
        "n-card":      "var(--color-bg-card)",
        "n-section":   "var(--color-bg-section)",
        "n-border":    "var(--color-border)",
        "n-border-strong": "var(--color-border-strong)",
        "n-text":      "var(--color-text-primary)",
        "n-secondary": "var(--color-text-secondary)",
        "n-muted":     "var(--color-text-muted)",
      },
      borderRadius: {
        "n-sm": "6px",
        "n-md": "10px",
        "n-lg": "16px",
        "n-xl": "20px",
      },
      boxShadow: {
        subtle: "0 1px 3px rgba(0,0,0,0.06)",
        card:   "0 2px 8px rgba(0,0,0,0.06)",
      },
      fontSize: {
        "2xs": ["11px", { lineHeight: "1.4" }],
      },
      letterSpacing: {
        heading: "-0.02em",
        label:   "0.06em",
      },
    },
  },
  plugins: [],
};
export default config;
