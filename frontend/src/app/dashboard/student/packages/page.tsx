"use client"
import { useState, useEffect } from 'react'
import { 
  BookOpenIcon,
  ClockIcon,
  CheckCircleIcon,
  PlayCircleIcon,
  CalendarDaysIcon,
  AcademicCapIcon,
  UserIcon,
  ChartBarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import RequireAuth from '@/components/auth/RequireAuth'

interface Package {
  id: string
  name: string
  subject: string
  tutorName: string
  tutorAvatar?: string
  totalLessons: number
  completedLessons: number
  remainingLessons: number
  status: 'active' | 'completed' | 'expired' | 'paused'
  startDate: string
  endDate: string
  price: number
  description: string
  progress: number
  nextLessonDate?: string
  lastLessonDate?: string
}

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'expired'>('all')

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true)
        
        console.log('🔍 Fetching user packages from backend...')
        
        // Implementazione API packages in attesa di backend endpoint
        // const packages = await packageService.getUserPackages()
        
        // Per ora impostiamo array vuoto finché non implementiamo il backend
        setPackages([])
        
      } catch (err) {
        console.error('❌ Error fetching packages:', err)
        setPackages([])
      } finally {
        setLoading(false)
      }
    }

    fetchPackages()
  }, [])

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return {
          color: 'text-green-500 bg-green-500/10 border-green-500/20',
          icon: PlayCircleIcon,
          label: 'Attivo'
        }
      case 'completed':
        return {
          color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
          icon: CheckCircleIcon,
          label: 'Completato'
        }
      case 'expired':
        return {
          color: 'text-red-500 bg-red-500/10 border-red-500/20',
          icon: ExclamationTriangleIcon,
          label: 'Scaduto'
        }
      case 'paused':
        return {
          color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
          icon: ClockIcon,
          label: 'In pausa'
        }
      default:
        return {
          color: 'text-gray-500 bg-gray-500/10 border-gray-500/20',
          icon: ClockIcon,
          label: 'Sconosciuto'
        }
    }
  }

  const filteredPackages = packages.filter(pkg => 
    filter === 'all' || pkg.status === filter
  )

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">I Miei Pacchetti</h1>
            <p className="text-foreground-muted">
              Visualizza e gestisci i tuoi pacchetti di lezioni
            </p>
          </div>
          <a
            href="/packages"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <BookOpenIcon className="h-4 w-4" />
            Acquista Pacchetti
          </a>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{packages.filter(p => p.status === 'active').length}</div>
            <div className="text-sm text-foreground-muted">Pacchetti attivi</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-500">{packages.reduce((sum, p) => sum + p.remainingLessons, 0)}</div>
            <div className="text-sm text-foreground-muted">Lezioni rimanenti</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-green-500">{packages.filter(p => p.status === 'completed').length}</div>
            <div className="text-sm text-foreground-muted">Completati</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-500">
              {packages.length > 0 ? Math.round(packages.reduce((sum, p) => sum + p.progress, 0) / packages.length) : 0}%
            </div>
            <div className="text-sm text-foreground-muted">Progresso medio</div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'Tutti i pacchetti' },
              { key: 'active', label: 'Attivi' },
              { key: 'completed', label: 'Completati' },
              { key: 'expired', label: 'Scaduti' }
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
        </Card>

        {/* Packages List */}
        <div className="space-y-4">
          {filteredPackages.length === 0 ? (
            <Card className="p-12 text-center">
              <BookOpenIcon className="h-16 w-16 text-foreground-muted mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Nessun pacchetto trovato
              </h3>
              <p className="text-foreground-muted mb-6">
                {filter === 'all' 
                  ? "Non hai ancora acquistato nessun pacchetto di lezioni."
                  : `Non hai pacchetti con stato "${filter}".`
                }
              </p>
              {filter === 'all' && (
                <a
                  href="/packages"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  <BookOpenIcon className="h-4 w-4" />
                  Esplora Pacchetti
                </a>
              )}
            </Card>
          ) : (
            filteredPackages.map((pkg) => {
              const statusConfig = getStatusConfig(pkg.status)
              const StatusIcon = statusConfig.icon
              const progressPercentage = Math.round(pkg.progress)

              return (
                <Card key={pkg.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-foreground">{pkg.name}</h3>
                        <span className={cn(
                          "px-2 py-1 text-xs font-medium rounded-full border",
                          statusConfig.color
                        )}>
                          <StatusIcon className="h-3 w-3 inline mr-1" />
                          {statusConfig.label}
                        </span>
                      </div>
                      <p className="text-foreground-muted text-sm mb-3">{pkg.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">€{pkg.price}</div>
                      <div className="text-sm text-foreground-muted">Pacchetto</div>
                    </div>
                  </div>

                  {/* Package Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-foreground-muted">
                      <AcademicCapIcon className="h-4 w-4" />
                      <span>{pkg.subject}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-foreground-muted">
                      <UserIcon className="h-4 w-4" />
                      <span>{pkg.tutorName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-foreground-muted">
                      <CalendarDaysIcon className="h-4 w-4" />
                      <span>
                        {new Date(pkg.startDate).toLocaleDateString('it-IT')} - {new Date(pkg.endDate).toLocaleDateString('it-IT')}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-foreground-secondary">Progresso lezioni</span>
                      <span className="text-foreground-muted">
                        {pkg.completedLessons}/{pkg.totalLessons} lezioni ({progressPercentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-background-secondary rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Lesson Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-blue-500/10 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">{pkg.totalLessons}</div>
                      <div className="text-xs text-foreground-muted">Totale</div>
                    </div>
                    <div className="text-center p-3 bg-green-500/10 rounded-lg">
                      <div className="text-lg font-bold text-green-600">{pkg.completedLessons}</div>
                      <div className="text-xs text-foreground-muted">Completate</div>
                    </div>
                    <div className="text-center p-3 bg-orange-500/10 rounded-lg">
                      <div className="text-lg font-bold text-orange-600">{pkg.remainingLessons}</div>
                      <div className="text-xs text-foreground-muted">Rimanenti</div>
                    </div>
                  </div>

                  {/* Next/Last Lesson Info */}
                  {(pkg.nextLessonDate || pkg.lastLessonDate) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-3 bg-background-secondary rounded-lg">
                      {pkg.nextLessonDate && (
                        <div className="flex items-center gap-2 text-sm">
                          <ClockIcon className="h-4 w-4 text-green-500" />
                          <span className="text-foreground-secondary">Prossima lezione:</span>
                          <span className="font-medium text-foreground">
                            {new Date(pkg.nextLessonDate).toLocaleDateString('it-IT')}
                          </span>
                        </div>
                      )}
                      {pkg.lastLessonDate && (
                        <div className="flex items-center gap-2 text-sm">
                          <ChartBarIcon className="h-4 w-4 text-blue-500" />
                          <span className="text-foreground-secondary">Ultima lezione:</span>
                          <span className="font-medium text-foreground">
                            {new Date(pkg.lastLessonDate).toLocaleDateString('it-IT')}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    {pkg.status === 'active' && (
                      <a
                        href={`/dashboard/student/lessons?package=${pkg.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                      >
                        <CalendarDaysIcon className="h-4 w-4" />
                        Prenota Lezione
                      </a>
                    )}
                    <a
                      href={`/dashboard/student/history?package=${pkg.id}`}
                      className="inline-flex items-center gap-2 px-4 py-2 border border-border text-foreground-secondary rounded-md hover:bg-background-secondary transition-colors"
                    >
                      <ChartBarIcon className="h-4 w-4" />
                      Visualizza Storico
                    </a>
                    <button className="inline-flex items-center gap-2 px-4 py-2 border border-border text-foreground-secondary rounded-md hover:bg-background-secondary transition-colors">
                      <UserIcon className="h-4 w-4" />
                      Contatta Tutor
                    </button>
                  </div>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </RequireAuth>
  )
}
