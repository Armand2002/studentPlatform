"use client"
import { useState, useEffect, useMemo } from 'react'
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  AcademicCapIcon,
  UserIcon,
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon as ClockIconSolid,
  ChartBarIcon,
  DocumentTextIcon,
  EyeIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

interface LessonRecord {
  id: string
  subject: string
  tutorName: string
  tutorAvatar?: string
  date: string
  startTime: string
  endTime: string
  duration: number
  location: string
  status: 'completed' | 'cancelled' | 'no_show'
  rating?: number
  notes?: string
  materials?: string[]
  price: number
  packageUsed?: string
  topics: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  satisfaction: 'very_satisfied' | 'satisfied' | 'neutral' | 'dissatisfied' | 'very_dissatisfied'
}

interface LessonHistoryPageProps {
  className?: string
}

const statusConfig = {
  completed: {
    color: 'text-green-500 bg-green-500/10 border-green-500/20',
    icon: CheckCircleIcon,
    label: 'Completata'
  },
  cancelled: {
    color: 'text-red-500 bg-red-500/10 border-red-500/20',
    icon: XCircleIcon,
    label: 'Cancellata'
  },
  no_show: {
    color: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
    icon: ClockIconSolid,
    label: 'Non Presente'
  }
}

const difficultyConfig = {
  beginner: {
    color: 'text-green-500 bg-green-500/10',
    label: 'Principiante'
  },
  intermediate: {
    color: 'text-yellow-500 bg-yellow-500/10',
    label: 'Intermedio'
  },
  advanced: {
    color: 'text-red-500 bg-red-500/10',
    label: 'Avanzato'
  }
}

const satisfactionConfig = {
  very_satisfied: { color: 'text-green-500', label: 'Molto Soddisfatto', icon: '😍' },
  satisfied: { color: 'text-green-400', label: 'Soddisfatto', icon: '😊' },
  neutral: { color: 'text-yellow-500', label: 'Neutrale', icon: '😐' },
  dissatisfied: { color: 'text-orange-500', label: 'Insoddisfatto', icon: '😕' },
  very_dissatisfied: { color: 'text-red-500', label: 'Molto Insoddisfatto', icon: '😞' }
}

