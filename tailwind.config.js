/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          500: '#ef4444',
          600: '#dc2626',
          700: '#c53030',
          800: '#991b1b',
          900: '#7f1d1d',
          DEFAULT: '#c53030',
        },
        primary: '#c53030',
        dark: '#0f172a',
        safargo: {
          navy: {
            50: '#f0f5fa',
            100: '#e1ecf5',
            200: '#c3d9eb',
            300: '#94bfe0',
            400: '#5e9ed0',
            500: '#3b82bf',
            600: '#2b66a5',
            700: '#235286',
            800: '#1e446e',
            900: '#0f2744',
            950: '#0a192e',
          },
          orange: {
            50: '#fff7ed',
            100: '#ffedd5',
            200: '#fed7aa',
            300: '#fdba74',
            400: '#fb923c',
            500: '#f97316',
            600: '#ea580c',
            700: '#c2410c',
            800: '#9a3412',
            900: '#7c2d12',
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
