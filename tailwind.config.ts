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
        primary: "#7C3AED",
        neonBlue: "#00E5FF",
        neonPink: "#FF2E93",
        deepBg: "#0B0F1A",
      },
      backgroundColor: {
        glass: "rgba(255,255,255,0.08)",
        "glass-hover": "rgba(255,255,255,0.12)",
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        glow: "0 0 20px rgba(124, 58, 237, 0.4)",
        "glow-blue": "0 0 20px rgba(0, 229, 255, 0.4)",
        "glow-pink": "0 0 20px rgba(255, 46, 147, 0.4)",
        "glow-soft": "0 0 40px rgba(124, 58, 237, 0.2)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "Inter", "sans-serif"],
      },
      letterSpacing: {
        "head": "0.05em",
      },
      animation: {
        "gradient-shift": "gradient-shift 8s ease infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
      },
      keyframes: {
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
