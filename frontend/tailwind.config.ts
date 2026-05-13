import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'primary-dark': '#0A0C10',
        surface: {
          DEFAULT: '#13161E',
          50: '#f0f2f5',
          100: '#d9dce1',
          200: '#b3b8c2',
          300: '#8d94a3',
          400: '#677084',
          500: '#484F58',
          600: '#3a4048',
          700: '#2c3138',
          800: '#1e2128',
          900: '#13161E',
          950: '#0A0C10',
        },
        border: {
          DEFAULT: '#21262D',
          light: '#30363D',
        },
        accent: {
          DEFAULT: '#E8B84B',
          50: '#fef7e8',
          100: '#fcecc5',
          200: '#f9d98e',
          300: '#f5c657',
          400: '#E8B84B',
          500: '#d4a232',
          600: '#b88a28',
          700: '#9a721f',
          800: '#7c5a16',
          900: '#5e420d',
        },
        success: {
          DEFAULT: '#3FB950',
          light: '#4cd964',
        },
        danger: {
          DEFAULT: '#F85149',
          light: '#ff6b6b',
        },
        warning: {
          DEFAULT: '#D29922',
          light: '#e8b84b',
        },
        info: {
          DEFAULT: '#58A6FF',
          light: '#79b8ff',
        },
        'text-primary': '#E6EDF3',
        'text-secondary': '#8B949E',
        'text-muted': '#484F58',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'spin-slow': 'spin 2s linear infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};

export default config;
