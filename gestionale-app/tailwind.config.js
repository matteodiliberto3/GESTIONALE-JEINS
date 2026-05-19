/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        // Surface / canvas
        surface: {
          DEFAULT: 'rgb(var(--surface) / <alpha-value>)',
          raised:  'rgb(var(--surface-raised) / <alpha-value>)',
          sunken:  'rgb(var(--surface-sunken) / <alpha-value>)',
          inset:   'rgb(var(--surface-inset) / <alpha-value>)',
        },
        // Accenti
        brand: {
          50:  '#F5F0FF',
          100: '#EBE0FF',
          200: '#D6C2FF',
          300: '#B79AFF',
          400: '#9B73FF',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
        },
        accent: {
          pink:    '#EC4899',
          fuchsia: '#D946EF',
          cyan:    '#22D3EE',
          emerald: '#10B981',
          amber:   '#F59E0B',
          rose:    '#F43F5E',
        },
        ink: {
          DEFAULT: 'rgb(var(--ink) / <alpha-value>)',
          muted:   'rgb(var(--ink-muted) / <alpha-value>)',
          subtle:  'rgb(var(--ink-subtle) / <alpha-value>)',
        },
        line: {
          DEFAULT: 'rgb(var(--line) / <alpha-value>)',
          strong:  'rgb(var(--line-strong) / <alpha-value>)',
        },
      },
      borderRadius: {
        'xl': '0.875rem',
        '2xl': '1.125rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'soft':   '0 1px 2px rgba(0,0,0,.04), 0 8px 24px -8px rgba(0,0,0,.08)',
        'raised': '0 4px 12px -4px rgba(0,0,0,.18), 0 24px 48px -12px rgba(0,0,0,.25)',
        'glow-violet': '0 0 0 1px rgba(139,92,246,.35), 0 12px 32px -8px rgba(139,92,246,.45)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,.06)',
        'panel': '0 1px 2px rgba(0,0,0,.4), 0 20px 50px -20px rgba(0,0,0,.7)',
      },
      backgroundImage: {
        'grad-violet':  'linear-gradient(135deg,#8B5CF6 0%,#D946EF 100%)',
        'grad-cyan':    'linear-gradient(135deg,#22D3EE 0%,#8B5CF6 100%)',
        'grad-pink':    'linear-gradient(135deg,#EC4899 0%,#F59E0B 100%)',
        'grad-emerald': 'linear-gradient(135deg,#10B981 0%,#22D3EE 100%)',
        'grad-promo':   'radial-gradient(120% 120% at 0% 0%, #8B5CF6 0%, #4C1D95 40%, #0B0B0F 100%)',
      },
      keyframes: {
        'fade-in':  { '0%': { opacity: 0, transform: 'translateY(4px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        'pulse-soft': { '0%,100%': { opacity: 1 }, '50%': { opacity: .55 } },
      },
      animation: {
        'fade-in':  'fade-in .25s ease-out both',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
