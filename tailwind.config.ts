import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
          950: "#052e16",
        },
        agri: {
          gold: "#f59e0b",
          lightGold: "#fef3c7",
          emerald: "#059669",
          deepGreen: "#064e3b",
          mint: "#a7f3d0",
          sky: "#38bdf8",
        },
        glass: {
          light: "rgba(255, 255, 255, 0.75)",
          border: "rgba(255, 255, 255, 0.3)",
          dark: "rgba(15, 23, 42, 0.8)",
          card: "rgba(255, 255, 255, 0.65)",
        },
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.07)",
        "glass-hover": "0 14px 40px 0 rgba(16, 185, 129, 0.15)",
        emerald: "0 10px 30px -10px rgba(16, 185, 129, 0.4)",
        glow: "0 0 25px rgba(16, 185, 129, 0.25)",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      animation: {
        "pulse-subtle": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 4s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
