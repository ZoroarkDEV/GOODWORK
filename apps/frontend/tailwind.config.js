/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Design System premium tokens
        brand: {
          navy: {
            light: '#1e293b',
            DEFAULT: '#0f172a',
            dark: '#020617',
          },
          teal: {
            light: '#14b8a6',
            DEFAULT: '#0d9488',
            dark: '#0f766e',
          },
          crimson: {
            light: '#f87171',
            DEFAULT: '#dc2626',
            dark: '#991b1b',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
