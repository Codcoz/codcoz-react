/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        codcoz: {
          DEFAULT: '#002A45',
          light: '#003d63',
          dark: '#001a2e',
        }
      },
    },
  },
  plugins: [],
}

