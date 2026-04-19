/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'om-purple': '#8b5cf6',
        'om-indigo': '#6366f1',
        'om-dark': '#1e1b4b',
        'om-gold': '#f59e0b',
        'om-bg': '#faf5ff',
        'om-bg-end': '#e0e7ff',
      },
      borderRadius: {
        'om': '12px',
        'om-lg': '16px',
      },
      fontSize: {
        'om-body': ['14px', { lineHeight: '1.5' }],
        'om-heading': ['20px', { lineHeight: '1.4' }],
        'om-large': ['24px', { lineHeight: '1.3' }],
      },
      minHeight: {
        'touch': '48px',
      },
      minWidth: {
        'touch': '48px',
      },
    },
  },
  plugins: [],
}
