"use client"

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { Download, RefreshCw } from 'lucide-react'

// This page is a lightweight merge of the existing Reports + Advanced Analytics pages.
// It provides two tabs and fetches the relevant endpoints when the tab is active.

type ReportOverview = {
  total_revenue_cents: number
  total_bookings: number
  active_users: number
  completion_rate: number
  average_session_duration?: number
  top_tutors?: Array<any>
  monthly_revenue?: Array<any>
  user_growth?: Array<any>
}

export default function AdminAnalyticsMerged() {
  const [activeTab, setActiveTab] = useState<'analytics' | 'reports'>('analytics')

  // Reports state
  const [reportsLoading, setReportsLoading] = useState(false)
  const [reportsError, setReportsError] = useState<string | null>(null)
  const [reportsData, setReportsData] = useState<ReportOverview | null>(null)

  // Analytics (simplified) state
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [analyticsError, setAnalyticsError] = useState<string | null>(null)
  const [metrics, setMetrics] = useState<any>(null)

  const fetchReports = async () => {
    setReportsLoading(true)
    setReportsError(null)
    try {
      const { data } = await api.get('/api/admin/reports/overview')
      setReportsData(data)
    } catch (err) {
      console.error('Error fetching reports', err)
      setReportsError('Impossibile caricare i report')
    } finally {
      setReportsLoading(false)
    }
  }

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true)
    setAnalyticsError(null)
    try {
      const [metricsRes, trendsRes] = await Promise.all([
        api.get('/api/analytics/metrics'),
        api.get('/api/analytics/trends', { params: { days: 14 } }),
      ])
      setMetrics({ metrics: metricsRes.data, trends: trendsRes.data })
    } catch (err) {
      console.error('Error fetching analytics', err)
      setAnalyticsError('Impossibile caricare gli analytics')
    } finally {
      setAnalyticsLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'reports') fetchReports()
    else fetchAnalytics()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Analytics Amministrazione</h1>
        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-border bg-background p-1">
            <button onClick={() => setActiveTab('analytics')} className={`px-3 py-1 text-sm ${activeTab === 'analytics' ? 'bg-primary text-white rounded' : ''}`}>Analytics</button>
            <button onClick={() => setActiveTab('reports')} className={`px-3 py-1 text-sm ${activeTab === 'reports' ? 'bg-primary text-white rounded' : ''}`}>Reports</button>
          </div>
        </div>
      </div>

      {activeTab === 'reports' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Report Overview</h2>
              <p className="text-sm text-foreground-secondary">Dati aggregati e export</p>
            </div>
            <div className="flex gap-2">
              <button onClick={fetchReports} className="flex items-center gap-2 px-3 py-2 border rounded hover:bg-background-secondary"><RefreshCw className="w-4 h-4" />Aggiorna</button>
              <button onClick={() => {
                if (!reportsData) return
                try {
                  const rows = [
                    ['Metrica', 'Valore'],
                    ['Fatturato Totale', `€${(reportsData.total_revenue_cents/100).toFixed(2)}`],
                    ['Prenotazioni Totali', String(reportsData.total_bookings)],
                    ['Utenti Attivi', String(reportsData.active_users)],
                  ]
                  const csv = rows.map(r => r.join(',')).join('\n')
                  const blob = new Blob([csv], { type: 'text/csv' })
                  const url = window.URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `report_${new Date().toISOString().split('T')[0]}.csv`
                  document.body.appendChild(a)
                  a.click()
                  document.body.removeChild(a)
                  window.URL.revokeObjectURL(url)
                } catch (err) {
                  console.error('Export failed', err)
                }
              }} className="flex items-center gap-2 px-3 py-2 bg-primary text-white rounded"><Download className="w-4 h-4" />Esporta CSV</button>
            </div>
          </div>

          {reportsLoading && <Card className="p-6">Caricamento...</Card>}
          {reportsError && <Card className="p-4 text-red-700">{reportsError}</Card>}

          {reportsData && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="p-6">
                  <p className="text-sm text-foreground-secondary">Fatturato</p>
                  <p className="text-2xl font-bold">€{(reportsData.total_revenue_cents / 100).toFixed(2)}</p>
                </Card>
                <Card className="p-6">
                  <p className="text-sm text-foreground-secondary">Prenotazioni</p>
                  <p className="text-2xl font-bold">{reportsData.total_bookings}</p>
                </Card>
                <Card className="p-6">
                  <p className="text-sm text-foreground-secondary">Utenti Attivi</p>
                  <p className="text-2xl font-bold">{reportsData.active_users}</p>
                </Card>
                <Card className="p-6">
                  <p className="text-sm text-foreground-secondary">Tasso Completamento</p>
                  <p className="text-2xl font-bold">{(reportsData.completion_rate ?? 0).toFixed(1)}%</p>
                </Card>
              </div>

              <Card className="p-6">
                <h3 className="font-semibold mb-4">Top Tutors</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-foreground-secondary border-b border-border">
                        <th className="py-2">Tutor</th>
                        <th className="py-2">Guadagni</th>
                        <th className="py-2">Lezioni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(reportsData.top_tutors || []).map((t: any) => (
                        <tr key={t.id} className="border-b border-border hover:bg-background-secondary">
                          <td className="py-2">{t.name}</td>
                          <td className="py-2">€{t.totalEarnings}</td>
                          <td className="py-2">{t.totalLessons}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Analytics Avanzato (semplificato)</h2>
              <p className="text-sm text-foreground-secondary">KPI e trend principali</p>
            </div>
            <div className="flex gap-2">
              <button onClick={fetchAnalytics} className="flex items-center gap-2 px-3 py-2 border rounded hover:bg-background-secondary"><RefreshCw className="w-4 h-4" />Aggiorna</button>
            </div>
          </div>

          {analyticsLoading && <Card className="p-6">Caricamento...</Card>}
          {analyticsError && <Card className="p-4 text-red-700">{analyticsError}</Card>}

          {metrics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="p-6">
                <p className="text-sm text-foreground-secondary">Utenti Totali</p>
                <p className="text-2xl font-bold">{metrics.metrics?.students ? metrics.metrics.students + (metrics.metrics?.tutors || 0) : 'N/A'}</p>
              </Card>
              <Card className="p-6">
                <p className="text-sm text-foreground-secondary">Revenue (ultimi 30d)</p>
                <p className="text-2xl font-bold">{metrics.metrics?.revenue_cents_30d ? `€${(metrics.metrics.revenue_cents_30d / 100).toFixed(2)}` : 'N/A'}</p>
              </Card>
              <Card className="p-6">
                <p className="text-sm text-foreground-secondary">Lezioni Totali</p>
                <p className="text-2xl font-bold">{metrics.metrics?.bookings ?? 'N/A'}</p>
              </Card>
              <Card className="p-6">
                <p className="text-sm text-foreground-secondary">Retention 30d</p>
                <p className="text-2xl font-bold">{metrics.metrics?.retention_rate_30d ? `${metrics.metrics.retention_rate_30d}%` : 'N/A'}</p>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
