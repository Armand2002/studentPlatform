"use client"
import { useState, useEffect } from 'react'
import { 
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarDaysIcon,
  AcademicCapIcon,
  BookOpenIcon,
  CreditCardIcon,
  ArrowRightIcon,
  BellIcon
} from '@heroicons/react/24/outline'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

interface Deadline {
  id: string
  title: string
  type: 'package_expiry' | 'assignment_due' | 'exam_date' | 'payment_due' | 'subscription_end'
  dueDate: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  subject?: string
  description: string
  status: 'pending' | 'completed' | 'overdue'
  actionRequired: boolean
  actionText?: string
  actionUrl?: string
  hoursRemaining?: number
  daysRemaining?: number
}

interface DeadlinesPageProps {
  className?: string
}

const priorityConfig = {
  critical: {
    color: 'text-red-500 bg-red-500/10 border-red-500/20',
    icon: ExclamationTriangleIcon,
    label: 'Critica',
    bgColor: 'bg-red-500/5',
    borderColor: 'border-red-500/30'
  },
  high: {
    color: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
    icon: ExclamationTriangleIcon,
    label: 'Alta',
    bgColor: 'bg-orange-500/5',
    borderColor: 'border-orange-500/30'
  },
  medium: {
    color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
    icon: ClockIcon,
    label: 'Media',
    bgColor: 'bg-yellow-500/5',
    borderColor: 'border-yellow-500/30'
  },
  low: {
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    icon: ClockIcon,
    label: 'Bassa',
    bgColor: 'bg-blue-500/5',
    borderColor: 'border-blue-500/30'
  }
}

const typeConfig = {
  package_expiry: {
    icon: BookOpenIcon,
    label: 'Scadenza Pacchetto',
    color: 'text-purple-500'
  },
  assignment_due: {
    icon: AcademicCapIcon,
    label: 'Compito in Scadenza',
    color: 'text-blue-500'
  },
  exam_date: {
    icon: AcademicCapIcon,
    label: 'Data Esame',
    color: 'text-red-500'
  },
  payment_due: {
    icon: CreditCardIcon,
    label: 'Pagamento Dovuto',
    color: 'text-green-500'
  },
  subscription_end: {
    icon: CalendarDaysIcon,
    label: 'Fine Abbonamento',
    color: 'text-orange-500'
  }
}

