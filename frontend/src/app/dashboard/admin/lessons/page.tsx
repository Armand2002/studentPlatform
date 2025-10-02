'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  AcademicCapIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  PlayCircleIcon,
  DocumentTextIcon,
  CurrencyEuroIcon,
  ChartBarIcon,
  EyeIcon,
  PencilIcon
} from '@heroicons/react/24/outline'
import { api } from '@/lib/api'
import { useForm } from '@/hooks/useForm'

interface Lesson {
  id: number
  student: {
    id: number
    first_name: string
    last_name: string
    email: string
    institute?: string
  }
  tutor: {
    id: number
    first_name: string
    last_name: string
    email: string
  }
  subject: string
  start_time: string
  end_time: string
  duration_hours: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  notes?: string
  calculated_price?: number
  tutor_earnings?: number
  platform_fee?: number
  created_at: string
  package_purchase?: {
    id: number
    package: {
      name: string
    }
  }
}

interface LessonStats {
  total_lessons: number
  pending_lessons: number
  confirmed_lessons: number
  completed_lessons: number
  cancelled_lessons: number
  completed_revenue: number
  today_lessons: number
  week_lessons: number
  completion_rate: number
  cancellation_rate: number
}

interface LessonFilters {
  status: string
  student_id: string
  tutor_id: string
  subject: string
  date_from: string
  date_to: string
}

