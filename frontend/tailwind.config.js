/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        lavender: {
          50: '#fdfbfe',
          100: '#f8f2fe',
          200: '#f1e5fd',
          300: '#e5d0fa',
          400: '#d1b0f5',
          500: '#b884ee',
          600: '#9b54e3',
          700: '#7c3aed',
          800: '#6528cb',
          900: '#5220a7',
          950: '#2d1847',
        },
        midnight: {
          950: '#080612',
          900: '#0f0c1e',
          850: '#16122c',
          800: '#1f183c',
          700: '#2f2459',
          600: '#46357e',
          500: '#6b52b7',
          400: '#a78bfa',
          300: '#c4b5fd',
          200: '#ddd6fe',
          100: '#ede9fe',
          50: '#f5f3ff',
        },
        civic: {
          surface: '#f8fafc',
          card: '#ffffff',
          border: '#e2e8f0',
          dark: '#0f172a',
          accent: '#2563eb',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)',
        'card': '0 4px 6px -1px rgb(0 0 0 / 0.04), 0 2px 4px -2px rgb(0 0 0 / 0.03)',
        'elevated': '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.03)',
      }
    },
  },
  plugins: [],
}

