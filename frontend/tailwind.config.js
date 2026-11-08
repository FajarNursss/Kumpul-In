/** @type {import('tailwindcss').Config} */
import forms from '@tailwindcss/forms';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#326273',      // Deep Ocean Teal
          darkHover: '#264d5b',
          teal: '#5c9ead',      // Soft Seafoam Teal
          tealLight: '#eef6f8',
          coral: '#e39774',     // Warm Terracotta / Coral
          coralHover: '#d58560',
          coralLight: '#fdf4f0',
          light: '#eeeeee',     // Soft Neutral Light
          surface: '#f8fafc',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [
    forms,
  ],
}
