import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: "#0A0A0B",
          raised: "#111113",
          panel: "#151517",
        },
        line: {
          DEFAULT: "#232326",
          soft: "#1A1A1D",
        },
        ink: {
          DEFAULT: "#F3F3F2",
          dim: "#A3A3A8",
          faint: "#6B6B70",
        },
        accent: {
          DEFAULT: "#4C6FFF",
          hover: "#5F7FFF",
          soft: "#1A2247",
        },
        good: {
          DEFAULT: "#3DD68C",
          soft: "#0F2A1F",
        },
        warn: {
          DEFAULT: "#F5A623",
          soft: "#2A2110",
        },
        bad: {
          DEFAULT: "#F0554C",
          soft: "#2A1414",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        card: "0 1px 0 0 rgba(255,255,255,0.03) inset, 0 8px 24px -12px rgba(0,0,0,0.6)",
        pop: "0 20px 60px -20px rgba(76,111,255,0.35)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: "0.6" },
          "80%": { transform: "scale(1.6)", opacity: "0" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.16,1,0.3,1) both",
        "pulse-ring": "pulse-ring 1.8s cubic-bezier(0.2,0.6,0.4,1) infinite",
        shimmer: "shimmer 2.2s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
