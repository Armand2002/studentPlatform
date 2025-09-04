"use client"
import { useState, useEffect } from 'react'
import { 
  AcademicCapIcon,
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  StarIcon,
  ChartBarIcon,
  DocumentTextIcon,
  TrophyIcon,
  BookOpenIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import RequireAuth from '@/components/auth/RequireAuth'

interface CompletedLesson {
  id: string
  subject: string
  tutorName: string
  tutorAvatar?: string
  date: string
  duration: number
  type: 'online' | 'in_person'
  rating?: number
  review?: string
  packageName?: string
  materials?: string[]
  homework?: string
  nextTopics?: string[]
}

interface StudyStats {
  totalLessons: number
  totalHours: number
  averageRating: number
  completedPackages: number
  currentStreak: number
  longestStreak: number
  favoriteSubject: string
  improvementAreas: string[]
}

export default function HistoryPage() {
  const [lessons, setLessons] = useState<CompletedLesson[]>([])
  const [stats, setStats] = useState<StudyStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'this_month' | 'last_month' | 'this_year'>('all')
  const [subjectFilter, setSubjectFilter] = useState<string>('all')

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true)
        
        console.log('🔍 Fetching lesson history from backend...')
        
        // Implementazione API history in attesa di backend endpoint
        // const [lessons, stats] = await Promise.all([
        //   lessonService.getCompletedLessons(),
        //   analyticsService.getStudyStats()
        // ])
        
        // Per ora impostiamo dati vuoti finché non implementiamo il backend
        setLessons([])
        setStats(null)
        
      } catch (err) {
        console.error('❌ Error fetching lesson history:', err)
        setLessons([])
        setStats(null)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [])

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={cn(
              "h-4 w-4",
              star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
            )}
          />
        ))}
      </div>
    )
  }

  const filterByDate = (lesson: CompletedLesson) => {
    const lessonDate = new Date(lesson.date)
    const now = new Date()
    
    switch (filter) {
      case 'this_month':
        return lessonDate.getMonth() === now.getMonth() && lessonDate.getFullYear() === now.getFullYear()
      case 'last_month': {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1)
        return lessonDate.getMonth() === lastMonth.getMonth() && lessonDate.getFullYear() === lastMonth.getFullYear()
      }
      case 'this_year':
        return lessonDate.getFullYear() === now.getFullYear()
      default:
        return true
    }
  }

  const filteredLessons = lessons
    .filter(filterByDate)
    .filter(lesson => subjectFilter === 'all' || lesson.subject === subjectFilter)

  const subjects = Array.from(new Set(lessons.map(l => l.subject)))

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
        <div>
          <h1 className="text-2xl font-bold text-foreground">Storico Lezioni</h1>
          <p className="text-foreground-muted">
            Visualizza le tue lezioni completate e i progressi di studio
          </p>
        </div>

        {/* Study Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <AcademicCapIcon className="h-8 w-8 text-primary" />
              </div>
              <div className="text-2xl font-bold text-foreground">{stats.totalLessons}</div>
              <div className="text-sm text-foreground-muted">Lezioni completate</div>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <ClockIcon className="h-8 w-8 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-foreground">{stats.totalHours}h</div>
              <div className="text-sm text-foreground-muted">Ore di studio</div>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <StarIcon className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="text-2xl font-bold text-foreground">{stats.averageRating.toFixed(1)}</div>
              <div className="text-sm text-foreground-muted">Valutazione media</div>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <TrophyIcon className="h-8 w-8 text-orange-500" />
              </div>
              <div className="text-2xl font-bold text-foreground">{stats.currentStreak}</div>
              <div className="text-sm text-foreground-muted">Giorni consecutivi</div>
            </Card>
          </div>
        )}

        {/* Additional Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Progressi</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-foreground-secondary">Pacchetti completati</span>
                  <span className="font-semibold text-foreground">{stats.completedPackages}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground-secondary">Materia preferita</span>
                  <span className="font-semibold text-foreground">{stats.favoriteSubject}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground-secondary">Record giorni consecutivi</span>
                  <span className="font-semibold text-foreground">{stats.longestStreak} giorni</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Aree di Miglioramento</h3>
              <div className="space-y-2">
                {stats.improvementAreas.map((area, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <ChartBarIcon className="h-4 w-4 text-orange-500" />
                    <span className="text-foreground-secondary">{area}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-foreground-secondary">Periodo:</span>
              {[
                { key: 'all', label: 'Tutto lo storico' },
                { key: 'this_month', label: 'Questo mese' },
                { key: 'last_month', label: 'Mese scorso' },
                { key: 'this_year', label: 'Quest\'anno' }
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

            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="all">Tutte le materie</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>
        </Card>

        {/* Lessons History */}
        <div className="space-y-4">
          {filteredLessons.length === 0 ? (
            <Card className="p-12 text-center">
              <BookOpenIcon className="h-16 w-16 text-foreground-muted mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Nessuna lezione completata
              </h3>
              <p className="text-foreground-muted mb-6">
                {filter === 'all' 
                  ? "Non hai ancora completato nessuna lezione."
                  : `Non hai lezioni completate per il periodo "${filter}".`
                }
              </p>
              <a
                href="/dashboard/student/packages"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                <AcademicCapIcon className="h-4 w-4" />
                Inizia la prima lezione
              </a>
            </Card>
          ) : (
            filteredLessons.map((lesson) => (
              <Card key={lesson.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      <h3 className="text-lg font-semibold text-foreground">{lesson.subject}</h3>
                      <span className="px-2 py-1 text-xs bg-green-500/10 text-green-600 rounded-full border border-green-500/20">
                        Completata
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
                        <span>{lesson.duration} minuti</span>
                      </div>
                    </div>

                    {lesson.packageName && (
                      <div className="flex items-center gap-2 text-sm text-foreground-muted mb-4">
                        <span className="text-primary">📦</span>
                        <span>Pacchetto: {lesson.packageName}</span>
                      </div>
                    )}
                  </div>

                  {lesson.rating && (
                    <div className="text-right">
                      <div className="text-sm text-foreground-muted mb-1">La tua valutazione</div>
                      {renderStars(lesson.rating)}
                    </div>
                  )}
                </div>

                {/* Review */}
                {lesson.review && (
                  <div className="p-3 bg-background-secondary rounded-lg mb-4">
                    <div className="text-sm font-medium text-foreground-secondary mb-1">La tua recensione:</div>
                    <p className="text-sm text-foreground-secondary italic">"{lesson.review}"</p>
                  </div>
                )}

                {/* Materials */}
                {lesson.materials && lesson.materials.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm font-medium text-foreground-secondary mb-2">Materiali utilizzati:</div>
                    <div className="flex flex-wrap gap-2">
                      {lesson.materials.map((material, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-blue-500/10 text-blue-600 rounded border border-blue-500/20"
                        >
                          <DocumentTextIcon className="h-3 w-3 inline mr-1" />
                          {material}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Homework */}
                {lesson.homework && (
                  <div className="mb-4">
                    <div className="text-sm font-medium text-foreground-secondary mb-1">Compiti assegnati:</div>
                    <p className="text-sm text-foreground-secondary">{lesson.homework}</p>
                  </div>
                )}

                {/* Next Topics */}
                {lesson.nextTopics && lesson.nextTopics.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-foreground-secondary mb-2">Prossimi argomenti:</div>
                    <div className="flex flex-wrap gap-2">
                      {lesson.nextTopics.map((topic, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-orange-500/10 text-orange-600 rounded border border-orange-500/20"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </RequireAuth>
  )
}
