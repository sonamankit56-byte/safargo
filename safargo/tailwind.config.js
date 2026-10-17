/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        safargo: {
          navy: {
            DEFAULT: '#0A2540',
            50: '#F0F4F8',
            100: '#D9E2EC',
            200: '#BCCCDC',
            300: '#9FB3C8',
            400: '#829AB1',
            500: '#627D98',
            600: '#486581',
            700: '#334E68',
            800: '#102A43',
            900: '#0A2540',
            dark: '#061727',
          },
          orange: {
            DEFAULT: '#FF6B00',
            50: '#FFF7ED',
            100: '#FFEDD5',
            200: '#FED7AA',
            300: '#FDBA74',
            400: '#FB923C',
            500: '#FF6B00',
            600: '#EA580C',
            700: '#C2410C',
            800: '#9A3412',
            900: '#7C2D12',
          },
          green: {
            DEFAULT: '#16A34A',
            50: '#F0FDF4',
            100: '#DCFCE7',
            200: '#BBF7D0',
            300: '#86EFAC',
            400: '#4ADE80',
            500: '#22C55E',
            600: '#16A34A',
            700: '#15803D',
            800: '#166534',
            900: '#14532D',
          },
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
