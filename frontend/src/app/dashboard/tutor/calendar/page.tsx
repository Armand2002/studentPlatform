"use client"

import RequireAuth from '@/components/auth/RequireAuth'
import { useAuth } from '@/contexts/AuthContext'
import { LessonCalendar } from '@/components/dashboard/tutor/LessonCalendar'

export default function TutorCalendarPage() {
  const { user } = useAuth()
  
  return (
    <RequireAuth>
      {user?.role === 'tutor' ? (
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-secondary/10 via-secondary/5 to-primary/10 rounded-xl p-6 border border-secondary/20">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Calendario Lezioni
            </h1>
            <p className="text-foreground-secondary text-lg">
              Visualizza e gestisci le tue lezioni programmate, passate e future.
            </p>
          </div>

          {/* Calendar */}
          <LessonCalendar />
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Accesso Negato
            </h2>
            <p className="text-foreground-secondary">
              Solo i tutor possono accedere a questa pagina.
            </p>
          </div>
        </div>
      )}
    </RequireAuth>
  )
}
