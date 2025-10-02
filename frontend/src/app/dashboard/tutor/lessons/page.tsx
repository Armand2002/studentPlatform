"use client"

import RequireAuth from '@/components/auth/RequireAuth'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/ui/Card'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { 
  CalendarDaysIcon, 
  ClockIcon, 
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface Lesson {
  id: number
  title: string
  student_name: string
  subject: string
  date: string
  time: string
  duration: number
  status: 'pending' | 'confirmed' | 'scheduled' | 'completed' | 'cancelled'
  type: 'online' | 'in-person'
  location?: string
}

export default function TutorLessonsPage() {
  const { user } = useAuth()
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all')

  useEffect(() => {
    loadLessons()
  }, [])

  const loadLessons = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get('/api/bookings')
      const bookings = response.data
      
      // Transform backend bookings to frontend lesson format
      const transformedLessons: Lesson[] = bookings.map((booking: any) => ({
        id: booking.id,
        title: `Lezione di ${booking.subject}`,
        student_name: booking.student?.user?.first_name && booking.student?.user?.last_name 
          ? `${booking.student.user.first_name} ${booking.student.user.last_name}`
          : booking.student?.user?.email || `Studente ${booking.student_id}`,
        subject: booking.subject,
        date: booking.start_time ? new Date(booking.start_time).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        time: booking.start_time ? new Date(booking.start_time).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) : '00:00',
        duration: booking.duration || 60,
        status: booking.status?.toLowerCase() || 'pending',
        type: booking.is_online ? 'online' : 'in-person',
        location: booking.location || undefined
      }))
      
      setLessons(transformedLessons)
    } catch (err) {
      console.error('Error loading lessons:', err)
      setError('Errore nel caricamento delle lezioni')
    } finally {
      setLoading(false)
    }
  }

  const filteredLessons = filter === 'all' ? lessons : lessons.filter(lesson => lesson.status === filter)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />
      case 'cancelled':
        return <XCircleIcon className="w-5 h-5 text-red-600" />
      case 'confirmed':
      case 'scheduled':
        return <CalendarDaysIcon className="w-5 h-5 text-blue-600" />
      case 'pending':
        return <ClockIcon className="w-5 h-5 text-yellow-600" />
      default:
        return <ExclamationTriangleIcon className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      scheduled: 'Programmata',
      confirmed: 'Confermata',
      completed: 'Completata',
      cancelled: 'Annullata',
      pending: 'In Attesa'
    }
    return labels[status as keyof typeof labels] || status
  }

  const getStatusBadgeClasses = (status: string) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium'
    switch (status) {
      case 'completed':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'cancelled':
        return `${baseClasses} bg-red-100 text-red-800`
      case 'confirmed':
      case 'scheduled':
        return `${baseClasses} bg-blue-100 text-blue-800`
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  if (!user || user.role !== 'tutor') {
    return (
      <RequireAuth>
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
      </RequireAuth>
    )
  }

  return (
    <RequireAuth>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-secondary/10 via-secondary/5 to-primary/10 rounded-xl p-6 border border-secondary/20">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Le Mie Lezioni
          </h1>
          <p className="text-foreground-secondary text-lg">
            Visualizza e gestisci tutte le tue lezioni programmate, completate e passate.
          </p>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'Tutte' },
              { key: 'pending', label: 'In Attesa' },
              { key: 'confirmed', label: 'Confermate' },
              { key: 'completed', label: 'Completate' },
              { key: 'cancelled', label: 'Annullate' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === key
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background-secondary text-foreground-secondary hover:bg-background-secondary/80'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </Card>

        {/* Lessons List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-background-secondary rounded w-1/3"></div>
                  <div className="h-3 bg-background-secondary rounded w-1/2"></div>
                  <div className="h-3 bg-background-secondary rounded w-1/4"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card className="p-6 text-center">
            <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-foreground">{error}</p>
          </Card>
        ) : filteredLessons.length === 0 ? (
          <Card className="p-6 text-center">
            <CalendarDaysIcon className="w-12 h-12 text-foreground-muted mx-auto mb-4" />
            <p className="text-foreground-muted">
              {filter === 'all' ? 'Nessuna lezione trovata' : `Nessuna lezione ${getStatusLabel(filter).toLowerCase()} trovata`}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredLessons.map(lesson => (
              <Card key={lesson.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(lesson.status)}
                      <h3 className="text-lg font-semibold text-foreground">
                        {lesson.title}
                      </h3>
                      <span className={getStatusBadgeClasses(lesson.status)}>
                        {getStatusLabel(lesson.status)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-foreground-secondary">
                      <div className="flex items-center space-x-2">
                        <UserIcon className="w-4 h-4" />
                        <span>{lesson.student_name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CalendarDaysIcon className="w-4 h-4" />
                        <span>{new Date(lesson.date).toLocaleDateString('it-IT')}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <ClockIcon className="w-4 h-4" />
                        <span>{lesson.time} ({lesson.duration} min)</span>
                      </div>
                      <div>
                        <span className="capitalize">{lesson.type === 'online' ? 'Online' : 'In presenza'}</span>
                        {lesson.location && (
                          <span className="text-xs block text-foreground-muted">{lesson.location}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-sm">
                      <span className="font-medium">Materia:</span> {lesson.subject}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </RequireAuth>
  )
}
