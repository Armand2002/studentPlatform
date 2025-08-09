"use client"
import BookingCalendarWidget from '@/components/dashboard/BookingCalendarWidget'
import QuickActionsWidget from '@/components/dashboard/QuickActionsWidget'
import RequireAuth from '@/components/auth/RequireAuth'
import { useAuth } from '@/contexts/AuthContext'

export default function TutorDashboardPage() {
  const { user } = useAuth()
  return (
    <RequireAuth>
      {user?.role === 'tutor' ? (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold text-blue-900">Tutor Dashboard</h1>
            <p className="text-blue-600">Gestisci calendario e materiali.</p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <BookingCalendarWidget />
            <QuickActionsWidget />
          </div>
        </div>
      ) : null}
    </RequireAuth>
  )
}
