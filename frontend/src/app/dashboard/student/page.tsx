"use client"
import ActivePackagesWidget from '@/components/dashboard/ActivePackagesWidget'
import UpcomingLessonsWidget from '@/components/dashboard/UpcomingLessonsWidget'
import QuickActionsWidget from '@/components/dashboard/QuickActionsWidget'
import LearningProgressWidget from '@/components/dashboard/LearningProgressWidget'
import RequireAuth from '@/components/auth/RequireAuth'
import { useAuth } from '@/contexts/AuthContext'

export default function StudentDashboardPage() {
  const { user } = useAuth()
  return (
    <RequireAuth>
      {user?.role === 'student' ? (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold text-blue-900">Student Dashboard</h1>
            <p className="text-blue-600">Benvenuto! Ecco un riepilogo rapido.</p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            <ActivePackagesWidget />
            <UpcomingLessonsWidget />
            <QuickActionsWidget />
            <LearningProgressWidget />
          </div>
        </div>
      ) : null}
    </RequireAuth>
  )
}
