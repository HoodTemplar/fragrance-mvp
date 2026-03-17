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
        cream: "#F5F0E8",
        charcoal: "#1A1917",
        gold: "#C9A962",
        goldLight: "#E5D4A1",
        sage: "#8B9A7D",
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
      keyframes: {
        "quiz-fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "card-press": {
          "0%": { transform: "scale(1)" },
          "45%": { transform: "scale(0.98)" },
          "100%": { transform: "scale(1)" },
        },
        "identity-glow": {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.7", transform: "scale(1.05)" },
        },
        "identity-float": {
          "0%, 100%": { transform: "translate(0, 0)" },
          "50%": { transform: "translate(0, -8px)" },
        },
      },
      animation: {
        "quiz-fade-in": "quiz-fade-in 0.45s cubic-bezier(0.4, 0, 0.2, 1) forwards",
        "fade-in": "fade-in 0.5s ease-out forwards",
        "slide-up": "slide-up 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards",
        "card-press": "card-press 0.28s ease-out forwards",
        "identity-glow": "identity-glow 5s ease-in-out infinite",
        "identity-float": "identity-float 6s ease-in-out infinite",
      },
      backgroundImage: {
        "theme-gradient": "linear-gradient(180deg, var(--theme-bg) 0%, var(--theme-bg-end) 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
