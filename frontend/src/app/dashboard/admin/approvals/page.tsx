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
  AcademicCapIcon
} from '@heroicons/react/24/outline'
import { api, cacheUtils } from '@/lib/api'

interface PendingApproval {
  id: number
  type: string
  title: string
  description: string
  user: {
    id: number
    email: string
    firstName?: string
    lastName?: string
    role: string
  }
  createdAt: string
  priority: string
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

      const response = await api.getCached('/api/admin/pending-approvals', {
        useCache: true,
        cacheKey: 'admin-pending-approvals'
      })

      const pendingUsers = response.data
      const pendingApprovals: PendingApproval[] = pendingUsers.map((user: any) => ({
        id: user.id,
        type: user.role === 'TUTOR' ? 'tutor_verification' : 'student_verification',
        title: `Verifica ${user.role === 'TUTOR' ? 'Tutor' : 'Studente'}`,
        description: `Richiesta di verifica per ${user.email}`,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role
        },
        createdAt: user.created_at,
        priority: user.role === 'TUTOR' ? 'high' : 'medium'
      }))

      setApprovals(pendingApprovals)
    } catch (err) {
      console.error('Error fetching approvals:', err)
      setError('Impossibile caricare le approvazioni')
    } finally {
      setLoading(false)
    }
  }

  const handleApproval = async (approvalId: number, approved: boolean) => {
    const approval = approvals.find(a => a.id === approvalId)
    if (!approval) return

    try {
      setProcessingId(approvalId)

      if (approved) {
        await api.post(`/api/admin/users/${approval.user.id}/approve`)
      } else {
        await api.post(`/api/admin/users/${approval.user.id}/reject`)
      }

      cacheUtils.invalidateOnApproval()
      setApprovals(prev => prev.filter(a => a.id !== approvalId))
      
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

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Approvazioni</h1>
          <p className="text-gray-600">Gestisci le richieste di verifica e approvazione</p>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="flex space-x-2">
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
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
        <h1 className="text-2xl font-bold">Approvazioni</h1>
        <p className="text-gray-600">
          Gestisci le richieste di verifica e approvazione ({approvals.length} in attesa)
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
          <Button 
            onClick={fetchApprovals}
            className="mt-2"
            variant="outline"
            size="sm"
          >
            Riprova
          </Button>
        </div>
      )}

      {approvals.length === 0 ? (
        <Card className="p-8 text-center">
          <ClockIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">
            Nessuna approvazione in attesa
          </h3>
          <p className="text-gray-600">
            Tutte le richieste sono state elaborate.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {approvals.map((approval) => {
            const isProcessing = processingId === approval.id
            const IconComponent = approval.type === 'tutor_verification' ? AcademicCapIcon : UserIcon

            return (
              <Card key={approval.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex-shrink-0">
                      <IconComponent className="w-8 h-8 text-blue-600" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold">
                          {approval.title}
                        </h3>
                        <Badge variant="default">{approval.priority}</Badge>
                      </div>
                      
                      <p className="text-gray-600 mb-3">
                        {approval.description}
                      </p>
                      
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Email:</span>{' '}
                          {approval.user.email}
                        </div>
                        {approval.user.firstName && (
                          <div>
                            <span className="font-medium">Nome:</span>{' '}
                            {approval.user.firstName} {approval.user.lastName}
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Ruolo:</span>{' '}
                          <Badge variant="default">{approval.user.role}</Badge>
                        </div>
                        <div>
                          <span className="font-medium">Data richiesta:</span>{' '}
                          {new Date(approval.createdAt).toLocaleDateString('it-IT')}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <Button
                      onClick={() => handleApproval(approval.id, true)}
                      disabled={isProcessing}
                      className="bg-green-600 hover:bg-green-700"
                      size="sm"
                    >
                      <CheckCircleIcon className="w-4 h-4 mr-1" />
                      Approva
                    </Button>
                    <Button
                      onClick={() => handleApproval(approval.id, false)}
                      disabled={isProcessing}
                      variant="danger"
                      size="sm"
                    >
                      <XCircleIcon className="w-4 h-4 mr-1" />
                      Rifiuta
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
