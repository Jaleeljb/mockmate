/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#1B222C",
        panel: "#232C38",
        panelLight: "#2E3947",
        slate: "#5B6B7C",
        paper: "#F4F1EA",
        amber: "#E3A857",
        onair: "#E3543F",
        good: "#6FA287",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
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
      },
      animation: {
        pulseRec: "pulseRec 1.6s ease-in-out infinite",
        rise: "rise 0.4s ease-out",
      },
    },
  },
  plugins: [],
};
