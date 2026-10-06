/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        space: {
          950: '#050912',
          900: '#0a101d',
          850: '#0d1527',
          800: '#111d35',
          750: '#162442',
          700: '#1e3258',
          600: '#2a4473',
          border: '#1e2c48',
          'border-light': '#2a3e66',
        },
        mission: {
          nominal: '#10b981',
          'nominal-bg': 'rgba(16, 185, 129, 0.12)',
          warning: '#f59e0b',
          'warning-bg': 'rgba(245, 158, 11, 0.12)',
          critical: '#ef4444',
          'critical-bg': 'rgba(239, 68, 68, 0.12)',
          info: '#0ea5e9',
          'info-bg': 'rgba(14, 165, 233, 0.12)',
          ai: '#8b5cf6',
          'ai-bg': 'rgba(139, 92, 246, 0.12)',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
