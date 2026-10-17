/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        meesho: {
          DEFAULT: '#9F2089',
          dark: '#82156E',
          light: '#FDF2FA',
          border: '#F0CEE7',
          badge: '#FBEAF6',
        },
        safargo: {
          blue: '#0A2885',
          gold: '#FFC107',
        },
        deal: {
          orange: '#FF6500',
          red: '#E02D3C',
        },
        rating: {
          green: '#23BB75',
          darkgreen: '#038D63',
        },
        surface: {
          bg: '#F4F4F6',
          card: '#FFFFFF',
          border: '#E8E8E8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.06)',
        'sticky': '0 -2px 10px rgba(0, 0, 0, 0.08)',
      }
    },
  },
  plugins: [],
}
