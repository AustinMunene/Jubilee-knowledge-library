module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#0f172a',
          900: '#0f172a',
          850: '#1e293b',
        },
        jubilee: {
          red: '#dc2626', // Primary Jubilee red (red-600)
          'red-dark': '#b91c1c', // Darker red for hovers (red-700)
          'red-light': '#ef4444', // Lighter red (red-500)
        },
      },
      fontFamily: {
        sans: ['Futura Bk BT', 'Futura', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      spacing: {
        sidebar: '280px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  plugins: [],
}
