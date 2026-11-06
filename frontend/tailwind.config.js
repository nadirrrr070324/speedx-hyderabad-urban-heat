/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#FF5A1F',
        heat: '#F97316',
        critical: '#EF233C',
        navy: '#080E24',
        slate2: '#111827',
        atmo: '#DDEAF5',
        cream: '#F4EBDD',
        mist: '#E8EEF5',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        headline: ['Sora', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
