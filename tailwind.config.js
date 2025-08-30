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
          DEFAULT: '#4F46E5', // indigo-600
          dark: '#818CF8', // indigo-400
        },
        'brand-secondary': {
          DEFAULT: '#818CF8', // indigo-400
          dark: '#6366F1', // indigo-500
        },
        'base-100': '#FFFFFF',
        'base-200': '#F9FAFB',
        'base-300': '#F3F4F6',
        'base-content': '#1F2937',
        'dark-base-100': '#111827',
        'dark-base-200': '#1F2937',
        'dark-base-300': '#374151',
        'dark-base-content': '#F9FAFB',
        success: {
          light: '#D1FAE5', // green-100
          DEFAULT: '#059669', // green-600
          dark: '#34D399', // green-400
        },
        error: {
          light: '#FEE2E2', // red-100
          DEFAULT: '#DC2626', // red-600
          dark: '#F87171', // red-400
        },
        warning: {
          light: '#FEF3C7', // amber-100
          DEFAULT: '#F59E0B', // amber-500
          dark: '#FBBF24', // amber-400
        },
        info: {
          light: '#DBEAFE', // blue-100
          DEFAULT: '#0EA5E9', // sky-500
          dark: '#38BDF8', // sky-400
        },
      },
    },
  },
  plugins: [],
};