"use client"

import RequireAuth from '@/components/auth/RequireAuth'
import { useAuth } from '@/contexts/AuthContext'
import { RevenueChart } from '@/components/dashboard/tutor/RevenueChart'
import { EarningsBreakdown } from '@/components/dashboard/tutor/EarningsBreakdown'
import EarningsWidget from '@/components/dashboard/tutor/EarningsWidget'

export default function TutorEarningsPage() {
  const { user } = useAuth()
  
  return (
    <RequireAuth>
      {user?.role === 'tutor' ? (
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-secondary/10 via-secondary/5 to-primary/10 rounded-xl p-6 border border-secondary/20">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Guadagni e Revenue
            </h1>
            <p className="text-foreground-secondary text-lg">
              Monitora i tuoi guadagni, analizza le performance e visualizza le statistiche finanziarie.
            </p>
          </div>

          {/* Earnings Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <RevenueChart />
            </div>
            <div className="lg:col-span-1">
              <EarningsBreakdown />
            </div>
          </div>

          {/* Additional Earnings Widget */}
          <EarningsWidget />
        </div>
      ) : (
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
      )}
    </RequireAuth>
  )
}
