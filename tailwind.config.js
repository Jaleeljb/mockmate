/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        void: "#050506",
        surface: "#111114",
        surfaceHover: "#1B1B20",
        mist: "#87878F",
        paper: "#F4F2EC",
        signal: "#8B7CFF",
        signalLight: "#C9BFFF",
        rec: "#FF5C6C",
        good: "#3DDC97",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        serif: ["var(--font-serif)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      keyframes: {
        pulseRec: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
        rise: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        floaty: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(20px, -24px) scale(1.06)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        drift: {
          "0%, 100%": { transform: "translate(0, 0) rotate(0deg)" },
          "33%": { transform: "translate(3%, -4%) rotate(2deg)" },
          "66%": { transform: "translate(-2%, 3%) rotate(-1.5deg)" },
        },
        ringSpin: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        sweep: {
          "0%, 100%": { opacity: "0.5", transform: "translateX(-6%)" },
          "50%": { opacity: "1", transform: "translateX(6%)" },
        },
        grain: {
          "0%, 100%": { transform: "translate(0, 0)" },
          "10%": { transform: "translate(-1%, -2%)" },
          "30%": { transform: "translate(2%, 1%)" },
          "50%": { transform: "translate(-2%, 2%)" },
          "70%": { transform: "translate(1%, -1%)" },
          "90%": { transform: "translate(-1%, 1%)" },
        },
      },
      animation: {
        pulseRec: "pulseRec 1.6s ease-in-out infinite",
        rise: "rise 0.4s ease-out",
        floaty: "floaty 16s ease-in-out infinite",
        marquee: "marquee 26s linear infinite",
        drift: "drift 22s ease-in-out infinite",
        ringSpin: "ringSpin 14s linear infinite",
        shimmer: "shimmer 3.5s ease-in-out infinite",
        sweep: "sweep 9s ease-in-out infinite",
        grain: "grain 9s steps(8) infinite",
      },
    },
  },
  plugins: [],
};
