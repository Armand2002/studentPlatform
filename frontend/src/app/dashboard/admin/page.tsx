"use client"
import RequireAuth from '@/components/auth/RequireAuth'
import { useAuth } from '@/contexts/AuthContext'
import CompleteAdminDashboard from '@/components/admin/CompleteAdminDashboard'

export default function AdminDashboardPage() {
  const { user } = useAuth()
  return (
    <RequireAuth>
      {user?.role === 'admin' ? (
        <CompleteAdminDashboard />
      ) : (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Accesso Negato</h1>
            <p className="text-gray-600">Solo gli amministratori possono accedere a questa sezione.</p>
          </div>
        </div>
      )}
    </RequireAuth>
  )
}
