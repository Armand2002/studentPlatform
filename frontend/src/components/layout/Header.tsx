"use client"
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'
import { usePathname } from 'next/navigation'

interface RoleAwareNavLinksProps {
    role: 'student' | 'tutor' | 'admin' | null
}

function RoleAwareNavLinks({ role }: RoleAwareNavLinksProps) {
    if (!role) {
        return null
    }
    if (role === 'student') {
        return (
            <ul className="flex flex-col md:flex-row md:items-center md:gap-6 gap-4">
                <li><Link href="/dashboard/student" className="text-gray-700 hover:text-gray-900">Le mie lezioni</Link></li>
                <li><Link href="/dashboard" className="text-gray-700 hover:text-gray-900">Dashboard</Link></li>
            </ul>
        )
    }
    if (role === 'tutor') {
        return (
            <ul className="flex flex-col md:flex-row md:items-center md:gap-6 gap-4">
                <li><Link href="/dashboard/tutor" className="text-gray-700 hover:text-gray-900">Calendario</Link></li>
                <li><Link href="/dashboard" className="text-gray-700 hover:text-gray-900">Dashboard</Link></li>
            </ul>
        )
    }
    return (
        <ul className="flex flex-col md:flex-row md:items-center md:gap-6 gap-4">
            <li><Link href="/dashboard/admin" className="text-gray-700 hover:text-gray-900">Amministrazione</Link></li>
            <li><Link href="/dashboard" className="text-gray-700 hover:text-gray-900">Dashboard</Link></li>
        </ul>
    )
}

export default function Header() {
    const { user, logout } = useAuth()
    const [open, setOpen] = useState(false)
    const pathname = usePathname()
    const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/register')

	return (
        <header className={isAuthPage ? "sticky top-0 z-40 border-b bg-white" : "sticky top-0 z-40 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60"}>
            <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
				<div className="flex items-center gap-3">
					<Link href="/" className="flex items-center gap-2">
						<span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary-100">
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M4 19V10C4 6.686 6.686 4 10 4H14C17.314 4 20 6.686 20 10V19" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round"/>
								<path d="M2 19H22" stroke="#1d4ed8" strokeWidth="1.8" strokeLinecap="round"/>
							</svg>
						</span>
						<span className="font-semibold text-gray-900">Student Platform</span>
					</Link>
				</div>

                <nav className="hidden md:block">
                    <RoleAwareNavLinks role={user ? user.role : null} />
                </nav>

                <div className="hidden md:flex items-center gap-3">
                    {user ? (
                        <>
                            <span className="text-sm text-gray-600">{user.email}</span>
                            <button onClick={logout} className="inline-flex h-9 items-center rounded-md bg-primary-500 px-4 text-white hover:bg-primary-600">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="text-sm text-gray-700 hover:text-gray-900">Accedi</Link>
                            <Link href="/register" className="inline-flex h-9 items-center rounded-md bg-primary-500 px-4 text-white hover:bg-primary-600">Registrati</Link>
                        </>
                    )}
                </div>

				<button onClick={() => setOpen(!open)} aria-label="Menu" className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-200">
					<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 6h18M3 12h18M3 18h18" strokeWidth="2" strokeLinecap="round"/></svg>
				</button>
			</div>

			{open && (
				<div className="md:hidden border-t bg-white">
					<div className="container-responsive py-4 flex flex-col gap-4">
                        <RoleAwareNavLinks role={user ? user.role : null} />
						<div className="flex items-center gap-3">
							{user ? (
								<button onClick={logout} className="inline-flex h-10 flex-1 items-center justify-center rounded-md bg-primary-500 px-4 text-white hover:bg-primary-600">Logout</button>
							) : (
								<>
									<Link href="/login" className="flex-1 text-center h-10 inline-flex items-center justify-center rounded-md border border-gray-300">Accedi</Link>
									<Link href="/register" className="flex-1 text-center h-10 inline-flex items-center justify-center rounded-md bg-primary-500 text-white">Registrati</Link>
								</>
							)}
						</div>
					</div>
				</div>
			)}
		</header>
	)
}