export default function DeadlinesPage({ className }: DeadlinesPageProps) {
  const [deadlines, setDeadlines] = useState<Deadline[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPriority, setSelectedPriority] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [showCompleted, setShowCompleted] = useState(false)

  // Mock data per sviluppo - sarà sostituito con API call
  useEffect(() => {
    const mockDeadlines: Deadline[] = [
      {
        id: '1',
        title: 'Pacchetto Matematica Base',
        type: 'package_expiry',
        dueDate: '2025-09-15T23:59:59',
        priority: 'critical',
        subject: 'Matematica',
        description: 'Pacchetto ore in scadenza - 12 ore rimanenti. Prenota le tue lezioni prima della scadenza.',
        status: 'pending',
        actionRequired: true,
        actionText: 'Prenota Lezione',
        actionUrl: '/dashboard/student/book-lesson',
        hoursRemaining: 48,
        daysRemaining: 2
      },
      {
        id: '2',
        title: 'Compito Calcolo Differenziale',
        type: 'assignment_due',
        dueDate: '2025-09-10T23:59:59',
        priority: 'high',
        subject: 'Matematica',
        description: 'Consegnare esercizi su calcolo differenziale e integrali. Peso: 30% voto finale.',
        status: 'pending',
        actionRequired: true,
        actionText: 'Carica Compito',
        actionUrl: '/dashboard/student/assignments',
        hoursRemaining: 120,
        daysRemaining: 5
      },
      {
        id: '3',
        title: 'Esame Chimica Organica',
        type: 'exam_date',
        dueDate: '2025-09-20T09:00:00',
        priority: 'high',
        subject: 'Chimica',
        description: 'Esame finale chimica organica. Portare calcolatrice e tavola periodica.',
        status: 'pending',
        actionRequired: true,
        actionText: 'Vedi Dettagli',
        actionUrl: '/dashboard/student/exams',
        hoursRemaining: 240,
        daysRemaining: 10
      },
      {
        id: '4',
        title: 'Pagamento Pacchetto Fisica',
        type: 'payment_due',
        dueDate: '2025-09-05T23:59:59',
        priority: 'medium',
        subject: 'Fisica',
        description: 'Pagamento scaduto per pacchetto fisica avanzato. Completa il pagamento per evitare sospensioni.',
        status: 'overdue',
        actionRequired: true,
        actionText: 'Completa Pagamento',
        actionUrl: '/dashboard/student/payments',
        hoursRemaining: -24,
        daysRemaining: -1
      },
      {
        id: '5',
        title: 'Compito Meccanica Classica',
        type: 'assignment_due',
        dueDate: '2025-09-08T23:59:59',
        priority: 'medium',
        subject: 'Fisica',
        description: 'Esercizi su meccanica classica e dinamica. Consegna online tramite piattaforma.',
        status: 'completed',
        actionRequired: false,
        actionText: 'Vedi Consegnato',
        actionUrl: '/dashboard/student/assignments',
        hoursRemaining: 0,
        daysRemaining: 0
      },
      {
        id: '6',
        title: 'Fine Abbonamento Mensile',
        type: 'subscription_end',
        dueDate: '2025-09-30T23:59:59',
        priority: 'low',
        subject: 'Generale',
        description: 'Il tuo abbonamento mensile scade. Rinnova per continuare ad accedere ai servizi premium.',
        status: 'pending',
        actionRequired: true,
        actionText: 'Rinnova Abbonamento',
        actionUrl: '/dashboard/student/subscription',
        hoursRemaining: 480,
        daysRemaining: 20
      }
    ]

    // Simula API call
    setTimeout(() => {
      setDeadlines(mockDeadlines)
      setLoading(false)
    }, 1000)
  }, [])

  const priorities = Array.from(new Set(deadlines.map(d => d.priority)))
  const types = Array.from(new Set(deadlines.map(d => d.type)))

  const filteredDeadlines = deadlines.filter(deadline => {
    const priorityMatch = selectedPriority === 'all' || deadline.priority === selectedPriority
    const typeMatch = selectedType === 'all' || deadline.type === selectedType
    const statusMatch = showCompleted || deadline.status !== 'completed'
    
    return priorityMatch && typeMatch && statusMatch
  })

  const criticalDeadlines = deadlines.filter(d => d.priority === 'critical' && d.status === 'pending')
  const overdueDeadlines = deadlines.filter(d => d.status === 'overdue')
  const upcomingDeadlines = deadlines.filter(d => d.status === 'pending' && d.daysRemaining && d.daysRemaining <= 7)

  const getPriorityConfig = (priority: string) => {
    return priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium
  }

  const getTypeConfig = (type: string) => {
    return typeConfig[type as keyof typeof typeConfig] || typeConfig.assignment_due
  }

  const formatTimeRemaining = (hoursRemaining: number) => {
    if (hoursRemaining < 0) {
      return `Scaduto da ${Math.abs(hoursRemaining)} ore`
    }
    
    if (hoursRemaining < 24) {
      return `${hoursRemaining} ore rimanenti`
    }
    
    const days = Math.floor(hoursRemaining / 24)
    const hours = hoursRemaining % 24
    
    if (days === 1) {
      return `1 giorno e ${hours} ore`
    }
    
    return `${days} giorni e ${hours} ore`
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return CheckCircleIcon
      case 'overdue':
        return XCircleIcon
      default:
        return ClockIcon
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-500 bg-green-500/10 border-green-500/20'
      case 'overdue':
        return 'text-red-500 bg-red-500/10 border-red-500/20'
      default:
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
    }
  }

  if (loading) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="animate-pulse">
          <div className="h-4 bg-background-secondary rounded w-3/4 mb-4"></div>
          <div className="h-8 bg-background-secondary rounded w-1/2 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-background-secondary rounded"></div>
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
          <h1 className="text-2xl font-bold text-foreground">Scadenze e Promemoria</h1>
          <p className="text-foreground-muted">
            Gestisci le tue scadenze, compiti e promemoria importanti
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="p-2 text-foreground-muted hover:text-primary transition-colors">
            <BellIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Alert Banner per Scadenze Critiche */}
      {criticalDeadlines.length > 0 && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-center gap-3">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
            <div>
              <h3 className="font-medium text-red-500">
                {criticalDeadlines.length} scadenza{criticalDeadlines.length !== 1 ? 'e' : ''} critica{criticalDeadlines.length !== 1 ? 'e' : ''}!
              </h3>
              <p className="text-sm text-red-600">
                Hai scadenze urgenti che richiedono attenzione immediata
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
          <div className="text-2xl font-bold text-red-500">{criticalDeadlines.length}</div>
          <div className="text-xs text-foreground-muted">Critiche</div>
        </div>
        <div className="text-center p-4 bg-orange-500/5 border border-orange-500/20 rounded-lg">
          <div className="text-2xl font-bold text-orange-500">{upcomingDeadlines.length}</div>
          <div className="text-xs text-foreground-muted">Prossime (≤7 giorni)</div>
        </div>
        <div className="text-center p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
          <div className="text-2xl font-bold text-yellow-500">{overdueDeadlines.length}</div>
          <div className="text-xs text-foreground-muted">Scadute</div>
        </div>
        <div className="text-center p-4 bg-green-500/5 border border-green-500/20 rounded-lg">
          <div className="text-2xl font-bold text-green-500">
            {deadlines.filter(d => d.status === 'completed').length}
          </div>
          <div className="text-xs text-foreground-muted">Completate</div>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">Priorità:</span>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-3 py-1.5 text-sm bg-background-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">Tutte</option>
              {priorities.map(priority => (
                <option key={priority} value={priority}>
                  {getPriorityConfig(priority).label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">Tipo:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-1.5 text-sm bg-background-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">Tutti</option>
              {types.map(type => (
                <option key={type} value={type}>
                  {getTypeConfig(type).label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={showCompleted}
                onChange={(e) => setShowCompleted(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary/20"
              />
              Mostra completate
            </label>
          </div>
        </div>
      </Card>

      {/* Deadlines List */}
      <div className="space-y-4">
        {filteredDeadlines.length === 0 ? (
          <Card className="p-8 text-center">
            <CalendarDaysIcon className="h-12 w-12 text-foreground-muted mx-auto mb-3" />
            <h3 className="text-lg font-medium text-foreground mb-2">Nessuna scadenza trovata</h3>
            <p className="text-foreground-muted">
              {selectedPriority === 'all' && selectedType === 'all' 
                ? 'Non hai scadenze attive al momento' 
                : 'Prova a modificare i filtri per vedere più risultati'
              }
            </p>
          </Card>
        ) : (
          filteredDeadlines.map((deadline) => {
            const priorityConfig = getPriorityConfig(deadline.priority)
            const typeConfig = getTypeConfig(deadline.type)
            const StatusIcon = getStatusIcon(deadline.status)
            const statusColor = getStatusColor(deadline.status)

            return (
              <Card 
                key={deadline.id} 
                className={cn(
                  "p-6 transition-all duration-200 hover:shadow-lg",
                  deadline.priority === 'critical' && "border-l-4 border-l-red-500",
                  deadline.status === 'overdue' && "border-l-4 border-l-red-500"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        deadline.priority === 'critical' ? 'bg-red-500/10' : priorityConfig.bgColor
                      )}>
                        <priorityConfig.icon className={cn("h-5 w-5", priorityConfig.color)} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-foreground">{deadline.title}</h3>
                          <span className={cn(
                            "px-2 py-1 text-xs font-medium rounded-full border",
                            priorityConfig.color
                          )}>
                            {priorityConfig.label}
                          </span>
                          <span className={cn(
                            "px-2 py-1 text-xs font-medium rounded-full border",
                            statusColor
                          )}>
                            <StatusIcon className="h-3 w-3 inline mr-1" />
                            {deadline.status === 'completed' ? 'Completata' : 
                             deadline.status === 'overdue' ? 'Scaduta' : 'In attesa'}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-foreground-muted mb-2">
                          <span className="flex items-center gap-1">
                            <typeConfig.icon className="h-4 w-4" />
                            {typeConfig.label}
                          </span>
                          {deadline.subject && (
                            <span className="flex items-center gap-1">
                              <AcademicCapIcon className="h-4 w-4" />
                              {deadline.subject}
                            </span>
                          )}
                        </div>
                        
                        <p className="text-sm text-foreground-secondary mb-3">
                          {deadline.description}
                        </p>
                      </div>
                    </div>

                    {/* Time Remaining */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm">
                        <span className={cn(
                          "flex items-center gap-1 font-medium",
                          deadline.status === 'overdue' ? "text-red-500" : "text-foreground-muted"
                        )}>
                          <ClockIcon className="h-4 w-4" />
                          {formatTimeRemaining(deadline.hoursRemaining || 0)}
                        </span>
                        
                        <span className="text-foreground-muted">
                          Scadenza: {new Date(deadline.dueDate).toLocaleDateString('it-IT', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>

                      {/* Action Button */}
                      {deadline.actionRequired && deadline.actionUrl && (
                        <a
                          href={deadline.actionUrl}
                          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary border border-primary/20 rounded-md hover:bg-primary/10 transition-colors"
                        >
                          {deadline.actionText}
                          <ArrowRightIcon className="h-4 w-4" />
                        </a>
                      )}
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
