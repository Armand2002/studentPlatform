/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  // Disabilita PWA in sviluppo per evitare errori GenerateSW multipli
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
})

const nextConfig = {
	reactStrictMode: true,
	experimental: {
		typedRoutes: true
	},
	images: {
		remotePatterns: [
			{ protocol: 'https', hostname: '**' }
		]
	}
};

module.exports = withPWA(nextConfig);
