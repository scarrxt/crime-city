/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        noir: ['"Special Elite"', 'ui-monospace', 'monospace'],
        display: ['"Bebas Neue"', 'ui-sans-serif', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
