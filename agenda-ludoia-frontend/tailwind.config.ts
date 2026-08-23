import type { Config } from 'tailwindcss';

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#004870',
        'primary-container': '#006194',
        'primary-fixed': '#cce5ff',
        'primary-fixed-dim': '#93ccff',
        'on-primary': '#ffffff',
        'on-primary-container': '#b2d9ff',
        'on-primary-fixed': '#001d31',

        secondary: '#006c49',
        'secondary-container': '#9af2c5',
        'secondary-fixed': '#9df4c8',
        'on-secondary': '#ffffff',
        'on-secondary-container': '#0c714d',

        tertiary: '#623c00',
        'tertiary-container': '#825100',
        'tertiary-fixed': '#ffddb8',

        surface: '#f7f9fb',
        'surface-dim': '#d8dadc',
        'surface-bright': '#f7f9fb',
        'surface-variant': '#e0e3e5',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f2f4f6',
        'surface-container': '#eceef0',
        'surface-container-high': '#e6e8ea',
        'surface-container-highest': '#e0e3e5',

        background: '#f7f9fb',
        'on-background': '#191c1e',
        'on-surface': '#191c1e',
        'on-surface-variant': '#40474f',

        outline: '#717880',
        'outline-variant': '#c0c7d0',

        'pain-low': '#22c55e',
        'pain-mid': '#eab308',
        'pain-high': '#ef4444',

        error: '#ba1a1a',
        'error-container': '#ffdad6',
        'on-error': '#ffffff',

        'glass-surface': 'rgba(255, 255, 255, 0.75)',
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'sans-serif'],
        heading: ['Manrope', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
