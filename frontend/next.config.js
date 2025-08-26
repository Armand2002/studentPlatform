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
		typedRoutes: true,
		optimizePackageImports: ['lucide-react', '@headlessui/react', '@heroicons/react'],
		optimizeCss: true,
		optimizeServerReact: true,
	},
	images: {
		formats: ['image/webp', 'image/avif'],
		deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
		minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
		remotePatterns: [
			{ protocol: 'https', hostname: '**' }
		]
	},
	compiler: {
		removeConsole: process.env.NODE_ENV === 'production'
	},
	// Headers for performance and security
	async headers() {
		return [
			{
				source: '/(.*)',
				headers: [
					{
						key: 'X-DNS-Prefetch-Control',
						value: 'on'
					},
					{
						key: 'Strict-Transport-Security',
						value: 'max-age=31536000; includeSubDomains'
					},
					{
						key: 'X-Frame-Options',
						value: 'SAMEORIGIN'
					},
					{
						key: 'X-Content-Type-Options',
						value: 'nosniff'
					},
					{
						key: 'Referrer-Policy',
						value: 'origin-when-cross-origin'
					}
				]
			},
			{
				source: '/fonts/(.*)',
				headers: [
					{
						key: 'Cache-Control',
						value: 'public, max-age=31536000, immutable'
					}
				]
			}
		]
	}
};

module.exports = withPWA(nextConfig);
