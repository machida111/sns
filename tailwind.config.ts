import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f2f6ff",
          100: "#e5edff",
          200: "#c2d4ff",
          300: "#9ab6ff",
          400: "#6b8fff",
          500: "#4066ff",
          600: "#2b47db",
          700: "#2038ad",
          800: "#1c2f8a",
          900: "#1a2a70",
        },
      },
    },
  },
  plugins: [],
};

export default config;
