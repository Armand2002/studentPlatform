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
				primary: { DEFAULT: '#2563eb', foreground: '#ffffff' },
				secondary: { DEFAULT: '#64748b', foreground: '#ffffff' },
				muted: '#f3f4f6',
			},
			borderRadius: {
				lg: '12px',
			},
			boxShadow: {
				card: '0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1)'
			}
		},
	},
	plugins: [],
}

export default config
