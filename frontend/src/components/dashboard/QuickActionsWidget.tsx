"use client"
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { isAxiosError } from 'axios'
import { 
  PlusIcon,
  CalendarDaysIcon,
  BookOpenIcon,
  UserGroupIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

interface QuickAction {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  href: string
  color: string
  bgColor: string
  borderColor: string
  isPrimary?: boolean
}

interface QuickActionsWidgetProps {
  className?: string
}

const quickActions: QuickAction[] = [
  {
    id: 'book-lesson',
    title: 'Prenota Lezione',
    description: 'Prenota una nuova lezione con i tuoi tutor',
    icon: PlusIcon,
    href: '/dashboard/student/booking',
    color: 'text-green-600',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
    isPrimary: true
  },
  {
    id: 'view-calendar',
    title: 'Vedi Calendario',
    description: 'Visualizza il tuo calendario lezioni',
    icon: CalendarDaysIcon,
    href: '/dashboard/student/calendar',
    color: 'text-blue-600',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20'
  },
  {
    id: 'buy-package',
    title: 'Acquista Pacchetto',
    description: 'Compra nuove ore di lezione',
    icon: BookOpenIcon,
    href: '/dashboard/student/packages',
    color: 'text-purple-600',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20'
  },
  {
    id: 'find-tutor',
    title: 'Trova Tutor',
    description: 'Scopri nuovi tutor disponibili',
    icon: UserGroupIcon,
    href: '/dashboard/student/tutors',
    color: 'text-orange-600',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20'
  },
  {
    id: 'request-material',
    title: 'Richiedi Materiale',
    description: 'Chiedi materiali di studio specifici',
    icon: DocumentTextIcon,
    href: '/dashboard/student/materials/request',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/20'
  },
  {
    id: 'support',
    title: 'Supporto',
    description: 'Contatta il supporto tecnico',
    icon: QuestionMarkCircleIcon,
    href: '/dashboard/student/support',
    color: 'text-red-600',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20'
  }
]

// Interfacce per i dati dinamici
interface RecentActivity {
  id: string
  action: string
  subject: string
  time: string
  icon: any
}

interface QuickStats {
  weeklyHours: number
  completedLessons: number
  progressPercentage: number
}

export default function QuickActionsWidget({ className }: QuickActionsWidgetProps) {
  const [hoveredAction, setHoveredAction] = useState<string | null>(null)
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [quickStats, setQuickStats] = useState<QuickStats>({
    weeklyHours: 0,
    completedLessons: 0,
    progressPercentage: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // API call per ottenere attività recenti e statistiche
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('🔍 Fetching recent activities and stats from backend...')
        
        // Chiama l'endpoint per ottenere le attività recenti
        const token = localStorage.getItem('token')
        if (!token) {
          console.warn('⚠️ No token found, user not authenticated')
          setRecentActivities([])
          setQuickStats({ weeklyHours: 0, completedLessons: 0, progressPercentage: 0 })
          return
        }

        // Per ora non ci sono endpoint dedicati, impostiamo valori di default
        setRecentActivities([])
        setQuickStats({
          weeklyHours: 0,
          completedLessons: 0,
          progressPercentage: 0
        })
        
      } catch (err) {
        console.error('❌ Error fetching activities and stats:', err)
        setError('Errore nel caricamento delle attività')
        setRecentActivities([])
        setQuickStats({
          weeklyHours: 0,
          completedLessons: 0,
          progressPercentage: 0
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleActionClick = (action: QuickAction) => {
    // In futuro: navigazione reale
    console.log(`Navigating to: ${action.href}`)
    // router.push(action.href)
  }

  return (
    <Card className={cn("p-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <AcademicCapIcon className="h-5 w-5 text-primary" />
            Azioni Rapide
          </h3>
          <p className="text-sm text-foreground-muted">
            Accedi velocemente alle funzioni principali
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">
            {quickActions.length}
          </div>
          <div className="text-xs text-foreground-muted">Azioni</div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {quickActions.map((action) => (
          <button
            key={action.id}
            onClick={() => handleActionClick(action)}
            onMouseEnter={() => setHoveredAction(action.id)}
            onMouseLeave={() => setHoveredAction(null)}
            className={cn(
              "p-4 rounded-lg border transition-all duration-200 text-left group",
              action.bgColor,
              action.borderColor,
              hoveredAction === action.id && "scale-105 shadow-lg",
              action.isPrimary && "ring-2 ring-primary/20"
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                "p-2 rounded-lg transition-colors",
                action.bgColor,
                hoveredAction === action.id && "bg-white/20"
              )}>
                <action.icon className={cn("h-5 w-5", action.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={cn(
                  "font-medium text-sm mb-1 transition-colors",
                  action.color,
                  hoveredAction === action.id && "text-foreground"
                )}>
                  {action.title}
                </h4>
                <p className="text-xs text-foreground-muted line-clamp-2">
                  {action.description}
                </p>
              </div>
            </div>
            {action.isPrimary && (
              <div className="mt-2 flex items-center gap-1 text-xs text-primary">
                <PlusIcon className="h-3 w-3" />
                <span>Azione principale</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Recent Activities */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <ClockIcon className="h-4 w-4 text-primary" />
          Attività Recenti
        </h4>
        <div className="space-y-2">
          {loading && (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg">
                  <div className="w-6 h-6 bg-background-secondary rounded animate-pulse"></div>
                  <div className="flex-1 space-y-1">
                    <div className="h-3 bg-background-secondary rounded animate-pulse"></div>
                    <div className="h-2 bg-background-secondary rounded animate-pulse w-2/3"></div>
                  </div>
                  <div className="h-2 bg-background-secondary rounded animate-pulse w-12"></div>
                </div>
              ))}
            </div>
          )}
          {!loading && error && (
            <div className="text-xs text-red-600 p-2">
              {error}
            </div>
          )}
          {!loading && !error && recentActivities.length === 0 && (
            <div className="text-xs text-foreground-muted p-2 text-center">
              Nessuna attività recente
            </div>
          )}
          {!loading && !error && recentActivities.length > 0 && recentActivities.map((activity) => (
            <div 
              key={activity.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-background-secondary transition-colors"
            >
              <div className="p-1.5 bg-background-secondary rounded">
                <activity.icon className="h-3 w-3 text-foreground-muted" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground font-medium">{activity.action}</p>
                <p className="text-xs text-foreground-muted">{activity.subject}</p>
              </div>
              <span className="text-xs text-foreground-muted">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="text-center p-3 bg-background-secondary/50 border border-border rounded-lg">
          <div className="text-lg font-bold text-primary">
            {loading ? (
              <div className="h-6 bg-background-secondary rounded animate-pulse"></div>
            ) : (
              quickStats.weeklyHours
            )}
          </div>
          <div className="text-xs text-foreground-muted">Ore questa settimana</div>
        </div>
        <div className="text-center p-3 bg-background-secondary/50 border border-border rounded-lg">
          <div className="text-lg font-bold text-green-500">
            {loading ? (
              <div className="h-6 bg-background-secondary rounded animate-pulse"></div>
            ) : (
              quickStats.completedLessons
            )}
          </div>
          <div className="text-xs text-foreground-muted">Lezioni completate</div>
        </div>
        <div className="text-center p-3 bg-background-secondary/50 border border-border rounded-lg">
          <div className="text-lg font-bold text-blue-500">
            {loading ? (
              <div className="h-6 bg-background-secondary rounded animate-pulse"></div>
            ) : (
              `${quickStats.progressPercentage}%`
            )}
          </div>
          <div className="text-xs text-foreground-muted">Progresso</div>
        </div>
      </div>

      {/* Additional Actions */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-foreground mb-3">Altre Azioni</h4>
        <div className="flex gap-2">
          <button className="flex-1 px-3 py-2 text-xs font-medium text-foreground-secondary border border-border rounded-md hover:bg-background-secondary transition-colors flex items-center justify-center gap-2">
            <ChatBubbleLeftRightIcon className="h-3 w-3" />
            Chat con Tutor
          </button>
          <button className="flex-1 px-3 py-2 text-xs font-medium text-foreground-secondary border border-border rounded-md hover:bg-background-secondary transition-colors flex items-center justify-center gap-2">
            <Cog6ToothIcon className="h-3 w-3" />
            Impostazioni
          </button>
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="text-center">
          <QuestionMarkCircleIcon className="h-8 w-8 text-foreground-muted mx-auto mb-2" />
          <p className="text-xs text-foreground-muted mb-2">
            Hai bisogno di aiuto?
          </p>
          <button className="text-xs text-primary hover:text-primary-600 transition-colors">
            Consulta la guida
          </button>
        </div>
      </div>
    </Card>
  )
}


