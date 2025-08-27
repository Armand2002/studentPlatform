"use client"
import { Fragment } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Menu, Transition } from '@headlessui/react'
import { 
  Bars3Icon,
  BellIcon,
  ChevronDownIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

interface DashboardHeaderProps {
  onMenuClick: () => void
  user: {
    id: number
    email: string
    role: 'student' | 'tutor' | 'admin'
  }
}

function generateBreadcrumbs(pathname: string) {
  const segments = pathname.split('/').filter(Boolean)
  const breadcrumbs = []

  // Always start with Dashboard
  breadcrumbs.push({ name: 'Dashboard', href: '/dashboard' })

  if (segments.length > 1) {
    const role = segments[1] // student, tutor, admin
    const roleDisplayName = {
      student: 'Studente',
      tutor: 'Tutor', 
      admin: 'Admin'
    }[role] || role

    breadcrumbs.push({ 
      name: roleDisplayName, 
      href: `/dashboard/${role}` 
    })

    // Add additional segments
    if (segments.length > 2) {
      const pageSegment = segments[2]
      const pageDisplayNames: Record<string, string> = {
        packages: 'Pacchetti',
        calendar: 'Calendario',
        lessons: 'Lezioni',
        materials: 'Materiali',
        payments: 'Pagamenti',
        history: 'Storico',
        settings: 'Impostazioni',
        students: 'Studenti',
        earnings: 'Guadagni',
        users: 'Utenti',
        approvals: 'Approvazioni',
        assignments: 'Assegnazioni',
        reports: 'Report'
      }

      breadcrumbs.push({
        name: pageDisplayNames[pageSegment] || pageSegment,
        href: `/dashboard/${role}/${pageSegment}`
      })
    }
  }

  return breadcrumbs
}

export default function DashboardHeader({ onMenuClick, user }: DashboardHeaderProps) {
  const { logout } = useAuth()
  const pathname = usePathname()
  const breadcrumbs = generateBreadcrumbs(pathname)

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'student': return 'Studente'
      case 'tutor': return 'Tutor'
      case 'admin': return 'Amministratore'
      default: return role
    }
  }

  const userInitials = user.email.substring(0, 2).toUpperCase()

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-card/80 backdrop-blur px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      {/* Mobile menu button */}
      <button
        type="button"
        className="-m-2.5 p-2.5 text-foreground-muted lg:hidden hover:text-foreground"
        onClick={onMenuClick}
      >
        <span className="sr-only">Apri sidebar</span>
        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Separator */}
      <div className="h-6 w-px bg-border lg:hidden" aria-hidden="true" />

      {/* Breadcrumbs */}
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex items-center">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              {breadcrumbs.map((breadcrumb, index) => (
                <li key={breadcrumb.href}>
                  <div className="flex items-center">
                    {index > 0 && (
                      <svg
                        className="h-4 w-4 flex-shrink-0 text-foreground-muted mx-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    {index === breadcrumbs.length - 1 ? (
                      <span className="text-sm font-medium text-foreground">
                        {breadcrumb.name}
                      </span>
                    ) : (
                      <Link
                        href={breadcrumb.href}
                        className="text-sm font-medium text-foreground-muted hover:text-foreground transition-colors"
                      >
                        {breadcrumb.name}
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-x-4 lg:gap-x-6 ml-auto">
          {/* Notifications */}
          <button
            type="button"
            className="-m-2.5 p-2.5 text-foreground-muted hover:text-foreground transition-colors"
          >
            <span className="sr-only">Visualizza notifiche</span>
            <BellIcon className="h-6 w-6" aria-hidden="true" />
          </button>

          {/* Separator */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-border" aria-hidden="true" />

          {/* Profile dropdown */}
          <Menu as="div" className="relative">
            <Menu.Button className="-m-1.5 flex items-center p-1.5 hover:bg-background-secondary rounded-lg transition-colors">
              <span className="sr-only">Apri menu utente</span>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-medium text-primary">
                  {userInitials}
                </span>
              </div>
              <span className="hidden lg:flex lg:items-center">
                <span className="ml-3 text-sm font-semibold leading-6 text-foreground" aria-hidden="true">
                  {getRoleDisplayName(user.role)}
                </span>
                <ChevronDownIcon className="ml-2 h-5 w-5 text-foreground-muted" aria-hidden="true" />
              </span>
            </Menu.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-10 mt-2.5 w-56 origin-top-right rounded-lg bg-card shadow-xl border border-border ring-1 ring-black/5 focus:outline-none">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-medium text-foreground">Accesso come</p>
                  <p className="text-sm text-foreground-muted truncate">{user.email}</p>
                </div>
                
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        href={`/dashboard/${user.role}/settings`}
                        className={cn(
                          'group flex items-center px-4 py-2 text-sm transition-colors',
                          active ? 'bg-background-secondary text-foreground' : 'text-foreground-muted'
                        )}
                      >
                        <Cog6ToothIcon className="mr-3 h-5 w-5" aria-hidden="true" />
                        Impostazioni
                      </Link>
                    )}
                  </Menu.Item>
                  
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleLogout}
                        className={cn(
                          'group flex w-full items-center px-4 py-2 text-sm transition-colors',
                          active ? 'bg-background-secondary text-foreground' : 'text-foreground-muted'
                        )}
                      >
                        <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" aria-hidden="true" />
                        Esci
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </div>
  )
}
