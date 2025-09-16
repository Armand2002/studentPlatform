"use client"
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Logo from '@/components/ui/Logo'
import Button from '@/components/ui/Button'
import MaterialsLink from '@/components/materials/MaterialsLink'

type NavigationProps = Readonly<{ role: 'student' | 'tutor' | 'admin' | null }>

// Landing page navigation (for non-authenticated users)
function LandingNavLinks() {
    return (
        <ul className="flex flex-col md:flex-row md:items-center md:gap-8 gap-4">
            <li>
                <Link href="/doposcuola" className="text-foreground-secondary hover:text-foreground transition-colors font-medium">
                    Doposcuola
                </Link>
            </li>
            <li>
                <Link href="/ripetizioni" className="text-foreground-secondary hover:text-foreground transition-colors font-medium">
                    Ripetizioni
                </Link>
            </li>
            {/* Desktop dropdown */}
            <li className="relative group hidden md:block">
                <Link href="/preparazione-test" className="text-foreground-secondary hover:text-foreground transition-colors font-medium cursor-pointer">
                    Preparazione per i Test
                </Link>
                {/* Dropdown menu */}
                <div className="absolute left-0 mt-2 w-64 bg-background border border-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2">
                        <Link href="/test-forze-ordine" className="block px-4 py-2 text-sm text-foreground-secondary hover:text-foreground hover:bg-background-secondary transition-colors">
                            Forze dell'Ordine
                        </Link>
                        <Link href="/test-universitari" className="block px-4 py-2 text-sm text-foreground-secondary hover:text-foreground hover:bg-background-secondary transition-colors">
                            Test Universitari
                        </Link>
                    </div>
                </div>
            </li>
            {/* Mobile expanded items */}
            <li className="md:hidden">
                <Link href="/preparazione-test" className="text-foreground-secondary hover:text-foreground transition-colors font-medium">
                    Preparazione per i Test
                </Link>
            </li>
            <li className="md:hidden ml-4">
                <Link href="/test-forze-ordine" className="text-foreground-muted hover:text-foreground transition-colors text-sm">
                    → Forze dell'Ordine
                </Link>
            </li>
            <li className="md:hidden ml-4">
                <Link href="/test-universitari" className="text-foreground-muted hover:text-foreground transition-colors text-sm">
                    → Test Universitari
                </Link>
            </li>
            <li>
                <MaterialsLink 
                    variant="header" 
                />
            </li>
            <li>
                <Link href="/contact" className="text-foreground-secondary hover:text-foreground transition-colors font-medium">
                    Contatti
                </Link>
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
                <li>
                    <MaterialsLink 
                        variant="header"
                    />
                </li>
            </ul>
        )
    }
    if (role === 'tutor') {
        return (
            <ul className="flex flex-col md:flex-row md:items-center md:gap-6 gap-4">
                <li><Link href="/dashboard/tutor" className="text-foreground-secondary hover:text-foreground transition-colors">Calendario</Link></li>
                <li><Link href="/dashboard" className="text-foreground-secondary hover:text-foreground transition-colors">Dashboard</Link></li>
                <li>
                    <MaterialsLink 
                        variant="header"
                    />
                </li>
            </ul>
        )
    }
    return (
        <ul className="flex flex-col md:flex-row md:items-center md:gap-6 gap-4">
            <li><Link href="/dashboard/admin" className="text-foreground-secondary hover:text-foreground transition-colors">Amministrazione</Link></li>
            <li><Link href="/dashboard" className="text-foreground-secondary hover:text-foreground transition-colors">Dashboard</Link></li>
            <li>
                <MaterialsLink 
                    variant="header"
                />
            </li>
        </ul>
    )
}

export default function Header() {
    const { user, logout } = useAuth()
    const [open, setOpen] = useState(false)
    const pathname = usePathname()
    const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/register')

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
