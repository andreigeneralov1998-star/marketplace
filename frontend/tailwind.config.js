import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/features/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "24px",
      screens: {
        "2xl": "1440px",
      },
    },
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "sans-serif",
        ],
      },
      colors: {
        page: "rgb(var(--background) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",

        text: {
          primary: "rgb(var(--text-primary) / <alpha-value>)",
          secondary: "rgb(var(--text-secondary) / <alpha-value>)",
        },

        border: {
          DEFAULT: "rgb(var(--border) / <alpha-value>)",
        },

        brand: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          hover: "rgb(var(--accent-hover) / <alpha-value>)",
          soft: "rgb(var(--accent-soft) / <alpha-value>)",
        },

        graphite: "rgb(var(--graphite) / <alpha-value>)",
        deepdark: "rgb(var(--deep-dark) / <alpha-value>)",

        success: {
          text: "rgb(var(--success-text) / <alpha-value>)",
          bg: "rgb(var(--success-bg) / <alpha-value>)",
          border: "rgb(var(--success-border) / <alpha-value>)",
        },
        warning: {
          text: "rgb(var(--warning-text) / <alpha-value>)",
          bg: "rgb(var(--warning-bg) / <alpha-value>)",
          border: "rgb(var(--warning-border) / <alpha-value>)",
        },
        error: {
          text: "rgb(var(--error-text) / <alpha-value>)",
          bg: "rgb(var(--error-bg) / <alpha-value>)",
          border: "rgb(var(--error-border) / <alpha-value>)",
        },
        info: {
          text: "rgb(var(--info-text) / <alpha-value>)",
          bg: "rgb(var(--info-bg) / <alpha-value>)",
          border: "rgb(var(--info-border) / <alpha-value>)",
        },
      },
      borderRadius: {
        control: "var(--radius-control)",
        card: "var(--radius-card)",
        modal: "var(--radius-modal)",
        pill: "var(--radius-pill)",
      },
      boxShadow: {
        base: "var(--shadow-base)",
        hover: "var(--shadow-hover)",
        modal: "var(--shadow-modal)",
      },
      maxWidth: {
        page: "var(--container-max)",
        content: "var(--container-content)",
      },
      height: {
        header: "var(--header-height)",
        control: "44px",
        tab: "40px",
        compact: "36px",
        cta: "48px",
      },
      minHeight: {
        control: "44px",
        cta: "48px",
      },
      spacing: {
        18: "4.5rem",
      },
    },
  },
  plugins: [animate],
};

export default config;