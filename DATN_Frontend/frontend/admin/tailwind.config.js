/** @type {import('tailwindcss').Config} */
import { COLORS, FONTSIZE } from '../shared/src/constants/color';

export default {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    '../shared/src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: COLORS,
      fontFamily: {
        // roboto: ['Roboto', 'sans-serif'],
      },
      fontSize: FONTSIZE,
    },
    container: {
      center: true, // Center the container by default
      screens: {
        // sm: '640px',
        // md: '768px',
        // lg: '1024px',
        // xl: '1440px',
        // xxl: '1680px',
      },
    },
    plugins: [],
  },
};
