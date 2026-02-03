/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f6f3ee',
          100: '#efe6d9',
          200: '#e0cab0',
          300: '#d3b48e',
          400: '#c59b6d',
          500: '#b37f52',
          600: '#8f6340',
          700: '#6f4c32',
          800: '#503625',
          900: '#352318'
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
}
