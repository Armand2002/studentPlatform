'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  PlusIcon,
  MagnifyingGlassIcon,
  AcademicCapIcon,
  BookOpenIcon,
  CalendarIcon,
  UserIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { api } from '@/lib/api'

interface Assignment {
  id: number
  student: {
    id: number
    firstName: string
    lastName: string
    email: string
    institute?: string
    classLevel?: string
  }
  tutor: {
    id: number
    firstName: string
    lastName: string
    email: string
    subjects?: string
  }
  package: {
    id: number
    name: string
    totalHours: number
    usedHours: number
    remainingHours: number
  }
  status: 'active' | 'completed' | 'suspended' | 'pending'
  createdAt: string
  activatedAt?: string | null
  completedAt?: string | null
  assignedBy: string
  notes?: string
}

interface CreateAssignmentData {
  studentId: number
  tutorId: number
  packageId: number
  notes?: string
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [tutors, setTutors] = useState<any[]>([])
  const [packages, setPackages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [assignmentsRes, studentsRes, tutorsRes, packagesRes] = await Promise.all([
        api.get('/api/admin/package-assignments'),
        api.get('/api/users/students'),
        api.get('/api/users/tutors'),
        api.get('/api/packages')
      ])

      // Transform package assignments to our Assignment interface
      const transformedAssignments: Assignment[] = assignmentsRes.data.map((assignment: any) => ({
        id: assignment.id,
        student: {
          id: assignment.student_id,
          firstName: assignment.student?.first_name || 'N/A',
          lastName: assignment.student?.last_name || 'N/A',
          email: assignment.student?.user?.email || assignment.student?.email || 'N/A',
          institute: assignment.student?.institute,
          classLevel: assignment.student?.class_level
        },
        tutor: {
          id: assignment.tutor_id,
          firstName: assignment.tutor?.first_name || 'N/A',
          lastName: assignment.tutor?.last_name || 'N/A',
          email: assignment.tutor?.user?.email || assignment.tutor?.email || 'N/A',
          subjects: assignment.tutor?.subjects
        },
        package: {
          id: assignment.package_id,
          name: assignment.package?.name || 'Pacchetto Standard',
          totalHours: assignment.package?.total_hours ?? null,
          usedHours: assignment.used_hours ?? null,
          remainingHours: assignment.package?.total_hours && assignment.used_hours !== null 
            ? assignment.package.total_hours - assignment.used_hours 
            : null
        },
        status: assignment.status || 'active',
        createdAt: assignment.created_at,
        // optional timestamps
        activatedAt: assignment.activated_at || null,
        completedAt: assignment.completed_at || null,
        assignedBy: assignment.assigned_by_admin?.email || 'Sistema',
        notes: assignment.notes
      }))

      setAssignments(transformedAssignments)
      setStudents(studentsRes.data)
      setTutors(tutorsRes.data)
      setPackages(packagesRes.data)

    } catch (err) {
      console.error('Error fetching assignments:', err)
      setError('Impossibile caricare le assegnazioni')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAssignment = async (data: CreateAssignmentData) => {
    try {
      await api.post('/api/admin/package-assignments', {
        student_id: data.studentId,
        tutor_id: data.tutorId,
        package_id: data.packageId,
        notes: data.notes
      })

      // Refresh assignments
      await fetchData()
      setShowCreateForm(false)
    } catch (err) {
      console.error('Error creating assignment:', err)
      setError('Errore durante la creazione dell\'assegnazione')
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = 
      assignment.student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.tutor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.tutor.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.package.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || assignment.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'suspended':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Assegnazioni</h1>
          <p className="text-foreground-muted">Gestisci le assegnazioni pacchetti-studenti-tutor</p>
        </div>
        
        <div className="grid gap-4">
          {['loading-1', 'loading-2', 'loading-3'].map((key) => (
            <Card key={key} className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-background-secondary rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-background-secondary rounded w-1/2 mb-4"></div>
                <div className="h-3 bg-background-secondary rounded w-2/3"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Assegnazioni</h1>
            <p className="text-foreground-muted">
              Gestisci le assegnazioni pacchetti-studenti-tutor ({assignments.length} totali)
            </p>
          </div>
          
          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-primary hover:bg-primary/80"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Nuova Assegnazione
          </Button>
        </div>

        {/* Filters */}
        <div className="flex space-x-4 mb-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-muted" />
            <input
              type="text"
              placeholder="Cerca per studente, tutor o pacchetto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">Tutti gli stati</option>
            <option value="active">Attive</option>
            <option value="completed">Completate</option>
            <option value="suspended">Sospese</option>
            <option value="pending">In attesa</option>
          </select>
        </div>
      </div>

      {error && (
        <Card className="p-4 mb-6 border-red-200 bg-red-50">
          <p className="text-red-800">{error}</p>
        </Card>
      )}

      {filteredAssignments.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpenIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Nessuna assegnazione trovata
          </h3>
          <p className="text-foreground-muted">
            {searchTerm || statusFilter !== 'all' 
              ? 'Prova a modificare i filtri di ricerca.'
              : 'Inizia creando la prima assegnazione.'}
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredAssignments.map((assignment) => (
            <Card key={assignment.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-3">
                    <h3 className="text-lg font-medium text-foreground">
                      {assignment.package.name}
                    </h3>
                    <Badge className={getStatusColor(assignment.status)}>
                      {assignment.status}
                    </Badge>
                    {assignment.activatedAt && (
                      <div className="text-xs text-foreground-muted ml-2">
                        Attivata il {new Date(assignment.activatedAt).toLocaleDateString('it-IT')}
                      </div>
                    )}
                    {assignment.completedAt && (
                      <div className="text-xs text-foreground-muted ml-2">
                        Completata il {new Date(assignment.completedAt).toLocaleDateString('it-IT')}
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <UserIcon className="w-4 h-4 text-foreground-muted" />
                      <div>
                        <p className="font-medium text-foreground">Studente</p>
                        <p className="text-foreground-muted">
                          {assignment.student.firstName} {assignment.student.lastName}
                        </p>
                        <p className="text-xs text-foreground-muted">{assignment.student.email}</p>
                        {assignment.student.institute && (
                          <p className="text-xs text-foreground-muted">{assignment.student.institute}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <AcademicCapIcon className="w-4 h-4 text-foreground-muted" />
                      <div>
                        <p className="font-medium text-foreground">Tutor</p>
                        <p className="text-foreground-muted">
                          {assignment.tutor.firstName} {assignment.tutor.lastName}
                        </p>
                        <p className="text-xs text-foreground-muted">{assignment.tutor.email}</p>
                        {assignment.tutor.subjects && (
                          <p className="text-xs text-foreground-muted">{assignment.tutor.subjects}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <ClockIcon className="w-4 h-4 text-foreground-muted" />
                      <div>
                        <p className="font-medium text-foreground">Ore Pacchetto</p>
                        <p className="text-foreground-muted">
                          {assignment.package.usedHours}/{assignment.package.totalHours} utilizzate
                        </p>
                        <p className="text-xs text-foreground-muted">
                          {assignment.package.remainingHours} ore rimanenti
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex items-center space-x-4 text-xs text-foreground-muted">
                      <div className="flex items-center space-x-1">
                        <CalendarIcon className="w-4 h-4" />
                        <span>Creata il {new Date(assignment.createdAt).toLocaleDateString('it-IT')}</span>
                      </div>
                      <span>•</span>
                      <span>Assegnata da {assignment.assignedBy}</span>
                    </div>
                    
                    {assignment.notes && (
                      <p className="mt-2 text-sm text-foreground-muted">
                        <strong>Note:</strong> {assignment.notes}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="ml-4">
                  <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BookOpenIcon className="w-8 h-8 text-primary" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Assignment Modal */}
      {showCreateForm && (
        <CreateAssignmentModal
          students={students}
          tutors={tutors}
          packages={packages}
          onSubmit={handleCreateAssignment}
          onClose={() => setShowCreateForm(false)}
        />
      )}
    </div>
  )
}

function CreateAssignmentModal({ 
  students, 
  tutors, 
  packages, 
  onSubmit, 
  onClose 
}: {
  readonly students: any[]
  readonly tutors: any[]
  readonly packages: any[]
  readonly onSubmit: (data: CreateAssignmentData) => void
  readonly onClose: () => void
}) {
  const [formData, setFormData] = useState<CreateAssignmentData>({
    studentId: 0,
    tutorId: 0,
    packageId: 0,
    notes: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.studentId && formData.tutorId && formData.packageId) {
      onSubmit(formData)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4 p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">Nuova Assegnazione</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="student-select" className="block text-sm font-medium text-foreground mb-1">
              Studente
            </label>
            <select
              id="student-select"
              value={formData.studentId}
              onChange={(e) => setFormData(prev => ({ ...prev, studentId: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            >
              <option value="">Seleziona studente</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.first_name} {student.last_name} ({student.user?.email || student.email})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="tutor-select" className="block text-sm font-medium text-foreground mb-1">
              Tutor
            </label>
            <select
              id="tutor-select"
              value={formData.tutorId}
              onChange={(e) => setFormData(prev => ({ ...prev, tutorId: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            >
              <option value="">Seleziona tutor</option>
              {tutors.map((tutor) => (
                <option key={tutor.id} value={tutor.id}>
                  {tutor.first_name} {tutor.last_name} ({tutor.user?.email || tutor.email})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="package-select" className="block text-sm font-medium text-foreground mb-1">
              Pacchetto
            </label>
            <select
              id="package-select"
              value={formData.packageId}
              onChange={(e) => setFormData(prev => ({ ...prev, packageId: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            >
              <option value="">Seleziona pacchetto</option>
              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.name} ({pkg.total_hours} ore - €{pkg.price_cents / 100})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="notes-textarea" className="block text-sm font-medium text-foreground mb-1">
              Note (opzionale)
            </label>
            <textarea
              id="notes-textarea"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={3}
              placeholder="Note aggiuntive sull'assegnazione..."
            />
          </div>
          
          <div className="flex space-x-2 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Annulla
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/80"
              disabled={!formData.studentId || !formData.tutorId || !formData.packageId}
            >
              Crea Assegnazione
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
