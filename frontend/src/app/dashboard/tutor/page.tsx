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
import { RevenueChart } from '@/components/dashboard/tutor/RevenueChart'
import { EarningsBreakdown } from '@/components/dashboard/tutor/EarningsBreakdown'
import { PerformanceMetrics } from '@/components/dashboard/tutor/PerformanceMetrics'
import { StudentList } from '@/components/dashboard/tutor/StudentList'
import { LessonCalendar } from '@/components/dashboard/tutor/LessonCalendar'

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

          {/* Performance Metrics Row - Giorno 10 */}
          <PerformanceMetrics />

          {/* Revenue Section - Giorno 10 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <RevenueChart />
            </div>
            <div className="lg:col-span-1">
              <EarningsBreakdown />
            </div>
          </div>

          {/* Calendar and Students Section - Giorno 10 */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <LessonCalendar />
            <StudentList />
          </div>

          {/* Legacy widgets */}
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
