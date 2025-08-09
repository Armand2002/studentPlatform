"use client"
import { usePathname } from 'next/navigation'
import Header from '@/components/layout/Header'

export default function ClientPageWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuth = pathname?.startsWith('/login') || pathname?.startsWith('/register')

  return (
    <div className={isAuth ? 'min-h-screen w-full bg-gradient-to-br from-primary-800 via-primary-600 to-primary-400' : 'min-h-screen w-full bg-white'}>
      <Header />
      <main className={isAuth ? 'flex-1 py-0' : 'flex-1 py-6'}>
        {children}
      </main>
    </div>
  )
}


