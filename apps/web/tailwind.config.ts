import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/liquidos-ui/src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'live-neon': '#A3FF00',
        'glass-white': 'rgba(255,255,255,0.10)',
      },
      borderRadius: {
        'ios-xl': '2.5rem',
        'ios-2xl': '3rem',
      },
      backdropBlur: {
        'ios': '40px',
      },
      animation: {
        'spring-up': 'springUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
      keyframes: {
        springUp: {
          '0%': { transform: 'translateY(20px) scale(0.95)', opacity: '0' },
          '100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
