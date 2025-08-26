import type { Config } from 'tailwindcss'

const config: Config = {
	content: [
		'./src/pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/components/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/app/**/*.{js,ts,jsx,tsx,mdx}',
	],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.25rem',
        lg: '2rem'
      },
      screens: {
        '2xl': '1400px'
      }
    },
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
		extend: {
			colors: {
				primary: {
					50: '#eff6ff',
					100: '#dbeafe',
					200: '#bfdbfe',
					300: '#93c5fd',
					400: '#60a5fa',
					500: '#3b82f6',
					600: '#2563eb',
					700: '#1d4ed8',
					800: '#1e40af',
					900: '#1e3a8a',
					DEFAULT: '#3b82f6',
					foreground: '#ffffff'
				},
				secondary: { 
					DEFAULT: '#8b5cf6', 
					foreground: '#ffffff' 
				},
				muted: {
					DEFAULT: 'rgb(var(--muted))',
					foreground: 'rgb(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: '#06b6d4',
					foreground: '#ffffff'
				},
				// Dark Blue Theme Colors
				background: {
					DEFAULT: 'rgb(var(--background))',
					secondary: 'rgb(var(--background-secondary))',
					tertiary: 'rgb(var(--background-tertiary))'
				},
				foreground: {
					DEFAULT: 'rgb(var(--foreground))',
					secondary: 'rgb(var(--foreground-secondary))',
					muted: 'rgb(var(--foreground-muted))'
				},
				card: {
					DEFAULT: 'rgb(var(--card))',
					foreground: 'rgb(var(--card-foreground))'
				},
				border: 'rgb(var(--border))',
				input: 'rgb(var(--input))',
				ring: 'rgb(var(--ring))',
			},
			borderRadius: {
				lg: '12px',
				md: '8px',
				sm: '4px',
			},
			boxShadow: {
				card: '0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1)',
				glass: '0 8px 32px rgba(31, 38, 135, 0.37)',
				spotlight: '0 0 0 1px rgba(255, 255, 255, 0.05), 0 1px 0 0 rgba(255, 255, 255, 0.05)',
			},
			backdropBlur: {
				xs: '2px',
			},
			animation: {
				'fade-in': 'fadeIn 0.5s ease-in-out',
				'slide-in': 'slideIn 0.3s ease-out',
				'bounce-subtle': 'bounceSubtle 2s infinite',
			},
			keyframes: {
				fadeIn: {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' },
				},
				slideIn: {
					'0%': { transform: 'translateY(10px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' },
				},
				bounceSubtle: {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-5px)' },
				},
			},
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif'],
			},
		},
	},
	plugins: [
		require('@tailwindcss/forms'),
		require('@tailwindcss/typography'),
	],
}

export default config
