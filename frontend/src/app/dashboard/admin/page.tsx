"use client"
import DashboardWidget from '@/components/dashboard/DashboardWidget'
import RequireAuth from '@/components/auth/RequireAuth'
import { useAuth } from '@/contexts/AuthContext'

export default function AdminDashboardPage() {
  const { user } = useAuth()
  return (
    <RequireAuth>
      {user?.role === 'admin' ? (
        <div className="container-app space-y-6">
          <div>
            <h1 className="text-2xl font-semibold text-blue-900">Admin Dashboard</h1>
            <p className="text-blue-600">Panoramica rapida della piattaforma.</p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            <DashboardWidget title="Utenti totali">
              <p className="text-2xl font-bold text-blue-900">—</p>
              <p className="text-xs text-blue-600">dato segnaposto</p>
            </DashboardWidget>
            <DashboardWidget title="Lezioni oggi">
              <p className="text-2xl font-bold text-blue-900">—</p>
              <p className="text-xs text-blue-600">dato segnaposto</p>
            </DashboardWidget>
            <DashboardWidget title="Pagamenti pendenti">
              <p className="text-2xl font-bold text-blue-900">—</p>
              <p className="text-xs text-blue-600">dato segnaposto</p>
            </DashboardWidget>
          </div>
        </div>
      ) : null}
    </RequireAuth>
  )
}
