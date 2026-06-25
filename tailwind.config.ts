import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#8B1A1A',
          'red-light': '#B22222',
          'red-dark': '#5C0000',
          gold: '#C9A84C',
          'gold-light': '#E8C97E',
          'gold-dark': '#9B7D2A',
          green: '#1B5E20',
          'green-light': '#2E7D32',
          cream: '#FFF9F0',
          dark: '#1A0A0A',
        },
        admin: {
          bg: '#0F0F0F',
          card: '#1A1A1A',
          border: '#2A2A2A',
          text: '#E5E5E5',
          muted: '#888888',
        }
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        accent: ['Cormorant Garamond', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #8B1A1A 0%, #C9A84C 100%)',
        'gold-gradient': 'linear-gradient(135deg, #C9A84C 0%, #E8C97E 50%, #9B7D2A 100%)',
        'dark-gradient': 'linear-gradient(180deg, #1A0A0A 0%, #2D1010 100%)',
      },
      boxShadow: {
        'brand': '0 4px 20px rgba(139, 26, 26, 0.25)',
        'gold': '0 4px 20px rgba(201, 168, 76, 0.25)',
        'card': '0 2px 12px rgba(0,0,0,0.08)',
        'card-hover': '0 8px 30px rgba(0,0,0,0.15)',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}
export default config
