import './globals.css'
import type { Metadata, Viewport } from 'next'
import { AuthProvider } from '@/contexts/AuthContext'
import ClientPageWrapper from '@/components/layout/ClientPageWrapper'

export const metadata: Metadata = {
	title: 'Student Platform',
	description: 'Tutoring Platform - Student App',
}

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
 			<html lang="it">
                <body className="min-h-screen bg-white flex flex-col">
                    <AuthProvider>
                        <ClientPageWrapper>
                            {children}
                        </ClientPageWrapper>
                    </AuthProvider>
 				</body>
 			</html>
	)
}
