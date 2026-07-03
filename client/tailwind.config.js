/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forge: {
          dark: '#0f172a',
          card: 'rgba(30, 41, 59, 0.7)',
          accent: '#6366f1',
          spotify: '#1db954',
          neon: '#8b5cf6'
        }
      }
    },
  },
  plugins: [],
}
