"use client"
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Header from '@/components/layout/Header'
import Link from 'next/link'

type ClientPageWrapperProps = Readonly<{ children: React.ReactNode }>

export default function ClientPageWrapper({ children }: ClientPageWrapperProps) {
  const pathname = usePathname()
  const isAuth = pathname?.startsWith('/login') || pathname?.startsWith('/register')
  const isHome = pathname === '/'
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const profileHref = mounted && typeof window !== 'undefined' && window?.localStorage?.getItem('access_token') ? '/dashboard' : '/login'

  return (
    <div className={'min-h-screen w-full bg-background pb-16 sm:pb-0'}>
      <main className={`flex-1 w-full ${isAuth || isHome ? 'py-0' : 'py-6'}`}>
        <Header />
        {children}
      </main>
      {/* Bottom navigation on mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 block border-t border-border bg-background-secondary backdrop-blur-md sm:hidden">
        <ul className="flex items-stretch justify-around text-xs">
          <li>
            <Link href="/" className="flex h-12 flex-col items-center justify-center px-3 text-foreground-muted hover:text-primary transition-colors">
              <span>Home</span>
            </Link>
          </li>
          <li>
            <Link href="/packages" className="flex h-12 flex-col items-center justify-center px-3 text-foreground-muted hover:text-primary transition-colors">
              <span>Pacchetti</span>
            </Link>
          </li>
          <li>
            <Link href="/dashboard" className="flex h-12 flex-col items-center justify-center px-3 text-foreground-muted hover:text-primary transition-colors">
              <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link href={profileHref} className="flex h-12 flex-col items-center justify-center px-3 text-foreground-muted hover:text-primary transition-colors">
              <span>Profilo</span>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  )
}


