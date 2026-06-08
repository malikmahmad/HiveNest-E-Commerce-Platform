/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#ff4785', light: '#ff6b9d', dark: '#e0356e', 50: '#fff0f5', 100: '#ffd6e7' },
        dark: { DEFAULT: '#1a1a1a', 50: '#f5f5f5', 100: '#e0e0e0', 200: '#bdbdbd', 300: '#9e9e9e', 400: '#757575', 500: '#616161', 600: '#424242', 700: '#303030', 800: '#212121', 900: '#1a1a1a' },
      },
      fontFamily: { sans: ['Poppins', 'system-ui', 'sans-serif'] },
      screens: { xs: '475px' },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
        'bounce-sm': 'bounceSm 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        slideRight: { '0%': { transform: 'translateX(-20px)', opacity: '0' }, '100%': { transform: 'translateX(0)', opacity: '1' } },
        bounceSm: { '0%, 100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.1)' } },
      },
    },
  },
  plugins: [],
};