export default function LessonHistoryPage({ className }: LessonHistoryPageProps) {
  const [lessons, setLessons] = useState<LessonRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSubject, setSelectedSubject] = useState<string>('all')
  const [selectedTutor, setSelectedTutor] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'date' | 'subject' | 'tutor' | 'rating'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Mock data per sviluppo - sarà sostituito con API call
  useEffect(() => {
    const mockLessons: LessonRecord[] = [
      {
        id: '1',
        subject: 'Matematica',
        tutorName: 'Prof. Rossi',
        date: '2025-08-28',
        startTime: '14:00',
        endTime: '15:30',
        duration: 90,
        location: 'Online',
        status: 'completed',
        rating: 5,
        notes: 'Lezione molto produttiva su calcolo differenziale. Il professore è stato chiaro e ha risolto tutti i miei dubbi.',
        materials: ['formule_calcolo.pdf', 'esercizi_risolti.pdf'],
        price: 45.00,
        packageUsed: 'Pacchetto Matematica Base',
        topics: ['Calcolo Differenziale', 'Derivate', 'Regole di Derivazione'],
        difficulty: 'intermediate',
        satisfaction: 'very_satisfied'
      },
      {
        id: '2',
        subject: 'Fisica',
        tutorName: 'Prof. Bianchi',
        date: '2025-08-25',
        startTime: '16:00',
        endTime: '17:30',
        duration: 90,
        location: 'Aula 3',
        status: 'completed',
        rating: 4,
        notes: 'Buona lezione sulla meccanica classica. Alcuni concetti potrebbero essere spiegati meglio.',
        materials: ['meccanica_classica.pdf'],
        price: 50.00,
        packageUsed: 'Pacchetto Fisica Avanzato',
        topics: ['Meccanica Classica', 'Dinamica', 'Forze'],
        difficulty: 'advanced',
        satisfaction: 'satisfied'
      },
      {
        id: '3',
        subject: 'Chimica',
        tutorName: 'Prof. Verdi',
        date: '2025-08-22',
        startTime: '10:00',
        endTime: '11:30',
        duration: 90,
        location: 'Laboratorio B',
        status: 'completed',
        rating: 5,
        notes: 'Eccellente lezione pratica in laboratorio. Ho imparato molto sulla chimica inorganica.',
        materials: ['chimica_inorganica.pdf', 'protocollo_lab.pdf'],
        price: 55.00,
        packageUsed: 'Pacchetto Chimica',
        topics: ['Chimica Inorganica', 'Reazioni', 'Laboratorio'],
        difficulty: 'intermediate',
        satisfaction: 'very_satisfied'
      },
      {
        id: '4',
        subject: 'Matematica',
        tutorName: 'Prof. Rossi',
        date: '2025-08-20',
        startTime: '14:00',
        endTime: '15:30',
        duration: 90,
        location: 'Online',
        status: 'cancelled',
        rating: undefined,
        notes: 'Lezione cancellata per motivi personali del tutor.',
        materials: [],
        price: 0.00,
        packageUsed: 'Pacchetto Matematica Base',
        topics: ['Integrali', 'Calcolo Indefinito'],
        difficulty: 'intermediate',
        satisfaction: 'neutral'
      },
      {
        id: '5',
        subject: 'Fisica',
        tutorName: 'Prof. Bianchi',
        date: '2025-08-18',
        startTime: '16:00',
        endTime: '17:30',
        duration: 90,
        location: 'Aula 3',
        status: 'completed',
        rating: 3,
        notes: 'Lezione un po\' confusa. Il professore ha saltato alcuni passaggi importanti.',
        materials: ['termodinamica.pdf'],
        price: 50.00,
        packageUsed: 'Pacchetto Fisica Avanzato',
        topics: ['Termodinamica', 'Entropia', 'Cicli Termodinamici'],
        difficulty: 'advanced',
        satisfaction: 'dissatisfied'
      },
      {
        id: '6',
        subject: 'Chimica',
        tutorName: 'Prof. Verdi',
        date: '2025-08-15',
        startTime: '10:00',
        endTime: '11:30',
        duration: 90,
        location: 'Laboratorio B',
        status: 'no_show',
        rating: undefined,
        notes: 'Non mi sono presentato alla lezione. Scusami per l\'inconveniente.',
        materials: [],
        price: 55.00,
        packageUsed: 'Pacchetto Chimica',
        topics: ['Chimica Organica', 'Idrocarburi'],
        difficulty: 'beginner',
        satisfaction: 'neutral'
      }
    ]

    // Simula API call
    setTimeout(() => {
      setLessons(mockLessons)
      setLoading(false)
    }, 1000)
  }, [])

  const subjects = Array.from(new Set(lessons.map(l => l.subject)))
  const tutors = Array.from(new Set(lessons.map(l => l.tutorName)))
  const statuses = Array.from(new Set(lessons.map(l => l.status)))

  // Filtra lezioni
  const filteredLessons = useMemo(() => {
    return lessons.filter(lesson => {
      const searchMatch = searchQuery === '' || 
        lesson.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lesson.tutorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lesson.topics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const subjectMatch = selectedSubject === 'all' || lesson.subject === selectedSubject
      const tutorMatch = selectedTutor === 'all' || lesson.tutorName === selectedTutor
      const statusMatch = selectedStatus === 'all' || lesson.status === selectedStatus
      
      let periodMatch = true
      if (selectedPeriod !== 'all') {
        const lessonDate = new Date(lesson.date)
        const today = new Date()
        const diffTime = today.getTime() - lessonDate.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        
        switch (selectedPeriod) {
          case 'week':
            periodMatch = diffDays <= 7
            break
          case 'month':
            periodMatch = diffDays <= 30
            break
          case 'quarter':
            periodMatch = diffDays <= 90
            break
        }
      }
      
      return searchMatch && subjectMatch && tutorMatch && statusMatch && periodMatch
    })
  }, [lessons, searchQuery, selectedSubject, selectedTutor, selectedStatus, selectedPeriod])

  // Ordina lezioni
  const sortedLessons = useMemo(() => {
    return [...filteredLessons].sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
          break
        case 'subject':
          comparison = a.subject.localeCompare(b.subject)
          break
        case 'tutor':
          comparison = a.tutorName.localeCompare(b.tutorName)
          break
        case 'rating':
          comparison = (a.rating || 0) - (b.rating || 0)
          break
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })
  }, [filteredLessons, sortBy, sortOrder])

  // Statistiche
  const stats = useMemo(() => {
    const completed = lessons.filter(l => l.status === 'completed').length
    const total = lessons.length
    const totalHours = lessons.filter(l => l.status === 'completed').reduce((sum, l) => sum + l.duration, 0)
    const totalSpent = lessons.filter(l => l.status === 'completed').reduce((sum, l) => sum + l.price, 0)
    const avgRating = lessons.filter(l => l.rating).reduce((sum, l) => sum + (l.rating || 0), 0) / lessons.filter(l => l.rating).length
    
    return {
      completed,
      total,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
      totalHours: totalHours / 60, // Converti in ore
      totalSpent,
      avgRating: avgRating || 0
    }
  }, [lessons])

  const getStatusConfig = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.completed
  }

  const getDifficultyConfig = (difficulty: string) => {
    return difficultyConfig[difficulty as keyof typeof difficultyConfig] || difficultyConfig.intermediate
  }

  const getSatisfactionConfig = (satisfaction: string) => {
    return satisfactionConfig[satisfaction as keyof typeof satisfactionConfig] || satisfactionConfig.neutral
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  if (loading) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="animate-pulse">
          <div className="h-4 bg-background-secondary rounded w-3/4 mb-4"></div>
          <div className="h-8 bg-background-secondary rounded w-1/2 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-background-secondary rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Storico Lezioni</h1>
          <p className="text-foreground-muted">
            Visualizza e analizza tutte le tue lezioni passate
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="p-2 text-foreground-muted hover:text-primary transition-colors">
            <ChartBarIcon className="h-5 w-5" />
          </button>
          <button className="p-2 text-foreground-muted hover:text-primary transition-colors">
            <ArrowDownTrayIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="text-center p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
          <div className="text-2xl font-bold text-blue-500">{stats.total}</div>
          <div className="text-xs text-foreground-muted">Lezioni Totali</div>
        </div>
        <div className="text-center p-4 bg-green-500/5 border border-green-500/20 rounded-lg">
          <div className="text-2xl font-bold text-green-500">{stats.completed}</div>
          <div className="text-xs text-foreground-muted">Completate</div>
        </div>
        <div className="text-center p-4 bg-purple-500/5 border border-purple-500/20 rounded-lg">
          <div className="text-2xl font-bold text-purple-500">{stats.completionRate.toFixed(1)}%</div>
          <div className="text-xs text-foreground-muted">Tasso Completamento</div>
        </div>
        <div className="text-center p-4 bg-orange-500/5 border border-orange-500/20 rounded-lg">
          <div className="text-2xl font-bold text-orange-500">{stats.totalHours.toFixed(1)}h</div>
          <div className="text-xs text-foreground-muted">Ore Totali</div>
        </div>
        <div className="text-center p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
          <div className="text-2xl font-bold text-yellow-500">{stats.avgRating.toFixed(1)}</div>
          <div className="text-xs text-foreground-muted">Rating Medio</div>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-foreground-muted" />
            <input
              type="text"
              placeholder="Cerca per materia, tutor, argomenti..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <FunnelIcon className="h-4 w-4 text-foreground-muted" />
              <span className="text-sm font-medium text-foreground">Filtri:</span>
            </div>

            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-1.5 text-sm bg-background-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">Tutte le materie</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>

            <select
              value={selectedTutor}
              onChange={(e) => setSelectedTutor(e.target.value)}
              className="px-3 py-1.5 text-sm bg-background-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">Tutti i tutor</option>
              {tutors.map(tutor => (
                <option key={tutor} value={tutor}>{tutor}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 text-sm bg-background-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">Tutti gli stati</option>
              {statuses.map(status => (
                <option key={status} value={status}>
                  {statusConfig[status as keyof typeof statusConfig]?.label}
                </option>
              ))}
            </select>

            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-1.5 text-sm bg-background-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">Tutti i periodi</option>
              <option value="week">Ultima settimana</option>
              <option value="month">Ultimo mese</option>
              <option value="quarter">Ultimo trimestre</option>
            </select>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-foreground">Ordina per:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 text-sm bg-background-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="date">Data</option>
              <option value="subject">Materia</option>
              <option value="tutor">Tutor</option>
              <option value="rating">Rating</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-1.5 text-sm bg-background-secondary border border-border rounded-md hover:bg-background-tertiary transition-colors"
            >
              {sortOrder === 'asc' ? '↑ Crescente' : '↓ Decrescente'}
            </button>
          </div>
        </div>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-foreground-muted">
          {filteredLessons.length} lezione{filteredLessons.length !== 1 ? 'i' : ''} trovata{filteredLessons.length !== 1 ? 'e' : ''}
        </p>
        <p className="text-sm text-foreground-muted">
          Speso totale: {formatCurrency(stats.totalSpent)}
        </p>
      </div>

      {/* Lessons List */}
      <div className="space-y-4">
        {sortedLessons.length === 0 ? (
          <Card className="p-8 text-center">
            <DocumentTextIcon className="h-12 w-12 text-foreground-muted mx-auto mb-3" />
            <h3 className="text-lg font-medium text-foreground mb-2">Nessuna lezione trovata</h3>
            <p className="text-foreground-muted">
              Prova a modificare i filtri o la ricerca per vedere più risultati
            </p>
          </Card>
        ) : (
          sortedLessons.map((lesson) => {
            const statusConfig = getStatusConfig(lesson.status)
            const difficultyConfig = getDifficultyConfig(lesson.difficulty)
            const satisfactionConfig = getSatisfactionConfig(lesson.satisfaction)
            const StatusIcon = statusConfig.icon

            return (
              <Card key={lesson.id} className="p-6 hover:shadow-lg transition-all duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className={cn(
                        "p-3 rounded-lg",
                        lesson.status === 'completed' ? 'bg-green-500/10' : 'bg-red-500/10'
                      )}>
                        <StatusIcon className={cn("h-6 w-6", statusConfig.color)} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-medium text-foreground">{lesson.subject}</h3>
                          <span className={cn(
                            "px-2 py-1 text-xs font-medium rounded-full border",
                            statusConfig.color
                          )}>
                            {statusConfig.label}
                          </span>
                          <span className={cn(
                            "px-2 py-1 text-xs font-medium rounded-full",
                            difficultyConfig.color
                          )}>
                            {difficultyConfig.label}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-foreground-muted mb-2">
                          <span className="flex items-center gap-1">
                            <UserIcon className="h-4 w-4" />
                            {lesson.tutorName}
                          </span>
                          <span className="flex items-center gap-1">
                            <CalendarDaysIcon className="h-4 w-4" />
                            {new Date(lesson.date).toLocaleDateString('it-IT', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <ClockIcon className="h-4 w-4" />
                            {lesson.startTime} - {lesson.endTime} ({lesson.duration} min)
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPinIcon className="h-4 w-4" />
                            {lesson.location}
                          </span>
                        </div>

                        {/* Topics */}
                        <div className="mb-3">
                          <p className="text-sm text-foreground-secondary mb-2">
                            <strong>Argomenti:</strong> {lesson.topics.join(', ')}
                          </p>
                        </div>

                        {/* Notes */}
                        {lesson.notes && (
                          <div className="mb-3">
                            <p className="text-sm text-foreground-secondary">
                              <strong>Note:</strong> {lesson.notes}
                            </p>
                          </div>
                        )}

                        {/* Materials */}
                        {lesson.materials && lesson.materials.length > 0 && (
                          <div className="mb-3">
                            <p className="text-sm text-foreground-secondary mb-2">
                              <strong>Materiali:</strong>
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {lesson.materials.map((material, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 text-xs bg-background-secondary border border-border rounded-md"
                                >
                                  {material}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-foreground-muted">
                          Pacchetto: {lesson.packageUsed}
                        </span>
                        <span className="font-medium text-foreground">
                          {formatCurrency(lesson.price)}
                        </span>
                        {lesson.rating && (
                          <span className="flex items-center gap-1">
                            <span className="text-yellow-500">★</span>
                            {lesson.rating}/5
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          {satisfactionConfig.icon} {satisfactionConfig.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button className="p-2 text-foreground-muted hover:text-primary transition-colors">
                          <EyeIcon className="h-4 w-4" />
                        </button>
                                  <button className="p-2 text-foreground-muted hover:text-primary transition-colors">
            <ArrowDownTrayIcon className="h-4 w-4" />
          </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
