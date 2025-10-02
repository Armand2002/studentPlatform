"use client"
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { 
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  MapPinIcon,
  VideoCameraIcon,
  PhoneIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  BookOpenIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import RequireAuth from '@/components/auth/RequireAuth'

// Interfaces for existing lessons
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

// Interfaces for booking new lessons
interface TutorSlot {
  id: string
  tutor_id: string
  date: string
  start_time: string
  end_time: string
  subject: string
  location: string
  tutor: {
    id: string
    full_name: string
    avatar?: string
    rating?: number
  }
  is_available: boolean
}

// Interface for completed lessons (history)
interface CompletedLesson {
  id: string
  subject: string
  tutorName: string
  date: string
  startTime: string
  endTime: string
  rating?: number
  notes?: string
  materials?: string[]
  price: number
}

export default function UnifiedLessonsPage() {
  const searchParams = useSearchParams()
  const initialTab = searchParams.get('tab') as 'upcoming' | 'booking' | 'history' || 'upcoming'
  
  // State for tabs
  const [activeTab, setActiveTab] = useState<'upcoming' | 'booking' | 'history'>(initialTab)
  
  // State for upcoming lessons
  const [upcomingLessons, setUpcomingLessons] = useState<Lesson[]>([])
  const [upcomingLoading, setUpcomingLoading] = useState(true)
  
  // State for booking
  const [availableSlots, setAvailableSlots] = useState<TutorSlot[]>([])
  const [bookingLoading, setBookingLoading] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>('')
  
  // State for history
  const [completedLessons, setCompletedLessons] = useState<CompletedLesson[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  
  // Common filter state
  const [filter, setFilter] = useState<'all' | 'today' | 'this_week' | 'this_month'>('all')

  // Load data based on active tab
  useEffect(() => {
    if (activeTab === 'upcoming') {
      fetchUpcomingLessons()
    } else if (activeTab === 'booking') {
      fetchAvailableSlots()
    } else if (activeTab === 'history') {
      fetchCompletedLessons()
    }
  }, [activeTab, selectedSubject, selectedDate])

  // Fetch upcoming lessons
  const fetchUpcomingLessons = async () => {
    try {
      setUpcomingLoading(true)
      
      const token = localStorage.getItem('access_token')
      if (!token) {
        setUpcomingLessons([])
        return
      }

      const response = await fetch('http://localhost:8000/api/bookings/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const bookings = await response.json()
        
        // Filter future bookings
        const now = new Date()
        const futureBookings = bookings.filter((booking: any) => {
          const lessonDateTime = new Date(`${booking.slot?.date}T${booking.slot?.start_time}`)
          return lessonDateTime >= now
        })
        
        const transformedLessons: Lesson[] = futureBookings.map((booking: any) => ({
          id: booking.id.toString(),
          subject: booking.slot?.subject || 'Materia non specificata',
          tutorName: booking.slot?.tutor?.full_name || 'Tutor sconosciuto',
          date: booking.slot?.date || new Date().toISOString().split('T')[0],
          startTime: booking.slot?.start_time || '00:00',
          endTime: booking.slot?.end_time || '01:00',
          duration: 60,
          location: booking.slot?.location || 'Online',
          type: booking.slot?.location === 'Online' ? 'online' : 'in_person',
          status: booking.status === 'confirmed' ? 'confirmed' : 'pending',
          meetingLink: booking.slot?.location === 'Online' ? 'https://meet.google.com/placeholder' : undefined,
          notes: undefined,
          packageName: undefined,
          price: 50
        }))
        
        setUpcomingLessons(transformedLessons)
      } else {
        setUpcomingLessons([])
      }
    } catch (err) {
      console.error('❌ Error fetching upcoming lessons:', err)
      setUpcomingLessons([])
    } finally {
      setUpcomingLoading(false)
    }
  }

  // Fetch available slots for booking
  const fetchAvailableSlots = async () => {
    try {
      setBookingLoading(true)
      const token = localStorage.getItem('access_token')
      if (!token) return

      let url = 'http://localhost:8000/api/slots/available'
      const params = new URLSearchParams()
      if (selectedSubject) params.append('subject', selectedSubject)
      if (selectedDate) params.append('date', selectedDate)
      if (params.toString()) url += `?${params.toString()}`

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setAvailableSlots(data)
      }
    } catch (error) {
      console.error('Error fetching slots:', error)
    } finally {
      setBookingLoading(false)
    }
  }

  // Fetch completed lessons for history
  const fetchCompletedLessons = async () => {
    try {
      setHistoryLoading(true)
      
      const token = localStorage.getItem('access_token')
      if (!token) {
        setCompletedLessons([])
        return
      }

      const response = await fetch('http://localhost:8000/api/bookings/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const bookings = await response.json()
        
        // Filter completed bookings
        const now = new Date()
        const completedBookings = bookings.filter((booking: any) => {
          const lessonDateTime = new Date(`${booking.slot?.date}T${booking.slot?.end_time}`)
          return lessonDateTime < now && booking.status === 'completed'
        })
        
        const transformedHistory: CompletedLesson[] = completedBookings.map((booking: any) => ({
          id: booking.id.toString(),
          subject: booking.slot?.subject || 'Materia non specificata',
          tutorName: booking.slot?.tutor?.full_name || 'Tutor sconosciuto',
          date: booking.slot?.date || new Date().toISOString().split('T')[0],
          startTime: booking.slot?.start_time || '00:00',
          endTime: booking.slot?.end_time || '01:00',
          rating: booking.rating || undefined,
          notes: booking.notes || undefined,
          materials: booking.materials || [],
          price: 50
        }))
        
        setCompletedLessons(transformedHistory)
      } else {
        setCompletedLessons([])
      }
    } catch (err) {
      console.error('❌ Error fetching lesson history:', err)
      setCompletedLessons([])
    } finally {
      setHistoryLoading(false)
    }
  }

  // Book a slot
  const handleBookSlot = async (slotId: string) => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) return

      const response = await fetch('http://localhost:8000/api/bookings/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slot_id: parseInt(slotId)
        })
      })

      if (response.ok) {
        alert('Lezione prenotata con successo!')
        // Refresh both upcoming lessons and available slots
        fetchUpcomingLessons()
        fetchAvailableSlots()
        // Switch to upcoming tab to show the new booking
        setActiveTab('upcoming')
      } else {
        const error = await response.json()
        alert(`Errore: ${error.detail || 'Impossibile prenotare la lezione'}`)
      }
    } catch (error) {
      console.error('Error booking slot:', error)
      alert('Errore di connessione')
    }
  }

  // Utility functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5)
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'confirmed':
        return {
          color: 'text-green-600',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/20',
          icon: CheckIcon,
          label: 'Confermata'
        }
      case 'pending':
        return {
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/20',
          icon: ClockIcon,
          label: 'In attesa'
        }
      case 'cancelled':
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/20',
          icon: XMarkIcon,
          label: 'Cancellata'
        }
      default:
        return {
          color: 'text-gray-600',
          bgColor: 'bg-gray-500/10',
          borderColor: 'border-gray-500/20',
          icon: ClockIcon,
          label: 'Sconosciuto'
        }
    }
  }

  return (
    <RequireAuth>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Lezioni</h1>
            <p className="text-foreground-muted">
              Gestisci le tue lezioni programmate, prenota nuove lezioni e visualizza lo storico
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={cn(
                'py-2 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === 'upcoming'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-foreground-muted hover:text-foreground hover:border-border'
              )}
            >
              <ClockIcon className="h-4 w-4 inline mr-2" />
              Prossime Lezioni
              {upcomingLessons.length > 0 && (
                <span className="ml-2 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
                  {upcomingLessons.length}
                </span>
              )}
            </button>
            
            <button
              onClick={() => setActiveTab('booking')}
              className={cn(
                'py-2 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === 'booking'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-foreground-muted hover:text-foreground hover:border-border'
              )}
            >
              <PlusIcon className="h-4 w-4 inline mr-2" />
              Prenota Nuova
            </button>
            
            <button
              onClick={() => setActiveTab('history')}
              className={cn(
                'py-2 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === 'history'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-foreground-muted hover:text-foreground hover:border-border'
              )}
            >
              <BookOpenIcon className="h-4 w-4 inline mr-2" />
              Storico
              {completedLessons.length > 0 && (
                <span className="ml-2 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
                  {completedLessons.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'upcoming' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex gap-4">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-3 py-2 border border-border rounded-md text-foreground bg-background"
              >
                <option value="all">Tutte le lezioni</option>
                <option value="today">Oggi</option>
                <option value="this_week">Questa settimana</option>
                <option value="this_month">Questo mese</option>
              </select>
            </div>

            {/* Upcoming Lessons List */}
            {upcomingLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-foreground-muted">Caricamento lezioni...</p>
              </div>
            ) : upcomingLessons.length === 0 ? (
              <Card className="p-8 text-center">
                <CalendarDaysIcon className="h-12 w-12 text-foreground-muted mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Nessuna lezione programmata</h3>
                <p className="text-foreground-muted mb-4">
                  Non hai ancora prenotato nessuna lezione. Inizia prenotando la tua prima lezione!
                </p>
                <button
                  onClick={() => setActiveTab('booking')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  <PlusIcon className="h-4 w-4" />
                  Prenota Prima Lezione
                </button>
              </Card>
            ) : (
              <div className="space-y-4">
                {upcomingLessons.map((lesson) => {
                  const statusConfig = getStatusConfig(lesson.status)
                  const StatusIcon = statusConfig.icon
                  
                  return (
                    <Card key={lesson.id} className="p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-lg font-semibold text-foreground">{lesson.subject}</h3>
                            <div className={cn(
                              'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border',
                              statusConfig.color,
                              statusConfig.bgColor,
                              statusConfig.borderColor
                            )}>
                              <StatusIcon className="h-3 w-3" />
                              {statusConfig.label}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-foreground-muted">
                            <div className="flex items-center gap-2">
                              <UserIcon className="h-4 w-4" />
                              <span>{lesson.tutorName}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <CalendarDaysIcon className="h-4 w-4" />
                              <span>{formatDate(lesson.date)}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <ClockIcon className="h-4 w-4" />
                              <span>{formatTime(lesson.startTime)} - {formatTime(lesson.endTime)}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {lesson.type === 'online' ? (
                                <VideoCameraIcon className="h-4 w-4" />
                              ) : (
                                <MapPinIcon className="h-4 w-4" />
                              )}
                              <span>{lesson.location}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2 ml-4">
                          {lesson.status === 'confirmed' && lesson.meetingLink && (
                            <button className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors">
                              Entra in Lezione
                            </button>
                          )}
                          <button className="px-3 py-1 border border-border rounded text-xs hover:bg-background-secondary transition-colors">
                            Dettagli
                          </button>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'booking' && (
          <div className="space-y-4">
            {/* Booking Filters */}
            <Card className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Materia
                  </label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md text-foreground bg-background"
                  >
                    <option value="">Tutte le materie</option>
                    <option value="matematica">Matematica</option>
                    <option value="fisica">Fisica</option>
                    <option value="chimica">Chimica</option>
                    <option value="inglese">Inglese</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Data
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-border rounded-md text-foreground bg-background"
                  />
                </div>
                
                <div className="flex items-end">
                  <button
                    onClick={fetchAvailableSlots}
                    className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <MagnifyingGlassIcon className="h-4 w-4" />
                    Cerca Slot
                  </button>
                </div>
              </div>
            </Card>

            {/* Available Slots */}
            {bookingLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-foreground-muted">Ricerca slot disponibili...</p>
              </div>
            ) : availableSlots.length === 0 ? (
              <Card className="p-8 text-center">
                <MagnifyingGlassIcon className="h-12 w-12 text-foreground-muted mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Nessuno slot disponibile</h3>
                <p className="text-foreground-muted">
                  Non ci sono slot disponibili per i filtri selezionati. Prova con criteri diversi.
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableSlots.map((slot) => (
                  <Card key={slot.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-foreground">{slot.subject}</h4>
                        <span className="text-xs text-foreground-muted bg-primary/10 px-2 py-1 rounded">
                          Disponibile
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm text-foreground-muted">
                        <div className="flex items-center gap-2">
                          <UserIcon className="h-4 w-4" />
                          <span>{slot.tutor.full_name}</span>
                          {slot.tutor.rating && (
                            <span className="text-yellow-500">★ {slot.tutor.rating}</span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <CalendarDaysIcon className="h-4 w-4" />
                          <span>{formatDate(slot.date)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <ClockIcon className="h-4 w-4" />
                          <span>{formatTime(slot.start_time)} - {formatTime(slot.end_time)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {slot.location === 'Online' ? (
                            <VideoCameraIcon className="h-4 w-4" />
                          ) : (
                            <MapPinIcon className="h-4 w-4" />
                          )}
                          <span>{slot.location}</span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleBookSlot(slot.id)}
                        className="w-full px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
                      >
                        Prenota Lezione
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            {/* History Filters */}
            <div className="flex gap-4">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-3 py-2 border border-border rounded-md text-foreground bg-background"
              >
                <option value="all">Tutte le lezioni</option>
                <option value="this_month">Questo mese</option>
                <option value="last_month">Mese scorso</option>
                <option value="this_year">Quest'anno</option>
              </select>
            </div>

            {/* History List */}
            {historyLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-foreground-muted">Caricamento storico...</p>
              </div>
            ) : completedLessons.length === 0 ? (
              <Card className="p-8 text-center">
                <BookOpenIcon className="h-12 w-12 text-foreground-muted mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Nessuna lezione completata</h3>
                <p className="text-foreground-muted">
                  Non hai ancora completato nessuna lezione. Lo storico apparirà qui dopo le tue prime lezioni.
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {completedLessons.map((lesson) => (
                  <Card key={lesson.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-lg font-semibold text-foreground">{lesson.subject}</h3>
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-600 border border-green-500/20">
                            <CheckIcon className="h-3 w-3" />
                            Completata
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-foreground-muted">
                          <div className="flex items-center gap-2">
                            <UserIcon className="h-4 w-4" />
                            <span>{lesson.tutorName}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <CalendarDaysIcon className="h-4 w-4" />
                            <span>{formatDate(lesson.date)}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <ClockIcon className="h-4 w-4" />
                            <span>{formatTime(lesson.startTime)} - {formatTime(lesson.endTime)}</span>
                          </div>
                        </div>
                        
                        {lesson.rating && (
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-sm text-foreground-muted">Valutazione:</span>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <span
                                  key={i}
                                  className={i < lesson.rating! ? 'text-yellow-500' : 'text-gray-300'}
                                >
                                  ★
                                </span>
                              ))}
                              <span className="text-sm text-foreground-muted ml-1">({lesson.rating}/5)</span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="ml-4">
                        <button className="px-3 py-1 border border-border rounded text-xs hover:bg-background-secondary transition-colors">
                          Dettagli
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </RequireAuth>
  )
}