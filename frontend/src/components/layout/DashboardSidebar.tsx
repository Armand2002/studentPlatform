"use client"
import { Fragment } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Dialog, Transition } from '@headlessui/react'
import { 
  XMarkIcon,
  HomeIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  ClockIcon,
  CreditCardIcon,
  DocumentTextIcon,
  ChartBarIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  AcademicCapIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline'
import Logo from '@/components/ui/Logo'
import { cn } from '@/lib/utils'
import MaterialsLink from '@/components/materials/MaterialsLink'

interface DashboardSidebarProps {
  isOpen: boolean
  onClose: () => void
  userRole: 'student' | 'tutor' | 'admin'
}

const studentNavigation = [
  { name: 'Dashboard', href: '/dashboard/student', icon: HomeIcon },
  { name: 'I Miei Pacchetti', href: '/dashboard/student/packages', icon: BookOpenIcon },
  { name: 'Calendario', href: '/dashboard/student/calendar', icon: CalendarDaysIcon },
  { name: 'Prossime Lezioni', href: '/dashboard/student/lessons', icon: ClockIcon },
  { name: 'Materiali', href: '/dashboard/student/materials', icon: DocumentTextIcon },
  { name: 'Pagamenti', href: '/dashboard/student/payments', icon: CreditCardIcon },
  { name: 'Storico', href: '/dashboard/student/history', icon: ChartBarIcon },
  { name: 'Impostazioni', href: '/dashboard/student/settings', icon: Cog6ToothIcon },
]

const tutorNavigation = [
  { name: 'Dashboard', href: '/dashboard/tutor', icon: HomeIcon },
  { name: 'I Miei Studenti', href: '/dashboard/tutor/students', icon: UserGroupIcon },
  { name: 'Calendario', href: '/dashboard/tutor/calendar', icon: CalendarDaysIcon },
  { name: 'Lezioni', href: '/dashboard/tutor/lessons', icon: AcademicCapIcon },
  { name: 'Materiali', href: '/dashboard/tutor/materials', icon: DocumentTextIcon },
  { name: 'Guadagni', href: '/dashboard/tutor/earnings', icon: BanknotesIcon },
  { name: 'Storico', href: '/dashboard/tutor/history', icon: ChartBarIcon },
  { name: 'Impostazioni', href: '/dashboard/tutor/settings', icon: Cog6ToothIcon },
]

const adminNavigation = [
  { name: 'Dashboard', href: '/dashboard/admin', icon: HomeIcon },
  { name: 'Utenti', href: '/dashboard/admin/users', icon: UserGroupIcon },
  { name: 'Approvazioni', href: '/dashboard/admin/approvals', icon: ClockIcon },
  { name: 'Assegnazioni', href: '/dashboard/admin/assignments', icon: AcademicCapIcon },
  { name: 'Report', href: '/dashboard/admin/reports', icon: ChartBarIcon },
  { name: 'Impostazioni', href: '/dashboard/admin/settings', icon: Cog6ToothIcon },
]

function getNavigationForRole(role: 'student' | 'tutor' | 'admin') {
  switch (role) {
    case 'student':
      return studentNavigation
    case 'tutor':
      return tutorNavigation
    case 'admin':
      return adminNavigation
    default:
      return studentNavigation
  }
}

function SidebarContent({ userRole, onClose }: { userRole: 'student' | 'tutor' | 'admin', onClose?: () => void }) {
  const pathname = usePathname()
  const navigation = getNavigationForRole(userRole)

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'student': return 'Studente'
      case 'tutor': return 'Tutor'
      case 'admin': return 'Amministratore'
      default: return role
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Logo and brand */}
      <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-border">
        <Logo size="sm" />
        {onClose && (
          <button
            type="button"
            className="lg:hidden -m-2.5 p-2.5 text-foreground-muted hover:text-foreground"
            onClick={onClose}
          >
            <span className="sr-only">Chiudi sidebar</span>
            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Role indicator */}
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">
                {userRole.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">Dashboard</p>
            <p className="text-xs text-foreground-muted">{getRoleDisplayName(userRole)}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-6 py-6 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          
          // Special handling for Materials links - replace with Google Drive
          if (item.name === 'Materiali') {
            return (
              <MaterialsLink 
                key={item.name}
                variant="sidebar" 
                className="w-full justify-start"
                showText={true}
                showIcon={true}
              />
            )
          }
          
          return (
            <Link
              key={item.name}
              href={item.href as any}
              className={cn(
                'group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-foreground-muted hover:text-foreground hover:bg-background-secondary'
              )}
            >
              <item.icon
                className={cn(
                  'mr-3 h-5 w-5 flex-shrink-0 transition-colors',
                  isActive
                    ? 'text-primary-foreground'
                    : 'text-foreground-muted group-hover:text-foreground'
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-border">
        <p className="text-xs text-foreground-muted">
          TutoringPro v2.0
        </p>
      </div>
    </div>
  )
}

export default function DashboardSidebar({ isOpen, onClose, userRole }: DashboardSidebarProps) {
  return (
    <>
      {/* Mobile sidebar */}
      <Transition.Root show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <div className="flex grow flex-col bg-card shadow-xl border-r border-border">
                  <SidebarContent userRole={userRole} onClose={onClose} />
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col bg-card shadow-xl border-r border-border">
          <SidebarContent userRole={userRole} />
        </div>
      </div>
    </>
  )
}
