/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      /* Design-system colours drawn from the reference mockup.
         Using CSS custom-property fallbacks so themes can be swapped later. */
      colors: {
        brand: {
          50:  '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',   /* primary orange */
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        navy: {
          800: '#1e293b',
          900: '#0f172a',   /* dark header bg */
        },
        surface: {
          DEFAULT: '#faf8f5', /* warm off-white page bg */
          card:    '#ffffff',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
