window.tailwind = window.tailwind || {};
window.tailwind.config = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
        heading: ['Montserrat', 'sans-serif'],
      },
      colors: {
        sepBurgundy: '#691C32',
        sepBurgundyLight: '#9E2A4B',
        sepBurgundyDark: '#521526',
        sepBeige: '#F4F6F9',
        sepBeigeDark: '#E2E8F0',
        sepGold: '#BC955C',
        sepGoldDark: '#9A7B4C',
        sepLightGray: '#F8FAFC',
        sepGreen: '#285C4D',
        sepGreenDark: '#1E453A',
        // New role colors
        sepBlue: '#1E3A8A', // Indigo/Oceano for Alumnos
        sepBlueLight: '#3B82F6',
        sepBlueDark: '#1E3A8A', // mapped same for simplicity, but let's use tailwind blue-900
        sepTeal: '#0F766E', // Teal for Tutores
        sepTealLight: '#14B8A6',
        sepTealDark: '#115E59'
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'premium': '0 10px 40px -10px rgba(0, 0, 0, 0.15)',
        'premium-hover': '0 20px 40px -10px rgba(0, 0, 0, 0.2)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-inset': 'inset 0 0 0 1px rgba(255, 255, 255, 0.4), 0 8px 32px 0 rgba(0, 0, 0, 0.05)',
        'glow': '0 0 20px rgba(188, 149, 92, 0.4)',
        'glow-red': '0 0 20px rgba(220, 38, 38, 0.2)',
        'glow-blue': '0 0 25px rgba(59, 130, 246, 0.3)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'progress-fill': 'progressFill 1.5s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        progressFill: {
          '0%': { width: '0%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    }
  }
}
