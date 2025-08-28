import './globals.css'
import type { Metadata, Viewport } from 'next'
import { AuthProvider } from '@/contexts/AuthContext'
import ClientPageWrapper from '@/components/layout/ClientPageWrapper'

export const metadata: Metadata = {
	title: 'Student Platform',
	description: 'Tutoring Platform - Student App',
    manifest: '/manifest.webmanifest',
}

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    themeColor: '#0ea5e9',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
   return (
           <html lang="it">
                <body className="min-h-screen bg-background flex flex-col">
                    <AuthProvider>
                        <ClientPageWrapper>
                            {/* PWA Service Worker Registration */}
                            <script dangerouslySetInnerHTML={{ __html: `
                                if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                                  window.addEventListener('load', () => {
                                    navigator.serviceWorker.register('/sw.js').catch(()=>{});
                                  });
                                }
                              ` }} />
                            {children}
                        </ClientPageWrapper>
                    </AuthProvider>
                </body>
           </html>
   )
}
