/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'brand-primary': {
          DEFAULT: '#1E40AF', // blue-800
          dark: '#2563EB', // blue-600
        },
        'brand-secondary': {
          DEFAULT: '#0D9488', // teal-600
          dark: '#14B8A6', // teal-500
        },
        'base-100': '#FFFFFF',
        'base-200': '#F8F8F8',
        'base-300': '#F0F0F0',
        'base-content': '#000000',
        'dark-base-100': '#000000',
        'dark-base-200': '#1A1A1A',
        'dark-base-300': '#333333',
        'dark-base-content': '#FFFFFF',
        success: {
          light: '#D1FAE5', // green-100
          DEFAULT: '#04785E', // green-700
          dark: '#4ADE80', // green-400
        },
        error: {
          light: '#FEE2E2', // red-100
          DEFAULT: '#B91C1C', // red-700
          dark: '#F87171', // red-400
        },
        warning: {
          light: '#FEF3C7', // amber-100
          DEFAULT: '#EA580C', // orange-600
          dark: '#FDBA74', // orange-300
        },
        info: {
          light: '#DBEAFE', // blue-100
          DEFAULT: '#4338CA', // indigo-700
          dark: '#6366F1', // indigo-500
        },
      },
    },
  },
  plugins: [],
};