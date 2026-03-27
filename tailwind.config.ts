import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        xl: "1.25rem",
        "2xl": "1.75rem",
        "3xl": "2rem",
      },
      boxShadow: {
        soft: "0 24px 60px -34px rgba(21, 24, 20, 0.22)",
        card: "0 22px 40px -28px rgba(26, 31, 26, 0.18)",
        inset: "inset 0 1px 0 rgba(255, 255, 255, 0.55)",
      },
      fontFamily: {
        sans: ["var(--font-manrope)"],
        display: ["var(--font-newsreader)"],
      },
      backgroundImage: {
        "paper-grid":
          "linear-gradient(to right, rgba(59, 66, 59, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(59, 66, 59, 0.03) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

export default config;
