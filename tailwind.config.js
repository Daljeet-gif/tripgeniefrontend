import defaultTheme from 'tailwindcss/defaultTheme'

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', ...defaultTheme.fontFamily.serif],
        body:    ['"DM Sans"',          ...defaultTheme.fontFamily.sans],
      },
      colors: {
        gold:  '#c99b5a',
        cream: '#f5f0e8',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)'    },
        },
      },
      animation: {
        fadeUp: 'fadeUp 0.5s ease both',
      },
    },
  },
  plugins: [],
}