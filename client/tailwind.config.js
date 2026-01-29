/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      // 1. CUSTOM TYPOGRAPHY: Defining the Cyber Hierarchy
      fontFamily: {
        display: ['Orbitron', 'sans-serif'], // For high-impact headers
        sans: ['Rajdhani', 'sans-serif'],    // For readable body text
        mono: ['JetBrains Mono', 'monospace'], // For terminal data and logs
      },
      // 2. SOFTENED COLOR PALETTE: Fixing the eye-strain
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        nexus: {
          cyan: '#06b6d4',
          blue: '#3b82f6',
          slate: '#0f172a',
          softWhite: '#cbd5e1', // Softer text for Dark Mode
          softBlack: '#1e293b', // Softer text for Light Mode
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      // 3. FLUID TRANSITIONS: Adding "Breathe" animations
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
    }
  },
  plugins: [require("tailwindcss-animate")],
};