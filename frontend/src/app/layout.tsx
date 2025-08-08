import './globals.css'
import type { Metadata } from 'next'
import Header from '@/components/layout/Header'

export const metadata: Metadata = {
	title: 'Student Platform',
	description: 'Tutoring Platform - Student App',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
			<html lang="it">
				<body className="min-h-screen bg-white">
					<Header />
					<main className="container-responsive py-6">{children}</main>
				</body>
			</html>
	)
}
