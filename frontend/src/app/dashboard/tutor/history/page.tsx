"use client"

import RequireAuth from '@/components/auth/RequireAuth'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/ui/Card'
import { 
  ChartBarIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  BanknotesIcon,
  TrophyIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

export default function TutorHistoryPage() {
  const { user } = useAuth()

  if (!user || user.role !== 'tutor') {
    return (
      <RequireAuth>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Accesso Negato
            </h2>
            <p className="text-foreground-secondary">
              Solo i tutor possono accedere a questa pagina.
            </p>
          </div>
        </div>
      </RequireAuth>
    )
  }

  return (
    <RequireAuth>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-secondary/10 via-secondary/5 to-primary/10 rounded-xl p-6 border border-secondary/20">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Storico e Statistiche
          </h1>
          <p className="text-foreground-secondary text-lg">
            Visualizza le tue performance passate, statistiche e cronologia delle attività.
          </p>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <CalendarDaysIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-foreground-secondary">Lezioni Totali</p>
                <p className="text-2xl font-bold text-foreground">127</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <UserGroupIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-foreground-secondary">Studenti Seguiti</p>
                <p className="text-2xl font-bold text-foreground">23</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <BanknotesIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-foreground-secondary">Guadagni Totali</p>
                <p className="text-2xl font-bold text-foreground">€2,350</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrophyIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-foreground-secondary">Rating Medio</p>
                <p className="text-2xl font-bold text-foreground">4.8</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Lezioni per Mese
            </h3>
            <div className="text-center py-8">
              <ChartBarIcon className="w-12 h-12 text-foreground-muted mx-auto mb-4" />
              <p className="text-foreground-muted">
                Grafico delle lezioni mensili - In sviluppo
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Distribuzione Materie
            </h3>
            <div className="text-center py-8">
              <ChartBarIcon className="w-12 h-12 text-foreground-muted mx-auto mb-4" />
              <p className="text-foreground-muted">
                Grafico a torta materie - In sviluppo
              </p>
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Attività Recenti
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-background-secondary rounded-lg">
              <div className="p-2 bg-green-100 rounded-lg">
                <CalendarDaysIcon className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  Lezione completata con Mario Rossi
                </p>
                <p className="text-xs text-foreground-secondary">
                  Matematica - 2 ore fa
                </p>
              </div>
              <div className="text-sm text-foreground-secondary">
                €25.00
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-background-secondary rounded-lg">
              <div className="p-2 bg-blue-100 rounded-lg">
                <UserGroupIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  Nuovo studente assegnato: Giulia Bianchi
                </p>
                <p className="text-xs text-foreground-secondary">
                  Fisica - 1 giorno fa
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-background-secondary rounded-lg">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ClockIcon className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  Lezione programmata con Luca Verdi
                </p>
                <p className="text-xs text-foreground-secondary">
                  Inglese - Domani alle 15:00
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Performance Trends */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Andamento Performance
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-background-secondary rounded-lg">
              <p className="text-2xl font-bold text-green-600">+12%</p>
              <p className="text-sm text-foreground-secondary">Lezioni questo mese</p>
            </div>
            
            <div className="text-center p-4 bg-background-secondary rounded-lg">
              <p className="text-2xl font-bold text-blue-600">4.8/5</p>
              <p className="text-sm text-foreground-secondary">Rating medio</p>
            </div>
            
            <div className="text-center p-4 bg-background-secondary rounded-lg">
              <p className="text-2xl font-bold text-purple-600">94%</p>
              <p className="text-sm text-foreground-secondary">Tasso completamento</p>
            </div>
          </div>
        </Card>
      </div>
    </RequireAuth>
  )
}
