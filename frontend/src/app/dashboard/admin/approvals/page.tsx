'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  UserIcon,
  AcademicCapIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import { api } from '@/lib/api'

interface PendingApproval {
  id: number
  type: 'tutor_verification' | 'student_verification' | 'package_assignment'
  title: string
  description: string
  user: {
    id: number
    email: string
    firstName?: string
    lastName?: string
    role: string
  }
  details: any
  createdAt: string
  priority: 'high' | 'medium' | 'low'
}

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<PendingApproval[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<number | null>(null)

  const fetchApprovals = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch pending tutors and students that need verification
      const [tutorsRes, studentsRes] = await Promise.all([
        api.get('/api/users/tutors'),
        api.get('/api/users/students'),
      ])

      const pendingApprovals: PendingApproval[] = []

      // Add unverified tutors
      tutorsRes.data.forEach((tutor: any) => {
        if (!tutor.user?.is_verified) {
          pendingApprovals.push({
            id: tutor.user?.id || tutor.id,
            type: 'tutor_verification',
            title: 'Verifica Tutor',
            description: `${tutor.first_name} ${tutor.last_name} richiede la verifica come tutor`,
            user: {
              id: tutor.user?.id || tutor.id,
              email: tutor.user?.email || tutor.email,
              firstName: tutor.first_name,
              lastName: tutor.last_name,
              role: 'tutor'
            },
            details: {
              subjects: tutor.subjects,
              bio: tutor.bio,
              experience: tutor.experience
            },
            createdAt: tutor.created_at || new Date().toISOString(),
            priority: 'high'
          })
        }
      })

      // Add unverified students
      studentsRes.data.forEach((student: any) => {
        if (!student.user?.is_verified) {
          pendingApprovals.push({
            id: (student.user?.id || student.id) + 1000, // Offset to avoid conflicts
            type: 'student_verification',
            title: 'Verifica Studente',
            description: `${student.first_name} ${student.last_name} richiede la verifica`,
            user: {
              id: student.user?.id || student.id,
              email: student.user?.email || student.email,
              firstName: student.first_name,
              lastName: student.last_name,
              role: 'student'
            },
            details: {
              institute: student.institute,
              classLevel: student.class_level,
              dateOfBirth: student.date_of_birth
            },
            createdAt: student.created_at || new Date().toISOString(),
            priority: 'medium'
          })
        }
      })

      // Sort by priority and date
      pendingApprovals.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })

      setApprovals(pendingApprovals)
    } catch (err) {
      console.error('Error fetching approvals:', err)
      setError('Impossibile caricare le approvazioni')
    } finally {
      setLoading(false)
    }
  }

  const handleApproval = async (approvalId: number, approved: boolean) => {
    try {
      setProcessingId(approvalId)
      
      const approval = approvals.find(a => a.id === approvalId)
      if (!approval) return

      // Update user verification status
      await api.put(`/api/users/${approval.user.id}`, {
        is_verified: approved
      })

      // Remove from approvals list
      setApprovals(prev => prev.filter(a => a.id !== approvalId))
      
      console.log(`${approved ? 'Approved' : 'Rejected'} ${approval.type} for user ${approval.user.email}`)
    } catch (err) {
      console.error('Error processing approval:', err)
      setError('Errore durante l\'elaborazione dell\'approvazione')
    } finally {
      setProcessingId(null)
    }
  }

  useEffect(() => {
    fetchApprovals()
  }, [])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'tutor_verification':
        return AcademicCapIcon
      case 'student_verification':
        return UserIcon
      case 'package_assignment':
        return DocumentTextIcon
      default:
        return ClockIcon
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'tutor_verification':
        return 'bg-purple-100 text-purple-800'
      case 'student_verification':
        return 'bg-blue-100 text-blue-800'
      case 'package_assignment':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Approvazioni</h1>
          <p className="text-foreground-muted">Gestisci le richieste di verifica e approvazione</p>
        </div>
        
        <div className="grid gap-4">
          {['loading-card-1', 'loading-card-2', 'loading-card-3'].map((key) => (
            <Card key={key} className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-background-secondary rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-background-secondary rounded w-1/2 mb-4"></div>
                <div className="flex space-x-2">
                  <div className="h-8 bg-background-secondary rounded w-20"></div>
                  <div className="h-8 bg-background-secondary rounded w-20"></div>
                </div>
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
        <h1 className="text-2xl font-bold text-foreground">Approvazioni</h1>
        <p className="text-foreground-muted">
          Gestisci le richieste di verifica e approvazione ({approvals.length} in attesa)
        </p>
      </div>

      {error && (
        <Card className="p-4 mb-6 border-red-200 bg-red-50">
          <div className="flex items-center">
            <XCircleIcon className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-red-800">{error}</p>
            <Button 
              onClick={fetchApprovals}
              variant="outline"
              size="sm"
              className="ml-auto"
            >
              Riprova
            </Button>
          </div>
        </Card>
      )}

      {approvals.length === 0 ? (
        <Card className="p-12 text-center">
          <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Tutte le approvazioni sono state elaborate
          </h3>
          <p className="text-foreground-muted">
            Non ci sono richieste di verifica in attesa di approvazione.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {approvals.map((approval) => {
            const IconComponent = getTypeIcon(approval.type)
            
            return (
              <Card key={approval.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <IconComponent className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-medium text-foreground">
                          {approval.title}
                        </h3>
                        <Badge className={getTypeColor(approval.type)}>
                          {approval.type.replace('_', ' ')}
                        </Badge>
                        <Badge className={getPriorityColor(approval.priority)}>
                          {approval.priority}
                        </Badge>
                      </div>
                      
                      <p className="text-foreground-muted mb-3">
                        {approval.description}
                      </p>
                      
                      <div className="text-sm text-foreground-muted">
                        <p><strong>Email:</strong> {approval.user.email}</p>
                        <p><strong>Data richiesta:</strong> {new Date(approval.createdAt).toLocaleDateString('it-IT')}</p>
                        
                        {approval.details && (
                          <div className="mt-2">
                            {approval.type === 'tutor_verification' && (
                              <>
                                {approval.details.subjects && (
                                  <p><strong>Materie:</strong> {approval.details.subjects}</p>
                                )}
                                {approval.details.bio && (
                                  <p><strong>Bio:</strong> {approval.details.bio.substring(0, 100)}...</p>
                                )}
                              </>
                            )}
                            
                            {approval.type === 'student_verification' && (
                              <>
                                {approval.details.institute && (
                                  <p><strong>Istituto:</strong> {approval.details.institute}</p>
                                )}
                                {approval.details.classLevel && (
                                  <p><strong>Livello:</strong> {approval.details.classLevel}</p>
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <Button
                      onClick={() => handleApproval(approval.id, false)}
                      variant="outline"
                      size="sm"
                      disabled={processingId === approval.id}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <XCircleIcon className="w-4 h-4 mr-1" />
                      Rifiuta
                    </Button>
                    
                    <Button
                      onClick={() => handleApproval(approval.id, true)}
                      size="sm"
                      disabled={processingId === approval.id}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircleIcon className="w-4 h-4 mr-1" />
                      Approva
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
