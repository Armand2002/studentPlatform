"use client"
import ActivePackagesWidget from '@/components/dashboard/ActivePackagesWidget'
import UpcomingLessonsWidget from '@/components/dashboard/UpcomingLessonsWidget'
import QuickActionsWidget from '@/components/dashboard/QuickActionsWidget'
import LearningProgressWidget from '@/components/dashboard/LearningProgressWidget'
import BookingCalendarWidget from '@/components/dashboard/BookingCalendarWidget'
import StudyStreakWidget from '@/components/dashboard/StudyStreakWidget'
import RecentActivityWidget from '@/components/dashboard/RecentActivityWidget'
import AdvancedBookingWidget from '@/components/dashboard/AdvancedBookingWidget'
import WeeklyCalendarWidget from '@/components/dashboard/WeeklyCalendarWidget'
import MonthlyCalendarWidget from '@/components/dashboard/MonthlyCalendarWidget'
import RequireAuth from '@/components/auth/RequireAuth'
import { useAuth } from '@/contexts/AuthContext'

export default function StudentDashboardPage() {
  const { user } = useAuth()
  return (
    <RequireAuth>
      {user?.role === 'student' ? (
        <div className="container-app space-y-6">
          <div>
            <h1 className="text-2xl font-semibold text-blue-900">Student Dashboard</h1>
            <p className="text-blue-600">Benvenuto! Ecco un riepilogo rapido.</p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            <ActivePackagesWidget />
            <UpcomingLessonsWidget />
            <QuickActionsWidget />
            <LearningProgressWidget />
            <BookingCalendarWidget />
            <StudyStreakWidget />
            <RecentActivityWidget />
            <AdvancedBookingWidget />
            <WeeklyCalendarWidget />
            <MonthlyCalendarWidget />
          </div>
        </div>
      ) : null}
    </RequireAuth>
  )
}
