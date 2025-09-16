"use client"
import { useState, useEffect } from 'react'
import { 
  BookOpenIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  CreditCardIcon,
  CalendarDaysIcon,
  AcademicCapIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import RequireAuth from '@/components/auth/RequireAuth'

interface Package {
  id: string
  name: string
  subject: string
  tutor: string
  totalHours: number
  usedHours: number
  remainingHours: number
  price: number
  purchaseDate: string
  expiryDate: string
  status: 'active' | 'expired' | 'completed'
  description?: string
}

export default function MyPackagesPage() {
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'expired' | 'completed'>('all')

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

  const filteredPackages = packages.filter(pkg => {
    if (filter === 'all') return true
    return pkg.status === filter
  })

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return {
          color: 'text-green-500 bg-green-500/10 border-green-500/20',
          icon: CheckCircleIcon,
          label: 'Attivo'
        }
      case 'expired':
        return {
          color: 'text-red-500 bg-red-500/10 border-red-500/20',
          icon: XCircleIcon,
          label: 'Scaduto'
        }
      case 'completed':
        return {
          color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
          icon: CheckCircleIcon,
          label: 'Completato'
        }
      default:
        return {
          color: 'text-gray-500 bg-gray-500/10 border-gray-500/20',
          icon: ClockIcon,
          label: 'Sconosciuto'
        }
    }
  }

  const getProgressPercentage = (used: number, total: number) => {
    return Math.min(100, Math.round((used / total) * 100))
  }

  if (loading) {
    return (
      <RequireAuth>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-background-secondary rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-background-secondary rounded w-2/3 mb-6"></div>
            <div className="grid gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-background-secondary rounded-lg"></div>
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
              Gestisci i tuoi pacchetti di lezioni e monitora l&apos;utilizzo delle ore
            </p>
          </div>
          
          <a
            href="/packages"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            Acquista Pacchetto
          </a>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'Tutti' },
              { key: 'active', label: 'Attivi' },
              { key: 'expired', label: 'Scaduti' },
              { key: 'completed', label: 'Completati' }
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
        <div className="space-y-6">
          {filteredPackages.length === 0 ? (
            <Card className="p-12 text-center">
              <BookOpenIcon className="h-16 w-16 text-foreground-muted mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {filter === 'all' ? 'Nessun pacchetto trovato' : `Nessun pacchetto ${filter === 'active' ? 'attivo' : filter === 'expired' ? 'scaduto' : 'completato'}`}
              </h3>
              <p className="text-foreground-muted mb-6">
                {filter === 'all' 
                  ? 'Non hai ancora acquistato nessun pacchetto di lezioni.'
                  : 'Prova a modificare i filtri per vedere altri pacchetti.'
                }
              </p>
              {filter === 'all' && (
                <a
                  href="/packages"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  <PlusIcon className="h-4 w-4" />
                  Esplora Pacchetti Disponibili
                </a>
              )}
            </Card>
          ) : (
            filteredPackages.map((pkg) => {
              const statusConfig = getStatusConfig(pkg.status)
              const progressPercentage = getProgressPercentage(pkg.usedHours, pkg.totalHours)
              const StatusIcon = statusConfig.icon

              return (
                <Card key={pkg.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-foreground">{pkg.name}</h3>
                        <span className={cn(
                          "px-2 py-1 text-xs font-medium rounded-full border",
                          statusConfig.color
                        )}>
                          <StatusIcon className="h-3 w-3 inline mr-1" />
                          {statusConfig.label}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-foreground-muted mb-3">
                        <span className="flex items-center gap-1">
                          <AcademicCapIcon className="h-4 w-4" />
                          {pkg.subject}
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpenIcon className="h-4 w-4" />
                          {pkg.tutor}
                        </span>
                        <span className="flex items-center gap-1">
                          <CreditCardIcon className="h-4 w-4" />
                          €{pkg.price}
                        </span>
                      </div>
                      
                      {pkg.description && (
                        <p className="text-sm text-foreground-secondary mb-3">
                          {pkg.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-foreground-muted">Utilizzo ore</span>
                      <span className="font-medium text-foreground">
                        {pkg.usedHours}/{pkg.totalHours} ore ({progressPercentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-background-secondary rounded-full h-2">
                      <div 
                        className={cn(
                          "h-2 rounded-full transition-all duration-300",
                          pkg.status === 'active' ? "bg-primary" : 
                          pkg.status === 'completed' ? "bg-green-500" : "bg-red-500"
                        )}
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-foreground-muted mt-1">
                      <span>Ore rimanenti: {pkg.remainingHours}</span>
                      <span>Scadenza: {new Date(pkg.expiryDate).toLocaleDateString('it-IT')}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    {pkg.status === 'active' && pkg.remainingHours > 0 && (
                      <a
                        href="/dashboard/student/prenota"
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                      >
                        <CalendarDaysIcon className="h-4 w-4" />
                        Prenota Lezione
                      </a>
                    )}
                    <a
                      href={`/dashboard/student/storico?package=${pkg.id}`}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 border border-border text-foreground-secondary rounded-md hover:bg-background-secondary transition-colors"
                    >
                      <ClockIcon className="h-4 w-4" />
                      Vedi Storico
                    </a>
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
