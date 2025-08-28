"use client"
import { useState, useEffect } from 'react'
import { 
  CalendarDaysIcon, 
  ClockIcon, 
  MapPinIcon,
  UserIcon,
  AcademicCapIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

interface LessonData {
  id: string
  subject: string
  tutorName: string
  tutorAvatar?: string
  date: string
  time: string
  duration: number
  location: string
  status: 'confirmed' | 'pending' | 'cancelled'
  isToday: boolean
  isTomorrow: boolean
}

interface UpcomingLessonsWidgetProps {
  className?: string
}

export default function UpcomingLessonsWidget({ className }: UpcomingLessonsWidgetProps) {
  const [lessons, setLessons] = useState<LessonData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Mock data per sviluppo - sarà sostituito con API call
  useEffect(() => {
    const mockLessons: LessonData[] = [
      {
        id: '1',
        subject: 'Matematica - Calcolo Differenziale',
        tutorName: 'Prof. Rossi',
        date: '2025-08-31',
        time: '15:00',
        duration: 90,
        location: 'Online (Zoom)',
        status: 'confirmed',
        isToday: true,
        isTomorrow: false
      },
      {
        id: '2',
        subject: 'Fisica - Meccanica Quantistica',
        tutorName: 'Prof. Bianchi',
        date: '2025-09-02',
        time: '10:30',
        duration: 60,
        location: 'Studio Via Roma 123',
        status: 'confirmed',
        isToday: false,
        isTomorrow: false
      },
      {
        id: '3',
        subject: 'Chimica - Reazioni Organiche',
        tutorName: 'Prof. Verdi',
        date: '2025-09-05',
        time: '14:00',
        duration: 75,
        location: 'Online (Teams)',
        status: 'pending',
        isToday: false,
        isTomorrow: false
      }
    ]

    // Simula API call
    setTimeout(() => {
      setLessons(mockLessons)
      setLoading(false)
    }, 1000)
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Oggi'
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Domani'
    } else {
      return date.toLocaleDateString('it-IT', {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-500 bg-green-500/10 border-green-500/20'
      case 'pending':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
      case 'cancelled':
        return 'text-red-500 bg-red-500/10 border-red-500/20'
      default:
        return 'text-foreground-muted bg-background-secondary border-border'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confermata'
      case 'pending':
        return 'In attesa'
      case 'cancelled':
        return 'Cancellata'
      default:
        return 'Sconosciuto'
    }
  }

  if (loading) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="animate-pulse">
          <div className="h-4 bg-background-secondary rounded w-3/4 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 bg-background-secondary rounded w-1/2"></div>
                <div className="h-2 bg-background-secondary rounded w-3/4"></div>
                <div className="h-2 bg-background-secondary rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={cn("p-6 border-red-500/20", className)}>
        <div className="text-center text-red-500">
          <ExclamationCircleIcon className="h-8 w-8 mx-auto mb-2" />
          <p className="text-sm">Errore nel caricamento lezioni</p>
          <p className="text-xs text-foreground-muted">{error}</p>
        </div>
      </Card>
    )
  }

  const upcomingLessons = lessons.filter(lesson => lesson.status !== 'cancelled')
  const todayLessons = upcomingLessons.filter(lesson => lesson.isToday)
  const nextLessons = upcomingLessons.filter(lesson => !lesson.isToday).slice(0, 3)

  return (
    <Card className={cn("p-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <CalendarDaysIcon className="h-5 w-5 text-primary" />
            Prossime Lezioni
          </h3>
          <p className="text-sm text-foreground-muted">
            {upcomingLessons.length} lezione{upcomingLessons.length !== 1 ? 'i' : ''} programmate
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">{todayLessons.length}</div>
          <div className="text-xs text-foreground-muted">Oggi</div>
        </div>
      </div>

      {/* Today's Lessons */}
      {todayLessons.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Lezioni di oggi
          </h4>
          <div className="space-y-3">
            {todayLessons.map((lesson) => (
              <div 
                key={lesson.id}
                className="p-3 bg-green-500/5 border border-green-500/20 rounded-lg"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h5 className="font-medium text-foreground text-sm">{lesson.subject}</h5>
                    <p className="text-xs text-foreground-muted flex items-center gap-1 mt-1">
                      <UserIcon className="h-3 w-3" />
                      {lesson.tutorName}
                    </p>
                  </div>
                  <span className={cn(
                    "px-2 py-1 text-xs font-medium rounded-full border",
                    getStatusColor(lesson.status)
                  )}>
                    {getStatusText(lesson.status)}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-foreground-muted">
                  <span className="flex items-center gap-1">
                    <ClockIcon className="h-3 w-3" />
                    {lesson.time} ({lesson.duration}min)
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPinIcon className="h-3 w-3" />
                    {lesson.location}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Lessons */}
      {nextLessons.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            Prossime lezioni
          </h4>
          <div className="space-y-3">
            {nextLessons.map((lesson) => (
              <div 
                key={lesson.id}
                className="p-3 bg-background-secondary/50 border border-border rounded-lg hover:bg-background-secondary transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h5 className="font-medium text-foreground text-sm">{lesson.subject}</h5>
                    <p className="text-xs text-foreground-muted flex items-center gap-1 mt-1">
                      <UserIcon className="h-3 w-3" />
                      {lesson.tutorName}
                    </p>
                  </div>
                  <span className={cn(
                    "px-2 py-1 text-xs font-medium rounded-full border",
                    getStatusColor(lesson.status)
                  )}>
                    {getStatusText(lesson.status)}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-foreground-muted">
                  <span className="flex items-center gap-1">
                    <CalendarDaysIcon className="h-3 w-3" />
                    {formatDate(lesson.date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <ClockIcon className="h-3 w-3" />
                    {lesson.time} ({lesson.duration}min)
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPinIcon className="h-3 w-3" />
                    {lesson.location}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Lessons State */}
      {upcomingLessons.length === 0 && (
        <div className="text-center py-8">
          <AcademicCapIcon className="h-12 w-12 text-foreground-muted mx-auto mb-3" />
          <p className="text-foreground-muted text-sm">Nessuna lezione programmata</p>
          <p className="text-foreground-muted text-xs mt-1">
            Prenota la tua prima lezione per iniziare a studiare
          </p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex gap-2">
          <button className="flex-1 px-3 py-2 text-xs font-medium text-primary border border-primary/20 rounded-md hover:bg-primary/10 transition-colors">
            Prenota Lezione
          </button>
          <button className="flex-1 px-3 py-2 text-xs font-medium text-foreground-secondary border border-border rounded-md hover:bg-background-secondary transition-colors">
            Vedi Calendario
          </button>
        </div>
      </div>
    </Card>
  )
}


