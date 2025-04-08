/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        space: {
          bg: "#0d1117",
          surface: "#161b22",
          accent: "#58a6ff",
          text: "#c9d1d9",
          subtle: "#8b949e",
        },
      },
    },
  },
  plugins: [],
};
