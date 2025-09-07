'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Users, 
  UserCheck, 
  BookOpen, 
  BarChart3, 
  Settings,
  Home,
  TrendingUp,
  FileText,
  UserCog,
  Shield
} from 'lucide-react'
import { WebSocketProvider } from '@/contexts/WebSocketContext'
import { NotificationCenter } from '@/components/notifications/NotificationCenter'
import { useAuth } from '@/contexts/AuthContext'

interface AdminLayoutProps {
  readonly children: ReactNode
}

const adminNavItems = [
  { href: '/dashboard/admin', icon: Home, label: 'Dashboard' },
  { href: '/dashboard/admin/users', icon: Users, label: 'Utenti' },
  { href: '/dashboard/admin/approvals', icon: UserCheck, label: 'Approvazioni' },
  { href: '/dashboard/admin/assignments', icon: BookOpen, label: 'Incarichi' },
  { href: '/dashboard/admin/advanced-analytics', icon: TrendingUp, label: 'Analytics Avanzate' },
  { href: '/dashboard/admin/user-management', icon: UserCog, label: 'Gestione Utenti' },
  { href: '/dashboard/admin/registration-approval', icon: Shield, label: 'Approvazioni Registro' },
  { href: '/dashboard/admin/reports', icon: BarChart3, label: 'Report' },
  { href: '/dashboard/admin/audit-logs', icon: FileText, label: 'Log Audit' },
  { href: '/dashboard/admin/settings', icon: Settings, label: 'Impostazioni' },
] as const

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()
  const { user } = useAuth()

  // Solo admin possono accedere
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Accesso Negato</h1>
          <p className="text-gray-600">Solo gli amministratori possono accedere a questa sezione.</p>
        </div>
      </div>
    )
  }

  return (
    <WebSocketProvider enabled={true}>
      <div className="min-h-screen bg-background">
        {/* Top Navigation */}
        <nav className="bg-background-secondary shadow-lg border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-foreground">
                  Admin Dashboard
                </h1>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Notification Center */}
                <NotificationCenter />
                
                {/* User Info */}
                <div className="flex items-center text-sm text-foreground-secondary">
                  <span className="mr-2">👤</span>
                  {user.email}
                </div>
              </div>
            </div>
          </div>
        </nav>

        <div className="flex">
          {/* Sidebar */}
          <aside className="w-64 bg-background-secondary shadow-lg min-h-screen border-r border-border">
            <nav className="mt-8 px-4">
              <ul className="space-y-2">
                {adminNavItems.map((item) => {
                  const isActive = pathname === item.href
                  const Icon = item.icon
                  
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                          isActive
                            ? 'bg-primary/20 text-primary border-r-2 border-primary'
                            : 'text-foreground-secondary hover:bg-background-tertiary hover:text-foreground'
                        }`}
                      >
                        <Icon className="mr-3 h-5 w-5" />
                        {item.label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-8 bg-background">
            {children}
          </main>
        </div>
      </div>
    </WebSocketProvider>
  )
}
