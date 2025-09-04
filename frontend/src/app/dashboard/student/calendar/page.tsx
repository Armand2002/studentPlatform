"use client"
import StudentCalendar from '@/components/dashboard/StudentCalendar'
import RequireAuth from '@/components/auth/RequireAuth'

export default function CalendarPage() {
  return (
    <RequireAuth>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Calendario</h1>
          <p className="text-foreground-muted">
            Visualizza e gestisci le tue lezioni, esami e scadenze
          </p>
        </div>

        {/* Calendar Component */}
        <StudentCalendar />
      </div>
    </RequireAuth>
  )
}
