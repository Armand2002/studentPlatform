"use client"
import { usePathname } from 'next/navigation'
import Header from '@/components/layout/Header'

type ClientPageWrapperProps = Readonly<{ children: React.ReactNode }>

export default function ClientPageWrapper({ children }: ClientPageWrapperProps) {
  const pathname = usePathname()
  const isAuth = pathname?.startsWith('/login') || pathname?.startsWith('/register')
  const isHome = pathname === '/'

  return (
    <div className={'min-h-screen w-full bg-white'}>
      <main className={`flex-1 w-full ${isAuth || isHome ? 'py-0' : 'py-6'}`}>
        <Header />
        {children}
      </main>
    </div>
  )
}


