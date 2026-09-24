/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        base: '#0a0a0f',
        'glass-bg': 'rgba(255,255,255,0.06)',
        'glass-border': 'rgba(255,255,255,0.12)',
        'accent-primary': '#a855f7',
        'accent-secondary': '#f59e0b',
        'accent-success': '#10b981',
        'text-primary': '#f8fafc',
        'text-muted': 'rgba(255,255,255,0.45)',
      },
    },
  },
  plugins: [],
}
