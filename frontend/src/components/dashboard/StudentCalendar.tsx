"use client"
import { useState, useEffect, useMemo } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

interface CalendarEvent {
  id: string
  title: string
  start: string
  end: string
  type: 'lesson' | 'deadline' | 'exam' | 'reminder'
  status?: 'confirmed' | 'pending' | 'cancelled'
  subject?: string
  tutor?: string
  location?: string
  description?: string
  color?: string
}

interface StudentCalendarProps {
  className?: string
}

const eventColors: Record<string, string | Record<string, string>> = {
  lesson: {
    confirmed: '#10b981', // green
    pending: '#f59e0b',   // yellow
    cancelled: '#ef4444'  // red
  },
  deadline: '#dc2626',    // red
  exam: '#7c3aed',       // purple
  reminder: '#3b82f6'    // blue
}

export default function StudentCalendar({ className }: StudentCalendarProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'dayGridMonth' | 'timeGridWeek' | 'listWeek'>('dayGridMonth')

  // API call per ottenere gli eventi del calendario
  useEffect(() => {
    // API call per ottenere gli eventi del calendario
    const fetchCalendarEvents = async () => {
      try {
        setLoading(true)
        
        console.log('🔍 Fetching calendar events from backend...')
        
        // Chiama l'endpoint per ottenere gli eventi del calendario
        const token = localStorage.getItem('token')
        if (!token) {
          console.warn('⚠️ No token found, user not authenticated')
          setEvents([])
          return
        }

        // Per ora non c'è un endpoint dedicato al calendario, impostiamo array vuoto
        setEvents([])
        
      } catch (err) {
        console.error('❌ Error fetching calendar events:', err)
        setEvents([])
      } finally {
        setLoading(false)
      }
    }

    fetchCalendarEvents()
  }, [])

  // Formatta eventi per FullCalendar
  const calendarEvents = useMemo(() => {
    return events.map(event => {
      let backgroundColor = event.color
      
      if (event.type === 'lesson' && event.status) {
        const lessonColors = eventColors.lesson as Record<string, string>
        backgroundColor = lessonColors[event.status] || backgroundColor
      } else if (event.type in eventColors) {
        const colorValue = eventColors[event.type]
        if (typeof colorValue === 'string') {
          backgroundColor = colorValue
        }
      }

      return {
        id: event.id,
        title: event.title,
        start: event.start,
        end: event.end,
        backgroundColor,
        borderColor: backgroundColor,
        textColor: '#ffffff',
        extendedProps: {
          type: event.type,
          status: event.status,
          subject: event.subject,
          tutor: event.tutor,
          location: event.location,
          description: event.description
        }
      }
    })
  }, [events])

  const handleEventClick = (info: any) => {
    const event = info.event
    const props = event.extendedProps
    
    // Mostra dettagli evento in modal o tooltip
    console.log('Event clicked:', {
      title: event.title,
      start: event.start,
      end: event.end,
      ...props
    })
    
    // TODO: Implementare modal dettagli evento
  }

  const handleDateSelect = (selectInfo: any) => {
    // Per studenti view-only, non permettere creazione eventi
    console.log('Date selected:', selectInfo.startStr)
    
    // TODO: Mostrare modal per visualizzare eventi del giorno
  }

  if (loading) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="animate-pulse">
          <div className="h-4 bg-background-secondary rounded w-3/4 mb-4"></div>
          <div className="h-8 bg-background-secondary rounded w-1/2 mb-6"></div>
          <div className="h-96 bg-background-secondary rounded"></div>
        </div>
      </Card>
    )
  }

  return (
    <Card className={cn("p-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Calendario Lezioni</h3>
          <p className="text-sm text-foreground-muted">
            Visualizza le tue lezioni, scadenze e promemoria
          </p>
        </div>
        
        {/* View Controls */}
        <div className="flex gap-2">
          <button
            onClick={() => setView('dayGridMonth')}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-md border transition-colors",
              view === 'dayGridMonth'
                ? "bg-primary text-white border-primary"
                : "bg-background-secondary text-foreground-secondary border-border hover:bg-background-tertiary"
            )}
          >
            Mese
          </button>
          <button
            onClick={() => setView('timeGridWeek')}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-md border transition-colors",
              view === 'timeGridWeek'
                ? "bg-primary text-white border-primary"
                : "bg-background-secondary text-foreground-secondary border-border hover:bg-background-tertiary"
            )}
          >
            Settimana
          </button>
          <button
            onClick={() => setView('listWeek')}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-md border transition-colors",
              view === 'listWeek'
                ? "bg-primary text-white border-primary"
                : "bg-background-secondary text-foreground-secondary border-border hover:bg-background-tertiary"
            )}
          >
            Lista
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-foreground mb-3">Legenda Eventi</h4>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-foreground-muted">Lezione Confermata</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-foreground-muted">Lezione in Attesa</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-foreground-muted">Scadenza/Esame</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span className="text-foreground-muted">Esame</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-foreground-muted">Promemoria</span>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-background-secondary rounded-lg p-4">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          headerToolbar={false}
          initialView={view}
          views={{
            dayGridMonth: {
              titleFormat: { month: 'long', year: 'numeric' }
            },
            timeGridWeek: {
              titleFormat: { month: 'short', day: 'numeric', year: 'numeric' }
            },
            listWeek: {
              titleFormat: { month: 'long', year: 'numeric' }
            }
          }}
          events={calendarEvents}
          eventClick={handleEventClick}
          select={handleDateSelect}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          moreLinkClick="popover"
          eventDisplay="block"
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            meridiem: false,
            hour12: false
          }}
          slotMinTime="08:00:00"
          slotMaxTime="20:00:00"
          allDaySlot={false}
          slotDuration="00:30:00"
          slotLabelFormat={{
            hour: '2-digit',
            minute: '2-digit',
            meridiem: false,
            hour12: false
          }}
          locale="it"
          firstDay={1}
          weekends={true}
          editable={false}
          eventResizableFromStart={false}
          eventDrop={() => {}} // Disable event dropping
          eventResize={() => {}} // Disable event resizing
          eventOverlap={false}
          businessHours={{
            daysOfWeek: [1, 2, 3, 4, 5, 6],
            startTime: '08:00',
            endTime: '20:00'
          }}
          nowIndicator={true}
          scrollTime="08:00:00"
          expandRows={true}
          height="600px"
          aspectRatio={1.35}
          eventDidMount={(info) => {
            // Aggiungi tooltip personalizzato
            const eventEl = info.el
            const title = info.event.title
            const description = info.event.extendedProps.description
            
            if (description) {
              eventEl.setAttribute('title', `${title}\n\n${description}`)
            }
          }}
        />
      </div>

      {/* Quick Stats */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-green-500/5 border border-green-500/20 rounded-lg">
          <div className="text-lg font-bold text-green-500">
            {events.filter(e => e.type === 'lesson' && e.status === 'confirmed').length}
          </div>
          <div className="text-xs text-foreground-muted">Lezioni Confermate</div>
        </div>
        <div className="text-center p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
          <div className="text-lg font-bold text-yellow-500">
            {events.filter(e => e.type === 'lesson' && e.status === 'pending').length}
          </div>
          <div className="text-xs text-foreground-muted">In Attesa</div>
        </div>
        <div className="text-center p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
          <div className="text-lg font-bold text-red-500">
            {events.filter(e => e.type === 'deadline').length}
          </div>
          <div className="text-xs text-foreground-muted">Scadenze</div>
        </div>
        <div className="text-center p-3 bg-purple-500/5 border border-purple-500/20 rounded-lg">
          <div className="text-lg font-bold text-purple-500">
            {events.filter(e => e.type === 'exam').length}
          </div>
          <div className="text-xs text-foreground-muted">Esami</div>
        </div>
      </div>
    </Card>
  )
}
