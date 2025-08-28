"use client"
import { useState, useEffect } from 'react'
import { 
  BookOpenIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

interface PackageData {
  id: string
  name: string
  totalHours: number
  remainingHours: number
  expiryDate: string
  subject: string
  isExpiringSoon: boolean
}

interface PackageOverviewWidgetProps {
  className?: string
}

export default function PackageOverviewWidget({ className }: PackageOverviewWidgetProps) {
  const [packages, setPackages] = useState<PackageData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Mock data per sviluppo - sarà sostituito con API call
  useEffect(() => {
    const mockPackages: PackageData[] = [
      {
        id: '1',
        name: 'Pacchetto Matematica Base',
        totalHours: 20,
        remainingHours: 12,
        expiryDate: '2025-09-15',
        subject: 'Matematica',
        isExpiringSoon: true
      },
      {
        id: '2',
        name: 'Pacchetto Fisica Avanzato',
        totalHours: 15,
        remainingHours: 8,
        expiryDate: '2025-10-20',
        subject: 'Fisica',
        isExpiringSoon: false
      },
      {
        id: '3',
        name: 'Pacchetto Chimica',
        totalHours: 10,
        remainingHours: 3,
        expiryDate: '2025-08-30',
        subject: 'Chimica',
        isExpiringSoon: true
      }
    ]

    // Simula API call
    setTimeout(() => {
      setPackages(mockPackages)
      setLoading(false)
    }, 1000)
  }, [])

  const totalRemainingHours = packages.reduce((sum, pkg) => sum + pkg.remainingHours, 0)
  const totalPurchasedHours = packages.reduce((sum, pkg) => sum + pkg.totalHours, 0)
  const overallProgress = totalPurchasedHours > 0 ? ((totalPurchasedHours - totalRemainingHours) / totalPurchasedHours) * 100 : 0

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getDaysUntilExpiry = (dateString: string) => {
    const today = new Date()
    const expiryDate = new Date(dateString)
    const diffTime = expiryDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (loading) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="animate-pulse">
          <div className="h-4 bg-background-secondary rounded w-3/4 mb-4"></div>
          <div className="h-8 bg-background-secondary rounded w-1/2 mb-6"></div>
          <div className="space-y-3">
            <div className="h-3 bg-background-secondary rounded"></div>
            <div className="h-3 bg-background-secondary rounded w-5/6"></div>
            <div className="h-3 bg-background-secondary rounded w-4/6"></div>
          </div>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={cn("p-6 border-red-500/20", className)}>
        <div className="text-center text-red-500">
          <ExclamationTriangleIcon className="h-8 w-8 mx-auto mb-2" />
          <p className="text-sm">Errore nel caricamento pacchetti</p>
          <p className="text-xs text-foreground-muted">{error}</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className={cn("p-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <BookOpenIcon className="h-5 w-5 text-primary" />
            I Miei Pacchetti
          </h3>
          <p className="text-sm text-foreground-muted">
            {packages.length} pacchetto{packages.length !== 1 ? 'i' : ''} attivo{packages.length !== 1 ? 'i' : ''}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">{totalRemainingHours}h</div>
          <div className="text-xs text-foreground-muted">Ore rimanenti</div>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-foreground-muted">Progresso complessivo</span>
          <span className="text-foreground font-medium">{Math.round(overallProgress)}%</span>
        </div>
        <div className="w-full bg-background-secondary rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-primary to-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-foreground-muted mt-1">
          <span>{totalPurchasedHours - totalRemainingHours}h utilizzate</span>
          <span>{totalPurchasedHours}h totali</span>
        </div>
      </div>

      {/* Packages List */}
      <div className="space-y-4">
        {packages.map((pkg) => {
          const daysUntilExpiry = getDaysUntilExpiry(pkg.expiryDate)
          const packageProgress = ((pkg.totalHours - pkg.remainingHours) / pkg.totalHours) * 100

          return (
            <div 
              key={pkg.id}
              className={cn(
                "p-4 rounded-lg border transition-all duration-200",
                pkg.isExpiringSoon 
                  ? "border-orange-500/30 bg-orange-500/5" 
                  : "border-border bg-background-secondary/50"
              )}
            >
              {/* Package Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-medium text-foreground text-sm">{pkg.name}</h4>
                  <p className="text-xs text-foreground-muted">{pkg.subject}</p>
                </div>
                {pkg.isExpiringSoon && (
                  <ExclamationTriangleIcon className="h-4 w-4 text-orange-500 flex-shrink-0 ml-2" />
                )}
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-foreground-muted">Progresso</span>
                  <span className="text-foreground font-medium">{Math.round(packageProgress)}%</span>
                </div>
                <div className="w-full bg-background-tertiary rounded-full h-1.5">
                  <div 
                    className="bg-gradient-to-r from-primary to-primary-600 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${packageProgress}%` }}
                  />
                </div>
              </div>

              {/* Package Stats */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-foreground-muted">
                  <ClockIcon className="h-3 w-3" />
                  <span>{pkg.remainingHours}h rimanenti</span>
                </div>
                <div className={cn(
                  "flex items-center gap-1",
                  daysUntilExpiry <= 7 ? "text-orange-500" : "text-foreground-muted"
                )}>
                  {daysUntilExpiry <= 7 ? (
                    <ExclamationTriangleIcon className="h-3 w-3" />
                  ) : (
                    <CheckCircleIcon className="h-3 w-3" />
                  )}
                  <span>
                    {daysUntilExpiry <= 0 
                      ? 'Scaduto' 
                      : daysUntilExpiry === 1 
                        ? 'Scade domani' 
                        : `Scade tra ${daysUntilExpiry} giorni`
                    }
                  </span>
                </div>
              </div>

              {/* Expiry Warning */}
              {pkg.isExpiringSoon && (
                <div className="mt-3 p-2 bg-orange-500/10 border border-orange-500/20 rounded text-xs text-orange-600">
                  ⚠️ Questo pacchetto scade presto! Prenota le tue lezioni.
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex gap-2">
          <button className="flex-1 px-3 py-2 text-xs font-medium text-primary border border-primary/20 rounded-md hover:bg-primary/10 transition-colors">
            Prenota Lezione
          </button>
          <button className="flex-1 px-3 py-2 text-xs font-medium text-foreground-secondary border border-border rounded-md hover:bg-background-secondary transition-colors">
            Acquista Nuovo
          </button>
        </div>
      </div>
    </Card>
  )
}
