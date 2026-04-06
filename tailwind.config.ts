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
        void: "var(--void)",
        ink: "var(--ink)",
        stone: "var(--stone)",
        ash: "var(--ash)",
        fog: "var(--fog)",
        cloud: "var(--cloud)",
        paper: "var(--paper)",
        flot: "var(--flot)",
        "flot-dim": "var(--flot-dim)",
        "flot-glow": "var(--flot-glow)",
        hotel: "var(--hotel)",
        restaurant: "var(--restaurant)",
        travel: "var(--travel)",
        fashion: "var(--fashion)",
        success: "var(--success)",
        error: "var(--error)",
        warning: "var(--warning)",
      },
      fontFamily: {
        display: ["var(--font-cormorant)", "serif"],
        body: ["var(--font-montserrat)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      fontSize: {
        xs: "var(--text-xs)",
        sm: "var(--text-sm)",
        md: "var(--text-md)",
        lg: "var(--text-lg)",
        xl: "var(--text-xl)",
        hero: "var(--text-hero)",
      },
      transitionTimingFunction: {
        "out-expo": "var(--ease-out-expo)",
        "in-out": "var(--ease-in-out)",
      },
      transitionDuration: {
        fast: "var(--dur-fast)",
        mid: "var(--dur-mid)",
        slow: "var(--dur-slow)",
        enter: "var(--dur-enter)",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
    },
  },
  plugins: [],
};
export default config;
