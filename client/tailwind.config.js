/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'kebrchacha': {
          'dark': '#121212',
          'darker': '#0a0a0a',
          'gray': '#1a1a1a',
          'green': '#39FF14',
          'gold': '#D4AF37',
          'orange': '#ff6b35',
          'purple': '#9C27B0',
          'blue': '#2196F3',
        },
        'bingo': {
          'b': '#2196F3',
          'i': '#9C27B0', 
          'n': '#FF9800',
          'g': '#4CAF50',
          'o': '#FF5722',
        }
      },
      fontFamily: {
        'sans': ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-glow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      backdropBlur: {
        'xs': '2px',
      },
      boxShadow: {
        'glow-green': '0 0 20px rgba(57, 255, 20, 0.5)',
        'glow-gold': '0 0 20px rgba(212, 175, 55, 0.5)',
        'glow-orange': '0 0 15px rgba(255, 107, 53, 0.5)',
      }
    },
  },
  plugins: [],
}