"use client"
import RequireAuth from '@/components/auth/RequireAuth'
import { useAuth } from '@/contexts/AuthContext'
import AdminMetricsWidget from '@/components/dashboard/admin/AdminMetricsWidget'
import BookingCalendarWidget from '@/components/dashboard/BookingCalendarWidget'
import AdminUsersWidget from '@/components/dashboard/admin/AdminUsersWidget'
import AdminPaymentsWidget from '@/components/dashboard/admin/AdminPaymentsWidget'
import AdminPackagesWidget from '@/components/dashboard/admin/AdminPackagesWidget'
import Link from 'next/link'
import AdminTrendsWidget from '@/components/dashboard/admin/AdminTrendsWidget'

export default function AdminDashboardPage() {
  const { user } = useAuth()
  return (
    <RequireAuth>
      {user?.role === 'admin' ? (
        <div className="container-app space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-blue-900">Admin Dashboard</h1>
                <p className="text-blue-600">Monitoraggio e panoramica piattaforma.</p>
              </div>
              <Link href="/dashboard/admin/users" className="inline-flex h-9 items-center rounded-md border border-blue-200 px-3 text-sm text-blue-700 hover:bg-blue-50">Gestisci utenti</Link>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            <AdminMetricsWidget />
            <AdminUsersWidget />
            <AdminPaymentsWidget />
            <AdminTrendsWidget />
            <AdminPackagesWidget />
            <BookingCalendarWidget />
          </div>
        </div>
      ) : null}
    </RequireAuth>
  )
}
