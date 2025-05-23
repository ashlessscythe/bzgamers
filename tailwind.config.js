/** @type {import('tailwindcss').Config} */
const { lineClampPlugin } = require('./src/styles/tailwind-plugins')

module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // We can define custom colors for our theme here
        primary: {
          light: '#4f46e5', // indigo-600
          DEFAULT: '#4338ca', // indigo-700
          dark: '#3730a3', // indigo-800
        },
        secondary: {
          light: '#8b5cf6', // violet-500
          DEFAULT: '#7c3aed', // violet-600
          dark: '#6d28d9', // violet-700
        },
      },
      lineClamp: {
        1: 1,
        2: 2,
        3: 3,
        4: 4,
        5: 5,
        6: 6,
      },
    },
  },
  plugins: [
    lineClampPlugin,
  ],
  darkMode: 'class', // Enable dark mode with class strategy for theme switching
}
