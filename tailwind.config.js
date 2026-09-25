/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0b0e14",
        surface: "#121824",
        surfaceLight: "#1a2234",
        accentGreen: "#10b981",
        accentPurple: "#8b5cf6"
      }
    },
  },
  plugins: [],
}