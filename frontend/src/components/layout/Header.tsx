"use client"
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Logo from '@/components/ui/Logo'
import Button from '@/components/ui/Button'

type NavigationProps = Readonly<{ role: 'student' | 'tutor' | 'admin' | null }>

// Landing page navigation (for non-authenticated users)
function LandingNavLinks() {
    return (
        <ul className="flex flex-col md:flex-row md:items-center md:gap-8 gap-4">
            <li>
                <a href="#features" className="text-foreground-secondary hover:text-foreground transition-colors font-medium">
                    Servizi
                </a>
            </li>
            <li>
                <a href="#testimonials" className="text-foreground-secondary hover:text-foreground transition-colors font-medium">
                    Testimonianze
                </a>
            </li>
            <li>
                <a href="#faq" className="text-foreground-secondary hover:text-foreground transition-colors font-medium">
                    FAQ
                </a>
            </li>
            <li>
                <a href="#contact" className="text-foreground-secondary hover:text-foreground transition-colors font-medium">
                    Contatti
                </a>
            </li>
        </ul>
    )
}

// Dashboard navigation (for authenticated users)
function DashboardNavLinks({ role }: NavigationProps) {
    if (!role) return null
    
    if (role === 'student') {
        return (
            <ul className="flex flex-col md:flex-row md:items-center md:gap-6 gap-4">
                <li><Link href="/dashboard/student" className="text-foreground-secondary hover:text-foreground transition-colors">Le mie lezioni</Link></li>
                <li><Link href="/dashboard" className="text-foreground-secondary hover:text-foreground transition-colors">Dashboard</Link></li>
            </ul>
        )
    }
    if (role === 'tutor') {
        return (
            <ul className="flex flex-col md:flex-row md:items-center md:gap-6 gap-4">
                <li><Link href="/dashboard/tutor" className="text-foreground-secondary hover:text-foreground transition-colors">Calendario</Link></li>
                <li><Link href="/dashboard" className="text-foreground-secondary hover:text-foreground transition-colors">Dashboard</Link></li>
            </ul>
        )
    }
    return (
        <ul className="flex flex-col md:flex-row md:items-center md:gap-6 gap-4">
            <li><Link href="/dashboard/admin" className="text-foreground-secondary hover:text-foreground transition-colors">Amministrazione</Link></li>
            <li><Link href="/dashboard" className="text-foreground-secondary hover:text-foreground transition-colors">Dashboard</Link></li>
        </ul>
    )
}

export default function Header() {
    const { user, logout } = useAuth()
    const [open, setOpen] = useState(false)
    const pathname = usePathname()
    const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/register')

    // Hydration guard: evita mismatch SSR/CSR su href dinamici
    const [mounted, setMounted] = useState(false)
    useEffect(() => { setMounted(true) }, [])

	return (
        <header className={isAuthPage ? "sticky top-0 z-40 border-b border-border bg-background" : "sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/90"}>
            <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
				<div className="flex items-center gap-3">
					<Logo size="sm" />
				</div>

                <nav className="hidden md:block">
                    {user ? (
                        <DashboardNavLinks role={user.role} />
                    ) : (
                        <LandingNavLinks />
                    )}
                </nav>

                <div className="hidden md:flex items-center gap-3">
                    {user ? (
                        <>
                            <span className="text-sm text-muted-foreground">{user.email}</span>
                            <Button onClick={logout} variant="outline" size="sm">
                                Logout
                            </Button>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="text-sm text-foreground-muted hover:text-foreground transition-colors">
                                Accedi
                            </Link>
                            <Link href="/register">
                                <Button size="sm">Registrati</Button>
                            </Link>
                        </>
                    )}
                </div>

				<button onClick={() => setOpen(!open)} aria-label="Menu" className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-foreground hover:bg-background-secondary transition-colors">
					<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 6h18M3 12h18M3 18h18" strokeWidth="2" strokeLinecap="round"/></svg>
				</button>
			</div>

			{open && (
				<div className="md:hidden border-t border-border bg-background-secondary">
					<div className="container-responsive py-4 flex flex-col gap-4">
                        {user ? (
                            <DashboardNavLinks role={user.role} />
                        ) : (
                            <LandingNavLinks />
                        )}
						<div className="flex items-center gap-3">
							{user ? (
								<Button onClick={logout} className="flex-1" variant="outline">Logout</Button>
							) : (
								<>
									<Link href="/login" className="flex-1">
										<Button variant="ghost" className="w-full">Accedi</Button>
									</Link>
									<Link href="/register" className="flex-1">
										<Button className="w-full">Registrati</Button>
									</Link>
								</>
							)}
						</div>
					</div>
				</div>
			)}
		</header>
	)
}
