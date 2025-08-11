import DashboardWidget from '../DashboardWidget'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

type Booking = { id: number; start_time: string; end_time: string; status?: string }

export default function PerformanceWidget() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [completed, setCompleted] = useState(0)
  const [upcoming, setUpcoming] = useState(0)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const [c, u] = await Promise.all([
        api.get('/api/bookings/completed', { params: { limit: 200 } }),
        api.get('/api/bookings/upcoming', { params: { limit: 200 } }),
      ])
      setCompleted((c.data as Booking[]).length)
      setUpcoming((u.data as Booking[]).length)
    } catch {
      setError('Impossibile caricare metriche')
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  return (
    <DashboardWidget title="Prestazioni">
      {loading && <div className="h-8 w-1/2 rounded bg-blue-50" />}
      {!loading && error && <div className="text-sm text-red-600">{error}</div>}
      {!loading && !error && (
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg border bg-white p-3">
            <div className="text-xs text-gray-500">Completate</div>
            <div className="text-lg font-semibold text-gray-900">{completed}</div>
          </div>
          <div className="rounded-lg border bg-white p-3">
            <div className="text-xs text-gray-500">In arrivo</div>
            <div className="text-lg font-semibold text-gray-900">{upcoming}</div>
          </div>
        </div>
      )}
    </DashboardWidget>
  )
}


