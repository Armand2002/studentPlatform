"use client"
import { useState, useEffect } from 'react'
import { 
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  MapPinIcon,
  VideoCameraIcon,
  PhoneIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import RequireAuth from '@/components/auth/RequireAuth'

interface Lesson {
  id: string
  subject: string
  tutorName: string
  tutorAvatar?: string
  date: string
  startTime: string
  endTime: string
  duration: number
  location: string
  type: 'online' | 'in_person'
  status: 'confirmed' | 'pending' | 'cancelled'
  meetingLink?: string
  notes?: string
  packageName?: string
  price: number
}

export default function UpcomingLessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'today' | 'this_week' | 'this_month'>('all')

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        setLoading(true)
        
        console.log('🔍 Fetching upcoming lessons from backend...')
        
        // Implementazione API upcoming lessons in attesa di backend endpoint
        // const lessons = await lessonService.getUpcomingLessons()
        
        // Per ora impostiamo array vuoto finché non implementiamo il backend
        setLessons([])
        
      } catch (err) {
        console.error('❌ Error fetching upcoming lessons:', err)
        setLessons([])
      } finally {
        setLoading(false)
      }
    }

    fetchLessons()
  }, [])

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'confirmed':
        return {
          color: 'text-green-500 bg-green-500/10 border-green-500/20',
          icon: CheckIcon,
          label: 'Confermata'
        }
      case 'pending':
        return {
          color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
          icon: ClockIcon,
          label: 'In attesa'
        }
      case 'cancelled':
        return {
          color: 'text-red-500 bg-red-500/10 border-red-500/20',
          icon: XMarkIcon,
          label: 'Cancellata'
        }
      default:
        return {
          color: 'text-gray-500 bg-gray-500/10 border-gray-500/20',
          icon: ClockIcon,
          label: 'Sconosciuto'
        }
    }
  }

  const isToday = (date: string) => {
    const today = new Date().toDateString()
    return new Date(date).toDateString() === today
  }

  const isThisWeek = (date: string) => {
    const now = new Date()
    const lessonDate = new Date(date)
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
    const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6))
    return lessonDate >= startOfWeek && lessonDate <= endOfWeek
  }

  const filteredLessons = lessons.filter(lesson => {
    switch (filter) {
      case 'today':
        return isToday(lesson.date)
      case 'this_week':
        return isThisWeek(lesson.date)
      case 'this_month': {
        const now = new Date()
        const lessonDate = new Date(lesson.date)
        return lessonDate.getMonth() === now.getMonth() && lessonDate.getFullYear() === now.getFullYear()
      }
      default:
        return true
    }
  })

  if (loading) {
    return (
      <RequireAuth>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-background-secondary rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-background-secondary rounded w-2/3 mb-6"></div>
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-background-secondary rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </RequireAuth>
    )
  }

  return (
    <RequireAuth>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Prossime Lezioni</h1>
            <p className="text-foreground-muted">
              Visualizza e gestisci le tue lezioni programmate
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{lessons.filter(l => isToday(l.date)).length}</div>
            <div className="text-sm text-foreground-muted">Oggi</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-500">{lessons.filter(l => isThisWeek(l.date)).length}</div>
            <div className="text-sm text-foreground-muted">Questa settimana</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-green-500">{lessons.filter(l => l.status === 'confirmed').length}</div>
            <div className="text-sm text-foreground-muted">Confermate</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-500">{lessons.filter(l => l.status === 'pending').length}</div>
            <div className="text-sm text-foreground-muted">In attesa</div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'Tutte' },
              { key: 'today', label: 'Oggi' },
              { key: 'this_week', label: 'Questa settimana' },
              { key: 'this_month', label: 'Questo mese' }
            ].map((filterOption) => (
              <button
                key={filterOption.key}
                onClick={() => setFilter(filterOption.key as any)}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                  filter === filterOption.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-background-secondary text-foreground-muted hover:bg-background-secondary/80"
                )}
              >
                {filterOption.label}
              </button>
            ))}
          </div>
        </Card>

        {/* Lessons List */}
        <div className="space-y-4">
          {filteredLessons.length === 0 ? (
            <Card className="p-12 text-center">
              <CalendarDaysIcon className="h-16 w-16 text-foreground-muted mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Nessuna lezione programmata
              </h3>
              <p className="text-foreground-muted mb-6">
                Non hai lezioni programmate per il periodo selezionato.
              </p>
              <a
                href="/dashboard/student/prenota"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                <CalendarDaysIcon className="h-4 w-4" />
                Prenota una Lezione
              </a>
            </Card>
          ) : (
            filteredLessons.map((lesson) => {
              const statusConfig = getStatusConfig(lesson.status)
              const StatusIcon = statusConfig.icon
              const isLessonToday = isToday(lesson.date)

              return (
                <Card 
                  key={lesson.id} 
                  className={cn(
                    "p-6",
                    isLessonToday && "border-l-4 border-l-primary bg-primary/5",
                    lesson.status === 'cancelled' && "opacity-75"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-foreground">{lesson.subject}</h3>
                        <span className={cn(
                          "px-2 py-1 text-xs font-medium rounded-full border",
                          statusConfig.color
                        )}>
                          <StatusIcon className="h-3 w-3 inline mr-1" />
                          {statusConfig.label}
                        </span>
                        {isLessonToday && (
                          <span className="px-2 py-1 text-xs font-medium bg-primary text-primary-foreground rounded-full">
                            Oggi
                          </span>
                        )}
                      </div>

                      {/* Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-foreground-muted">
                            <UserIcon className="h-4 w-4" />
                            <span>{lesson.tutorName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-foreground-muted">
                            <CalendarDaysIcon className="h-4 w-4" />
                            <span>
                              {new Date(lesson.date).toLocaleDateString('it-IT', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-foreground-muted">
                            <ClockIcon className="h-4 w-4" />
                            <span>{lesson.startTime} - {lesson.endTime} ({lesson.duration} min)</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-foreground-muted">
                            {lesson.type === 'online' ? (
                              <>
                                <VideoCameraIcon className="h-4 w-4" />
                                <span>Online</span>
                              </>
                            ) : (
                              <>
                                <MapPinIcon className="h-4 w-4" />
                                <span>{lesson.location}</span>
                              </>
                            )}
                          </div>
                          {lesson.packageName && (
                            <div className="flex items-center gap-2 text-sm text-foreground-muted">
                              <span className="text-primary">📦</span>
                              <span>{lesson.packageName}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm text-foreground-muted">
                            <span className="text-green-500">💰</span>
                            <span>€{lesson.price}</span>
                          </div>
                        </div>
                      </div>

                      {/* Notes */}
                      {lesson.notes && (
                        <div className="p-3 bg-background-secondary rounded-lg mb-4">
                          <p className="text-sm text-foreground-secondary">{lesson.notes}</p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        {lesson.status === 'confirmed' && lesson.type === 'online' && lesson.meetingLink && (
                          <a
                            href={lesson.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                          >
                            <VideoCameraIcon className="h-4 w-4" />
                            Unisciti alla Lezione
                          </a>
                        )}
                        {lesson.status === 'pending' && (
                          <div className="flex items-center gap-2 text-sm text-yellow-600">
                            <ExclamationTriangleIcon className="h-4 w-4" />
                            In attesa di conferma dal tutor
                          </div>
                        )}
                        <button className="inline-flex items-center gap-2 px-4 py-2 border border-border text-foreground-secondary rounded-md hover:bg-background-secondary transition-colors">
                          <PhoneIcon className="h-4 w-4" />
                          Contatta Tutor
                        </button>
                        {lesson.status !== 'cancelled' && (
                          <button className="inline-flex items-center gap-2 px-4 py-2 border border-red-500/20 text-red-600 rounded-md hover:bg-red-500/10 transition-colors">
                            <XMarkIcon className="h-4 w-4" />
                            Cancella
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </RequireAuth>
  )
}
