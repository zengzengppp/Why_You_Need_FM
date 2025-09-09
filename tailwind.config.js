/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'brand-sandy': '#f79d5c',
        'brand-pumpkin': '#f3752b',
        'brand-ghost': '#ededf4',
        'brand-text': '#393E41',
        // CSS variables as custom colors
        'background': 'var(--background)',
        'foreground': 'var(--foreground)',
        'card': 'var(--card)',
        'card-foreground': 'var(--card-foreground)',
        'popover': 'var(--popover)',
        'popover-foreground': 'var(--popover-foreground)',
        'primary': 'var(--primary)',
        'primary-foreground': 'var(--primary-foreground)',
        'secondary': 'var(--secondary)',
        'secondary-foreground': 'var(--secondary-foreground)',
        'muted': 'var(--muted)',
        'muted-foreground': 'var(--muted-foreground)',
        'accent': 'var(--accent)',
        'accent-foreground': 'var(--accent-foreground)',
        'destructive': 'var(--destructive)',
        'border': 'var(--border)',
        'input': 'var(--input)',
        'ring': 'var(--ring)',
        'chart-1': 'var(--chart-1)',
        'chart-2': 'var(--chart-2)',
        'chart-3': 'var(--chart-3)',
        'chart-4': 'var(--chart-4)',
        'chart-5': 'var(--chart-5)',
        'sidebar': 'var(--sidebar)',
        'sidebar-foreground': 'var(--sidebar-foreground)',
        'sidebar-primary': 'var(--sidebar-primary)',
        'sidebar-primary-foreground': 'var(--sidebar-primary-foreground)',
        'sidebar-accent': 'var(--sidebar-accent)',
        'sidebar-accent-foreground': 'var(--sidebar-accent-foreground)',
        'sidebar-border': 'var(--sidebar-border)',
        'sidebar-ring': 'var(--sidebar-ring)',
      },
      borderRadius: {
        'lg': 'var(--radius)',
        'md': 'calc(var(--radius) - 2px)',
        'sm': 'calc(var(--radius) - 4px)',
      },
      animation: {
        'progress': 'progress 10s ease-in-out',
        'typewriter': 'typewriter 3s steps(40, end)',
        'fade-in': 'fadeIn 1.5s ease-in-out',
        'fade-out': 'fadeOut 0.5s ease-in-out forwards',
        'ticker': 'ticker 15s linear infinite',
        'black-to-white': 'blackToWhite 2s ease-in-out forwards',
        'smooth-fade-out': 'smoothFadeOut 0.3s cubic-bezier(0.4, 0, 1, 1) forwards',
        'smooth-fade-in': 'smoothFadeIn 0.5s cubic-bezier(0.2, 0, 0.2, 1) forwards',
        'ceremony-grand-entrance': 'ceremonyGrandEntrance 2s cubic-bezier(0.2, 0, 0.2, 1) forwards',
      },
      keyframes: {
        progress: {
          '0%': { width: '0%' },
          '100%': { width: '100%' }
        },
        typewriter: {
          '0%': { width: '0' },
          '100%': { width: '100%' }
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        ticker: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' }
        },
        blackToWhite: {
          '0%': { background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)' },
          '100%': { background: '#F2F2F2' }
        },
        fadeOut: {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-20px)' }
        },
        smoothFadeOut: {
          '0%': { 
            opacity: '1', 
            transform: 'translateY(0) scale(1)'
          },
          '100%': { 
            opacity: '0', 
            transform: 'translateY(-8px) scale(0.96)'
          }
        },
        smoothFadeIn: {
          '0%': { 
            opacity: '0', 
            transform: 'translateY(12px) scale(0.96)'
          },
          '100%': { 
            opacity: '1', 
            transform: 'translateY(0) scale(1)'
          }
        },
        ceremonyGrandEntrance: {
          '0%': { 
            opacity: '0', 
            transform: 'translateY(40px) scale(0.9)',
            filter: 'blur(4px)'
          },
          '30%': {
            opacity: '0.3',
            transform: 'translateY(25px) scale(0.94)',
            filter: 'blur(2px)'
          },
          '70%': {
            opacity: '0.8',
            transform: 'translateY(8px) scale(0.98)',
            filter: 'blur(0.5px)'
          },
          '100%': { 
            opacity: '1', 
            transform: 'translateY(0) scale(1)',
            filter: 'blur(0px)'
          }
        }
      }
    },
  },
  plugins: [require('@tailwindcss/typography')],
}