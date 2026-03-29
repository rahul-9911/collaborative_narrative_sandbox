/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Georgia"', '"Times New Roman"', 'serif'],
        sans: ['"Inter"', '"Helvetica"', 'sans-serif'],
      },
      colors: {
        parchment: '#FDFCF0',
        ink: '#1A1A1A',
        accent: '#9C6644',
      }
    },
  },
  plugins: [],
}
