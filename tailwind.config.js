/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        startupGreen: '#4CAF50',
        startupOrange: '#FF9800',
        startupBlue: '#2196F3',
        startupYellow: '#FFC107',
        startupPurple: '#9C27B0',
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 1.5s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(255, 255, 255, 0.2)' },
          '100%': { boxShadow: '0 0 15px rgba(255, 255, 255, 0.6)' },
        }
      }
    },
  },
  plugins: [],
}
