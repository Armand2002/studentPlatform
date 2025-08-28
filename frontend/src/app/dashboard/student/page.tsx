"use client"
import ActivePackagesWidget from '@/components/dashboard/ActivePackagesWidget'
import UpcomingLessonsWidget from '@/components/dashboard/UpcomingLessonsWidget'
import QuickActionsWidget from '@/components/dashboard/QuickActionsWidget'
import LearningProgressWidget from '@/components/dashboard/LearningProgressWidget'
import StudentCalendar from '@/components/dashboard/StudentCalendar'
import RequireAuth from '@/components/auth/RequireAuth'
import { useAuth } from '@/contexts/AuthContext'

export default function StudentDashboardPage() {
  const { user } = useAuth()
  return (
    <RequireAuth>
      {user?.role === 'student' ? (
        <div className="space-y-6">
          {/* Welcome section */}
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 rounded-xl p-6 border border-primary/20">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Benvenuto nella tua Dashboard
            </h1>
            <p className="text-foreground-secondary text-lg">
              Ecco un riepilogo delle tue attività di studio e delle prossime lezioni.
            </p>
          </div>

          {/* Dashboard widgets */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            <ActivePackagesWidget />
            <UpcomingLessonsWidget />
            <QuickActionsWidget />
            <LearningProgressWidget />
          </div>

          {/* Calendar section */}
          <div className="grid grid-cols-1 gap-6">
            <StudentCalendar />
          </div>
        </div>
      ) : null}
    </RequireAuth>
  )
}
