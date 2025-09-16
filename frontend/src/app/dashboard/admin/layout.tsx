'use client'

import { ReactNode } from 'react'
import { WebSocketProvider } from '@/contexts/WebSocketContext'
import { useAuth } from '@/contexts/AuthContext'
import { canAccessAdmin } from '@/lib/permissions'
import { AdminOnlyAccess } from '@/components/ui/PermissionComponents'

interface AdminLayoutProps {
  readonly children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user } = useAuth()

  // ✅ CLEANUP: Use centralized permission checking
  if (!canAccessAdmin(user?.role)) {
    return <AdminOnlyAccess />
  }

  return (
    <WebSocketProvider enabled={false}>
      {/* ✅ NO DUPLICATE SIDEBAR - Use only DashboardLayout sidebar */}
      <div className="w-full">
        {children}
      </div>
    </WebSocketProvider>
  )
}
