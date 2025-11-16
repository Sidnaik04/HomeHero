/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Custom dark bluish-black theme
        primary: {
          50: "#e6f0ff",
          100: "#cce0ff",
          200: "#99c2ff",
          300: "#66a3ff",
          400: "#3385ff",
          500: "#0066ff",
          600: "#0052cc",
          700: "#003d99",
          800: "#002966",
          900: "#001433",
        },
        dark: {
          bg: "#0a0e27", // Main background
          card: "#141829", // Card background
          border: "#1e2438", // Borders
          hover: "#1a1f3a", // Hover states
          text: "#e2e8f0", // Main text
          muted: "#94a3b8", // Muted text
        },
      },
    },
  },
  plugins: [],
  darkMode: "class",
};