export default function AdminLessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [stats, setStats] = useState<LessonStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [showStatusModal, setShowStatusModal] = useState(false)

  const [filters, setFilters] = useState<LessonFilters>({
    status: 'all',
    student_id: '',
    tutor_id: '',
    subject: '',
    date_from: '',
    date_to: ''
  })

  const { formState: { data: statusFormData, loading: updatingStatus }, updateField: updateStatusField, handleSubmit: handleStatusSubmit } = useForm({
    status: '',
    admin_notes: ''
  })

  const fetchLessons = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (filters.status !== 'all') params.append('status', filters.status)
      if (filters.student_id) params.append('student_id', filters.student_id)
      if (filters.tutor_id) params.append('tutor_id', filters.tutor_id)
      if (filters.subject) params.append('subject', filters.subject)
      if (filters.date_from) params.append('date_from', filters.date_from)
      if (filters.date_to) params.append('date_to', filters.date_to)

      const [lessonsRes, statsRes] = await Promise.all([
        api.get(`/api/admin/lessons?${params.toString()}`),
        api.get('/api/admin/lessons/stats')
      ])

      setLessons(lessonsRes.data || [])
      setStats(statsRes.data)

    } catch (err) {
      console.error('Error fetching lessons:', err)
      setError('Errore nel caricamento delle lezioni')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLessons()
  }, [filters])

  const updateLessonStatus = async (data: any) => {
    if (!selectedLesson) return
    
    try {
      await api.put(`/api/admin/lessons/${selectedLesson.id}/status`, {
        status: data.status,
        admin_notes: data.admin_notes
      })
      
      await fetchLessons() // Refresh data
      setShowStatusModal(false)
      setSelectedLesson(null)
    } catch (err) {
      throw err
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="w-4 h-4" />
      case 'confirmed':
        return <CheckCircleIcon className="w-4 h-4" />
      case 'completed':
        return <PlayCircleIcon className="w-4 h-4" />
      case 'cancelled':
        return <XCircleIcon className="w-4 h-4" />
      default:
        return <ClockIcon className="w-4 h-4" />
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A'
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const filteredLessons = lessons.filter(lesson =>
    lesson.student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lesson.student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lesson.tutor.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lesson.tutor.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lesson.subject.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-background-secondary rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-background-secondary rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-background-secondary rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Gestione Lezioni (Admin)
        </h1>
        <p className="text-foreground-secondary">
          Visualizza e gestisci tutte le lezioni della piattaforma con controllo completo degli stati.
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <CalendarDaysIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-foreground-muted">Totali</p>
                <p className="text-2xl font-semibold text-foreground">{stats.total_lessons}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <ClockIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-foreground-muted">Pending</p>
                <p className="text-2xl font-semibold text-foreground">{stats.pending_lessons}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-foreground-muted">Confermate</p>
                <p className="text-2xl font-semibold text-foreground">{stats.confirmed_lessons}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <PlayCircleIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-foreground-muted">Completate</p>
                <p className="text-2xl font-semibold text-foreground">{stats.completed_lessons}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <XCircleIcon className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-foreground-muted">Cancellate</p>
                <p className="text-2xl font-semibold text-foreground">{stats.cancelled_lessons}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Additional Stats Row */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <CurrencyEuroIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-foreground-muted">Revenue Completate</p>
                <p className="text-2xl font-semibold text-foreground">{formatCurrency(stats.completed_revenue)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <ChartBarIcon className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-foreground-muted">Tasso Completamento</p>
                <p className="text-2xl font-semibold text-foreground">{stats.completion_rate.toFixed(1)}%</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <CalendarDaysIcon className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-foreground-muted">Oggi</p>
                <p className="text-2xl font-semibold text-foreground">{stats.today_lessons}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-cyan-100 rounded-lg">
                <CalendarDaysIcon className="w-6 h-6 text-cyan-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-foreground-muted">Questa Settimana</p>
                <p className="text-2xl font-semibold text-foreground">{stats.week_lessons}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-muted" />
            <input
              type="text"
              placeholder="Cerca per studente, tutor o materia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <FunnelIcon className="w-4 h-4" />
            <span>Filtri</span>
          </Button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Stato</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                >
                  <option value="all">Tutti</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confermate</option>
                  <option value="completed">Completate</option>
                  <option value="cancelled">Cancellate</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Materia</label>
                <select
                  value={filters.subject}
                  onChange={(e) => setFilters(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                >
                  <option value="">Tutte</option>
                  <option value="matematica">Matematica</option>
                  <option value="fisica">Fisica</option>
                  <option value="chimica">Chimica</option>
                  <option value="inglese">Inglese</option>
                  <option value="italiano">Italiano</option>
                  <option value="storia">Storia</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Da Data</label>
                <input
                  type="date"
                  value={filters.date_from}
                  onChange={(e) => setFilters(prev => ({ ...prev, date_from: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">A Data</label>
                <input
                  type="date"
                  value={filters.date_to}
                  onChange={(e) => setFilters(prev => ({ ...prev, date_to: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                />
              </div>

              <div className="md:col-span-2 flex items-end space-x-2">
                <Button
                  onClick={() => setFilters({
                    status: 'all',
                    student_id: '',
                    tutor_id: '',
                    subject: '',
                    date_from: '',
                    date_to: ''
                  })}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  Reset Filtri
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Lessons Table */}
      <Card className="overflow-hidden">
        {filteredLessons.length === 0 ? (
          <div className="p-12 text-center">
            <CalendarDaysIcon className="w-12 h-12 text-foreground-muted mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Nessuna lezione trovata
            </h3>
            <p className="text-foreground-muted">
              {searchTerm || Object.values(filters).some(f => f && f !== 'all')
                ? 'Prova a modificare i filtri di ricerca.'
                : 'Non ci sono lezioni registrate nel sistema.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background-secondary">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Lezione
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Studente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Tutor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Data/Ora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Stato
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Prezzo
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Azioni
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredLessons.map((lesson) => (
                  <tr key={lesson.id} className="hover:bg-background-secondary/50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {lesson.subject}
                        </div>
                        <div className="text-sm text-foreground-muted">
                          {lesson.duration_hours}h • #{lesson.id}
                        </div>
                        {lesson.package_purchase && (
                          <div className="text-xs text-foreground-muted">
                            {lesson.package_purchase.package.name}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {lesson.student.first_name} {lesson.student.last_name}
                        </div>
                        <div className="text-sm text-foreground-muted">{lesson.student.email}</div>
                        {lesson.student.institute && (
                          <div className="text-xs text-foreground-muted">{lesson.student.institute}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {lesson.tutor.first_name} {lesson.tutor.last_name}
                        </div>
                        <div className="text-sm text-foreground-muted">{lesson.tutor.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {formatDateTime(lesson.start_time)}
                        </div>
                        <div className="text-sm text-foreground-muted">
                          {new Date(lesson.start_time).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })} - 
                          {new Date(lesson.end_time).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={`${getStatusColor(lesson.status)} border`}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(lesson.status)}
                          <span className="capitalize">{lesson.status}</span>
                        </div>
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {formatCurrency(lesson.calculated_price)}
                        </div>
                        {lesson.tutor_earnings && (
                          <div className="text-xs text-foreground-muted">
                            Tutor: {formatCurrency(lesson.tutor_earnings)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          onClick={() => setSelectedLesson(lesson)}
                          size="sm"
                          variant="outline"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => {
                            setSelectedLesson(lesson)
                            updateStatusField('status', lesson.status)
                            setShowStatusModal(true)
                          }}
                          size="sm"
                          className="bg-primary hover:bg-primary/80"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Lesson Details Modal */}
      {selectedLesson && !showStatusModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">
                  Dettagli Lezione #{selectedLesson.id}
                </h2>
                <button
                  onClick={() => setSelectedLesson(null)}
                  className="text-foreground-muted hover:text-foreground"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-3">Informazioni Lezione</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-foreground-muted">Materia</label>
                      <p className="text-sm text-foreground">{selectedLesson.subject}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground-muted">Durata</label>
                      <p className="text-sm text-foreground">{selectedLesson.duration_hours} ore</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground-muted">Data e Ora</label>
                      <p className="text-sm text-foreground">{formatDateTime(selectedLesson.start_time)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground-muted">Stato</label>
                      <Badge className={getStatusColor(selectedLesson.status)}>
                        {selectedLesson.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-foreground mb-3">Partecipanti</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground-muted">Studente</label>
                      <p className="text-sm text-foreground">
                        {selectedLesson.student.first_name} {selectedLesson.student.last_name}
                      </p>
                      <p className="text-xs text-foreground-muted">{selectedLesson.student.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground-muted">Tutor</label>
                      <p className="text-sm text-foreground">
                        {selectedLesson.tutor.first_name} {selectedLesson.tutor.last_name}
                      </p>
                      <p className="text-xs text-foreground-muted">{selectedLesson.tutor.email}</p>
                    </div>
                  </div>
                </div>

                {(selectedLesson.calculated_price || selectedLesson.tutor_earnings) && (
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-medium text-foreground mb-3">Informazioni Finanziarie</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground-muted">Prezzo Totale</label>
                        <p className="text-sm text-foreground">{formatCurrency(selectedLesson.calculated_price)}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground-muted">Guadagno Tutor</label>
                        <p className="text-sm text-foreground">{formatCurrency(selectedLesson.tutor_earnings)}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground-muted">Fee Piattaforma</label>
                        <p className="text-sm text-foreground">{formatCurrency(selectedLesson.platform_fee)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedLesson.notes && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-foreground-muted mb-1">Note</label>
                    <div className="bg-background-secondary rounded-lg p-3">
                      <p className="text-sm text-foreground whitespace-pre-wrap">{selectedLesson.notes}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between mt-8 pt-6 border-t border-border">
                <Button
                  onClick={() => {
                    updateStatusField('status', selectedLesson.status)
                    setShowStatusModal(true)
                  }}
                  className="bg-primary hover:bg-primary/80"
                >
                  <PencilIcon className="w-4 h-4 mr-2" />
                  Modifica Stato
                </Button>
                <Button
                  onClick={() => setSelectedLesson(null)}
                  variant="outline"
                >
                  Chiudi
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedLesson && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Modifica Stato Lezione
              </h2>

              <form onSubmit={handleStatusSubmit(updateLessonStatus)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Nuovo Stato
                  </label>
                  <select
                    value={statusFormData.status}
                    onChange={(e) => updateStatusField('status', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confermata</option>
                    <option value="completed">Completata</option>
                    <option value="cancelled">Cancellata</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Note Admin (opzionale)
                  </label>
                  <textarea
                    value={statusFormData.admin_notes}
                    onChange={(e) => updateStatusField('admin_notes', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Aggiungi note sul cambio di stato..."
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    onClick={() => {
                      setShowStatusModal(false)
                      setSelectedLesson(null)
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Annulla
                  </Button>
                  <Button
                    type="submit"
                    disabled={updatingStatus}
                    className="flex-1 bg-primary hover:bg-primary/80"
                  >
                    {updatingStatus ? 'Aggiornamento...' : 'Aggiorna Stato'}
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}
    </div>
  )
}
