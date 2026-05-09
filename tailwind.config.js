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
          pink: {
            light: '#FFB3D1',
            DEFAULT: '#FF6B9D',
            dark: '#E84A8A',
          },
          blue: {
            light: '#E0F2FE',
            DEFAULT: '#38BDF8',
            dark: '#0EA5E9',
          },
        },
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
      },
    },
  },
  plugins: [],
}
