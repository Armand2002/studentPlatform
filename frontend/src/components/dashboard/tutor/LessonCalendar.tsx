'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { api } from '@/lib/api';

interface Lesson {
  id: number;
  title: string;
  student: string;
  subject: string;
  date: string;
  time: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'pending';
  type: 'online' | 'in-person';
  location?: string;
}

export function LessonCalendar() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<'day' | 'week'>('week');

  const loadLessons = async () => {
    setLoading(true);
    setError(null);
    try {
      // Ottieni lezioni dal backend
      const response = await api.get('/api/bookings');
      const bookings = response.data;
      
      // Trasforma bookings in formato Lesson
      const transformedLessons: Lesson[] = bookings.map((booking: any) => {
        const getStatus = (bookingStatus: string): Lesson['status'] => {
          if (!bookingStatus) return 'pending';
          const status = bookingStatus.toLowerCase();
          if (status === 'completed') return 'completed';
          if (status === 'confirmed') return 'scheduled';
          if (status === 'cancelled') return 'cancelled';
          return 'pending';
        };

        return {
          id: booking.id,
          title: `Lezione ${booking.subject || 'N/A'}`,
          student: `${booking.student?.first_name || ''} ${booking.student?.last_name || ''}`.trim() || 'N/A',
          subject: booking.subject || 'N/A',
          date: booking.start_time?.split('T')[0] || new Date().toISOString().split('T')[0],
          time: booking.start_time?.split('T')[1]?.slice(0, 5) || '00:00',
          duration: booking.duration_hours ? booking.duration_hours * 60 : 60,
          status: getStatus(booking.status),
          type: 'online', // Default a online, da estendere nel backend
          location: undefined
        };
      });
      
      setLessons(transformedLessons);
    } catch (err) {
      console.error('Error loading lessons data:', err);
      setError('Impossibile caricare il calendario lezioni');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLessons();
  }, []);

  const getStatusColor = (status: Lesson['status']) => {
    switch (status) {
      case 'scheduled': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'completed': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'cancelled': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'pending': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      default: return 'text-foreground-secondary bg-background-secondary border-border';
    }
  };

  const getStatusText = (status: Lesson['status']) => {
    switch (status) {
      case 'scheduled': return 'Programmata';
      case 'completed': return 'Completata';
      case 'cancelled': return 'Cancellata';
      case 'pending': return 'In attesa';
      default: return 'Sconosciuto';
    }
  };

  const getWeekDates = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay() + 1); // Monday
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    
    return week;
  };

  const getDayLessons = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return lessons.filter(lesson => lesson.date === dateStr);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('it-IT', { 
      weekday: 'short', 
      day: 'numeric',
      month: 'short'
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-foreground/10 rounded mb-4 w-1/3"></div>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {[...Array(7)].map((_, i) => (
              <div key={`day-skeleton-${i}`} className="h-8 bg-foreground/10 rounded"></div>
            ))}
          </div>
          <div className="space-y-2">
            <div className="h-16 bg-foreground/10 rounded"></div>
            <div className="h-16 bg-foreground/10 rounded"></div>
            <div className="h-16 bg-foreground/10 rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-foreground-secondary">
          <p>Errore nel caricamento del calendario</p>
          <button 
            onClick={loadLessons}
            className="mt-2 text-primary hover:text-primary/80"
          >
            Riprova
          </button>
        </div>
      </Card>
    );
  }

  const weekDates = getWeekDates(selectedDate);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Calendario Lezioni</h3>
          <p className="text-sm text-foreground-secondary">
            {selectedDate.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* View Toggle & Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const newDate = new Date(selectedDate);
              newDate.setDate(selectedDate.getDate() - 7);
              setSelectedDate(newDate);
            }}
            className="p-2 text-foreground-secondary hover:text-foreground hover:bg-background-secondary rounded-md transition-colors"
          >
            ←
          </button>
          
          <div className="flex bg-background-secondary rounded-lg p-1">
            <button
              onClick={() => setView('day')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                view === 'day' 
                  ? 'bg-primary text-white' 
                  : 'text-foreground-secondary hover:text-foreground'
              }`}
            >
              Giorno
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                view === 'week' 
                  ? 'bg-primary text-white' 
                  : 'text-foreground-secondary hover:text-foreground'
              }`}
            >
              Settimana
            </button>
          </div>

          <button
            onClick={() => {
              const newDate = new Date(selectedDate);
              newDate.setDate(selectedDate.getDate() + 7);
              setSelectedDate(newDate);
            }}
            className="p-2 text-foreground-secondary hover:text-foreground hover:bg-background-secondary rounded-md transition-colors"
          >
            →
          </button>
        </div>
      </div>

      {view === 'week' ? (
        <>
          {/* Week Headers */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {weekDates.map((date, index) => (
              <div 
                key={`weekday-${index}`}
                className={`text-center p-2 rounded-lg cursor-pointer transition-colors ${
                  isToday(date) 
                    ? 'bg-primary/20 text-primary font-semibold' 
                    : 'bg-background-secondary text-foreground-secondary hover:bg-background-tertiary'
                }`}
                onClick={() => setSelectedDate(date)}
              >
                <div className="text-xs">{formatDate(date)}</div>
                <div className="text-xs mt-1">
                  {getDayLessons(date).length} lezioni
                </div>
              </div>
            ))}
          </div>

          {/* Week Lessons */}
          <div className="grid grid-cols-7 gap-2">
            {weekDates.map((date, index) => {
              const dayLessons = getDayLessons(date);
              return (
                <div key={`day-lessons-${index}`} className="space-y-1">
                  {dayLessons.map((lesson) => (
                    <div 
                      key={lesson.id}
                      className={`p-2 rounded border text-xs ${getStatusColor(lesson.status)}`}
                    >
                      <div className="font-medium truncate">{lesson.time}</div>
                      <div className="truncate">{lesson.student}</div>
                      <div className="truncate text-xs">{lesson.subject}</div>
                    </div>
                  ))}
                  {dayLessons.length === 0 && (
                    <div className="p-2 text-center text-foreground-secondary/50 text-xs">
                      Nessuna lezione
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      ) : (
        // Day View
        <div className="space-y-3">
          {getDayLessons(selectedDate).map((lesson) => (
            <div 
              key={lesson.id}
              className={`p-4 rounded-lg border ${getStatusColor(lesson.status)}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{lesson.time}</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-background-secondary">
                    {lesson.duration}min
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-background-secondary">
                    {lesson.type === 'online' ? '💻' : '🏫'} {lesson.type}
                  </span>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-current/10">
                  {getStatusText(lesson.status)}
                </span>
              </div>
              
              <div className="mb-2">
                <div className="font-medium text-foreground">{lesson.student}</div>
                <div className="text-sm text-foreground-secondary">{lesson.subject}</div>
                {lesson.location && (
                  <div className="text-xs text-foreground-secondary">📍 {lesson.location}</div>
                )}
              </div>

              <div className="flex gap-2">
                <button className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-md hover:bg-primary/20 transition-colors">
                  Modifica
                </button>
                <button className="px-3 py-1 bg-red-500/10 text-red-500 text-xs rounded-md hover:bg-red-500/20 transition-colors">
                  Cancella
                </button>
              </div>
            </div>
          ))}

          {getDayLessons(selectedDate).length === 0 && (
            <div className="text-center py-8 text-foreground-secondary">
              <div className="text-4xl mb-2">📅</div>
              <p>Nessuna lezione programmata</p>
              <p className="text-sm mt-1">
                {formatDate(selectedDate)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Quick Stats */}
      <div className="mt-6 pt-4 border-t border-border grid grid-cols-4 gap-4 text-center">
        <div>
          <div className="text-lg font-bold text-blue-500">
            {lessons.filter(l => l.status === 'scheduled').length}
          </div>
          <div className="text-xs text-foreground-secondary">Programmate</div>
        </div>
        <div>
          <div className="text-lg font-bold text-green-500">
            {lessons.filter(l => l.status === 'completed').length}
          </div>
          <div className="text-xs text-foreground-secondary">Completate</div>
        </div>
        <div>
          <div className="text-lg font-bold text-yellow-500">
            {lessons.filter(l => l.status === 'pending').length}
          </div>
          <div className="text-xs text-foreground-secondary">In attesa</div>
        </div>
        <div>
          <div className="text-lg font-bold text-red-500">
            {lessons.filter(l => l.status === 'cancelled').length}
          </div>
          <div className="text-xs text-foreground-secondary">Cancellate</div>
        </div>
      </div>
    </Card>
  );
}
