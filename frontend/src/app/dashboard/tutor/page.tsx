"use client"
import BookingCalendarWidget from '@/components/dashboard/BookingCalendarWidget'
import QuickActionsWidget from '@/components/dashboard/QuickActionsWidget'
import RequireAuth from '@/components/auth/RequireAuth'
import { useAuth } from '@/contexts/AuthContext'
import EarningsWidget from '@/components/dashboard/tutor/EarningsWidget'
import StudentsWidget from '@/components/dashboard/tutor/StudentsWidget'
import AvailabilityWidget from '@/components/dashboard/tutor/AvailabilityWidget'
import MaterialsLink from '@/components/materials/MaterialsLink'
import PerformanceWidget from '@/components/dashboard/tutor/PerformanceWidget'

export default function TutorDashboardPage() {
  const { user } = useAuth()
  return (
    <RequireAuth>
      {user?.role === 'tutor' ? (
        <div className="space-y-6">
          {/* Welcome section */}
          <div className="bg-gradient-to-r from-secondary/10 via-secondary/5 to-primary/10 rounded-xl p-6 border border-secondary/20">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Dashboard Tutor
            </h1>
            <p className="text-foreground-secondary text-lg">
              Gestisci i tuoi studenti, le lezioni e monitora i tuoi guadagni.
            </p>
          </div>

          {/* Main widgets */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            <EarningsWidget />
            <StudentsWidget />
            <AvailabilityWidget />
          </div>

          {/* Secondary widgets */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Materiali Didattici</h2>
              <MaterialsLink variant="widget" />
            </div>
            <PerformanceWidget />
          </div>

          {/* Calendar and actions */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <BookingCalendarWidget />
            <QuickActionsWidget />
          </div>
        </div>
      ) : null}
    </RequireAuth>
  )
}
