import DashboardWidget from '../../dashboard/DashboardWidget'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

type Tutor = { id: number }
type Student = { id: number }
type PackageDto = { id: number }

export default function AdminMetricsWidget() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tutors, setTutors] = useState(0)
  const [students, setStudents] = useState(0)
  const [packages, setPackages] = useState(0)
  const [completed24h, setCompleted24h] = useState(0)
  const [revenue30d, setRevenue30d] = useState(0)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/api/analytics/metrics')
      const m = res.data as { students: number; tutors: number; packages: number; bookings: number; completed_24h: number; revenue_cents_30d: number }
      setTutors(m.tutors)
      setStudents(m.students)
      setPackages(m.packages)
      setCompleted24h(m.completed_24h)
      setRevenue30d(Math.round((m.revenue_cents_30d || 0) / 100))
    } catch {
      setError('Impossibile caricare le metriche')
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  return (
    <DashboardWidget title="Metriche Principali">
      {loading && <div className="h-8 w-1/2 rounded bg-blue-50" />}
      {!loading && error && <div className="text-sm text-red-600">{error}</div>}
      {!loading && !error && (
        <div className="grid grid-cols-5 gap-3 text-sm">
          <div className="rounded-lg border bg-white p-3">
            <div className="text-xs text-gray-500">Tutors</div>
            <div className="text-lg font-semibold text-gray-900">{tutors}</div>
          </div>
          <div className="rounded-lg border bg-white p-3">
            <div className="text-xs text-gray-500">Students</div>
            <div className="text-lg font-semibold text-gray-900">{students}</div>
          </div>
          <div className="rounded-lg border bg-white p-3">
            <div className="text-xs text-gray-500">Packages</div>
            <div className="text-lg font-semibold text-gray-900">{packages}</div>
          </div>
          <div className="rounded-lg border bg-white p-3">
            <div className="text-xs text-gray-500">Completed (24h)</div>
            <div className="text-lg font-semibold text-gray-900">{completed24h}</div>
          </div>
          <div className="rounded-lg border bg-white p-3">
            <div className="text-xs text-gray-500">Revenue (30g)</div>
            <div className="text-lg font-semibold text-gray-900">€ {revenue30d.toLocaleString()}</div>
          </div>
        </div>
      )}
    </DashboardWidget>
  )
}


