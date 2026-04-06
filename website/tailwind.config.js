/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Stitch Design System - Harvest Horizon
        primary: '#006c49',
        'primary-container': '#10b981',
        'primary-fixed': '#6ffbbe',
        'primary-fixed-dim': '#4edea3',
        'on-primary': '#ffffff',
        'on-primary-container': '#00422b',
        'on-primary-fixed': '#002113',
        'on-primary-fixed-variant': '#005236',

        secondary: '#855300',
        'secondary-container': '#fea619',
        'secondary-fixed': '#ffe08f',
        'secondary-fixed-dim': '#ffb95f',
        'on-secondary': '#ffffff',
        'on-secondary-container': '#684000',
        'on-secondary-fixed': '#2a1700',
        'on-secondary-fixed-variant': '#653e00',

        tertiary: '#b91a24',
        'tertiary-container': '#ff7a73',
        'tertiary-fixed': '#ffdad7',
        'tertiary-fixed-dim': '#ffb3ad',
        'on-tertiary': '#ffffff',
        'on-tertiary-container': '#79000e',
        'on-tertiary-fixed': '#410004',
        'on-tertiary-fixed-variant': '#930013',

        error: '#ba1a1a',
        'error-container': '#ffdad6',
        'on-error': '#ffffff',
        'on-error-container': '#93000a',

        // Surfaces
        background: '#f8f9ff',
        surface: '#f8f9ff',
        'surface-bright': '#f8f9ff',
        'surface-container': '#e5eeff',
        'surface-container-low': '#eef4ff',
        'surface-container-lowest': '#ffffff',
        'surface-container-high': '#dfe9fa',
        'surface-container-highest': '#d9e3f4',
        'surface-dim': '#d1dbec',
        'surface-variant': '#d9e3f4',
        'surface-tint': '#006c49',

        // Text
        'on-background': '#121c28',
        'on-surface': '#121c28',
        'on-surface-variant': '#3c4a42',
        'on-primary-fixed-variant': '#005236',
        'outline': '#6c7a71',
        'outline-variant': '#bbcabf',
        'inverse-surface': '#27313e',
        'inverse-on-surface': '#eaf1ff',
        'inverse-primary': '#4edea3',

        // Legacy aliases for gradual migration
        'kc-green': '#006c49',
        'kc-light': '#10b981',
        'kc-gold': '#fea619',
        'kc-earth': '#855300',

        // Agriculture Theme Colors
        'agri-green': '#4A7C23',
        'agri-green-dark': '#2E4D14',
        'agri-green-light': '#6B9B3D',
        'agri-brown': '#8B7355',
        'agri-brown-light': '#C4A77D',
        'agri-sky': '#87CEEB',
        'agri-sky-dark': '#5BA3C6',
        'agri-gold': '#D4A017',
        'agri-amber': '#FFB347',
      },
      fontFamily: {
        // Stitch fonts
        headline: ['Plus Jakarta Sans', 'sans-serif'],
        body: ['Be Vietnam Pro', 'Inter', 'sans-serif'],
        label: ['Be Vietnam Pro', 'Inter', 'sans-serif'],
        // Legacy
        sans: ['Be Vietnam Pro', 'Inter', 'system-ui', 'sans-serif'],
        punjabi: ['Noto Sans Gurmukhi', 'sans-serif'],
      },
      fontSize: {
        // Stitch typography scale
        'display-large': ['57px', { lineHeight: '64px', letterSpacing: '-0.25px' }],
        'display-medium': ['45px', { lineHeight: '52px', letterSpacing: '0px' }],
        'display-small': ['36px', { lineHeight: '44px', letterSpacing: '0px' }],
        'headline-large': ['32px', { lineHeight: '40px', letterSpacing: '0px' }],
        'headline-medium': ['28px', { lineHeight: '36px', letterSpacing: '0px' }],
        'headline-small': ['24px', { lineHeight: '32px', letterSpacing: '0px' }],
        'title-large': ['22px', { lineHeight: '28px', letterSpacing: '0px' }],
        'title-medium': ['16px', { lineHeight: '24px', letterSpacing: '0.15px' }],
        'title-small': ['14px', { lineHeight: '20px', letterSpacing: '0.1px' }],
        'body-large': ['16px', { lineHeight: '24px', letterSpacing: '0.5px' }],
        'body-medium': ['14px', { lineHeight: '20px', letterSpacing: '0.25px' }],
        'body-small': ['12px', { lineHeight: '16px', letterSpacing: '0.4px' }],
        'label-large': ['14px', { lineHeight: '20px', letterSpacing: '0.1px' }],
        'label-medium': ['12px', { lineHeight: '16px', letterSpacing: '0.5px' }],
        'label-small': ['11px', { lineHeight: '16px', letterSpacing: '0.5px' }],
      },
      borderRadius: {
        // Stitch border radius
        'card': '1rem',
        'dialog': '2rem',
        'shape': '3rem',
        'full': '9999px',
      },
      spacing: {
        // Stitch spacing scale
        '18': '4.5rem', // 72px
        '20': '5rem', // 80px
        '21': '5.25rem', // 84px
        '22': '5.5rem', // 88px
        '23': '5.75rem', // 92px
        '24': '6rem', // 96px
        '25': '6.25rem', // 100px
        '26': '6.5rem', // 104px
        '27': '6.75rem', // 108px
        '28': '7rem', // 112px
        '29': '7.25rem', // 116px
        '30': '7.5rem', // 120px
      },
      boxShadow: {
        // Ambient shadow (tinted, not black)
        'ambient': '0 8px 32px rgba(18, 28, 40, 0.06)',
        'ambient-lg': '0 12px 48px rgba(18, 28, 40, 0.08)',
        'glow': '0 0 24px rgba(16, 185, 129, 0.15)',
        'gold-glow': '0 0 24px rgba(254, 166, 25, 0.15)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-fire': 'pulse-fire 2s ease-in-out infinite',
        'gradient-x': 'gradient-x 3s ease infinite',
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-fire': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(1.1)' },
        },
        'gradient-x': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
