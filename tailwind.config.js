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
          DEFAULT: '#1D4ED8', // blue-700
          dark: '#3B82F6', // blue-500
        },
        'brand-secondary': {
          DEFAULT: '#0284C7', // sky-600
          dark: '#38BDF8', // sky-400
        },
        'base-100': '#FFFFFF',
        'base-200': '#F3F4F6',
        'base-300': '#E5E7EB',
        'base-content': '#000000',
        'dark-base-100': '#000000',
        'dark-base-200': '#111827',
        'dark-base-300': '#1F2937',
        'dark-base-content': '#FFFFFF',
        success: {
          light: '#D1FAE5', // green-100
          DEFAULT: '#047857', // green-700
          dark: '#22C55E', // green-500
        },
        error: {
          light: '#FEE2E2', // red-100
          DEFAULT: '#B91C1C', // red-700
          dark: '#EF4444', // red-500
        },
        warning: {
          light: '#FEF3C7', // amber-100
          DEFAULT: '#D97706', // amber-600
          dark: '#FBBF24', // amber-400
        },
        info: {
          light: '#DBEAFE', // blue-100
          DEFAULT: '#0891B2', // cyan-600
          dark: '#22D3EE', // cyan-400
        },
      },
    },
  },
  plugins: [],
};