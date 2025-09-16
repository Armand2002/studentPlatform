"use client"
import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import RequireAuth from '@/components/auth/RequireAuth'
import { 
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  BookOpenIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'

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

export default function BookingPage() {
  const [slots, setSlots] = useState<TutorSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>('')

  useEffect(() => {
    fetchAvailableSlots()
  }, [selectedSubject, selectedDate])

  const fetchAvailableSlots = async () => {
    try {
      setLoading(true)
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
        setSlots(data)
      }
    } catch (error) {
      console.error('Error fetching slots:', error)
    } finally {
      setLoading(false)
    }
  }

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
        fetchAvailableSlots() // Ricarica gli slot
      } else {
        const error = await response.json()
        alert(`Errore: ${error.detail || 'Impossibile prenotare la lezione'}`)
      }
    } catch (error) {
      console.error('Error booking slot:', error)
      alert('Errore di connessione')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    })
  }

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5)
  }

  return (
    <RequireAuth>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 rounded-xl p-6 border border-primary/20">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
            <CalendarDaysIcon className="h-8 w-8 text-primary" />
            Prenota una Lezione
          </h1>
          <p className="text-foreground-secondary text-lg">
            Scegli il tutor e l'orario che preferisci per la tua prossima lezione.
          </p>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <MagnifyingGlassIcon className="h-5 w-5 text-primary" />
            Filtra per preferenze
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Materia
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Tutte le materie</option>
                <option value="Matematica">Matematica</option>
                <option value="Fisica">Fisica</option>
                <option value="Chimica">Chimica</option>
                <option value="Inglese">Inglese</option>
                <option value="Italiano">Italiano</option>
                <option value="Storia">Storia</option>
                <option value="Filosofia">Filosofia</option>
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
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </Card>

        {/* Available Slots */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <ClockIcon className="h-5 w-5 text-primary" />
            Slot Disponibili ({slots.length})
          </h2>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-background-secondary rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : slots.length === 0 ? (
            <div className="text-center py-12">
              <BookOpenIcon className="h-16 w-16 text-foreground-muted mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Nessuno slot disponibile
              </h3>
              <p className="text-foreground-muted">
                Prova a modificare i filtri o scegliere una data diversa.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {slots.map((slot) => (
                <div 
                  key={slot.id}
                  className="p-4 border border-border rounded-lg hover:bg-background-secondary/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="flex items-center gap-2">
                          <UserIcon className="h-4 w-4 text-primary" />
                          <span className="font-medium text-foreground">
                            {slot.tutor.full_name}
                          </span>
                          {slot.tutor.rating && (
                            <span className="text-yellow-500 text-sm">
                              ⭐ {slot.tutor.rating}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <BookOpenIcon className="h-4 w-4 text-primary" />
                          <span className="text-foreground-secondary">{slot.subject}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-foreground-muted">
                        <span className="flex items-center gap-1">
                          <CalendarDaysIcon className="h-3 w-3" />
                          {formatDate(slot.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <ClockIcon className="h-3 w-3" />
                          {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                        </span>
                        <span>📍 {slot.location}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleBookSlot(slot.id)}
                      className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-600 transition-colors font-medium"
                    >
                      Prenota
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </RequireAuth>
  )
}
