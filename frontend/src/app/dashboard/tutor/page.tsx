"use client"
import BookingCalendarWidget from '@/components/dashboard/BookingCalendarWidget'
import QuickActionsWidget from '@/components/dashboard/QuickActionsWidget'
import RequireAuth from '@/components/auth/RequireAuth'
import { useAuth } from '@/contexts/AuthContext'
import EarningsWidget from '@/components/dashboard/tutor/EarningsWidget'
import StudentsWidget from '@/components/dashboard/tutor/StudentsWidget'
import AvailabilityWidget from '@/components/dashboard/tutor/AvailabilityWidget'
import MaterialsWidget from '@/components/dashboard/tutor/MaterialsWidget'
import PerformanceWidget from '@/components/dashboard/tutor/PerformanceWidget'

export default function TutorDashboardPage() {
  const { user } = useAuth()
  return (
    <RequireAuth>
      {user?.role === 'tutor' ? (
        <div className="container-app space-y-6">
          <div>
            <h1 className="text-2xl font-semibold text-blue-900">Tutor Dashboard</h1>
            <p className="text-blue-600">Gestisci calendario e materiali.</p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            <EarningsWidget />
            <StudentsWidget />
            <AvailabilityWidget />
            <MaterialsWidget />
            <PerformanceWidget />
            <BookingCalendarWidget />
            <QuickActionsWidget />
          </div>
        </div>
      ) : null}
    </RequireAuth>
  )
}
