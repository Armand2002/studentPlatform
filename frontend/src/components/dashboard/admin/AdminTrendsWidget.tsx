import DashboardWidget from '../../dashboard/DashboardWidget'
import { useEffect, useMemo, useState } from 'react'
import { api } from '@/lib/api'

type Booking = { id: number; start_time: string; end_time: string }

function daysAgo(date: Date, n: number) {
  const d = new Date(date)
  d.setDate(d.getDate() - n)
  d.setHours(0,0,0,0)
  return d
}

export default function AdminTrendsWidget() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [completed, setCompleted] = useState<Booking[]>([])
  const [upcoming, setUpcoming] = useState<Booking[]>([])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const [c, u] = await Promise.all([
        api.get('/api/bookings/completed', { params: { limit: 1000 } }),
        api.get('/api/bookings/upcoming', { params: { limit: 1000 } }),
      ])
      setCompleted(c.data as Booking[])
      setUpcoming(u.data as Booking[])
    } catch {
      setError('Impossibile caricare i trend')
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const series = useMemo(() => {
    // ultimi 14 giorni
    const today = new Date(); today.setHours(0,0,0,0)
    const labels: string[] = []
    const comp: number[] = []
    const up: number[] = []
    for (let i = 13; i >= 0; i -= 1) {
      const d = daysAgo(today, i)
      const key = d.toISOString().slice(0,10)
      labels.push(key.slice(5))
      comp.push(completed.filter(b => new Date(b.end_time).toISOString().slice(0,10) === key).length)
      up.push(upcoming.filter(b => new Date(b.start_time).toISOString().slice(0,10) === key).length)
    }
    return { labels, comp, up }
  }, [completed, upcoming])

  const maxVal = Math.max(1, ...series.comp, ...series.up)

  return (
    <DashboardWidget title="Trend lezioni (14g)">
      {loading && <div className="h-8 w-1/2 rounded bg-blue-50" />}
      {!loading && error && <div className="text-sm text-red-600">{error}</div>}
      {!loading && !error && (
        <div className="space-y-2">
          <div className="flex items-end gap-1 h-24">
            {series.comp.map((v, i) => {
              const h = Math.round((v / maxVal) * 96)
              const key = `c-${i}-${v}`
              return <div key={key} title={`comp ${v}`} className="w-2 bg-blue-400" style={{ height: `${h}px` }} />
            })}
          </div>
          <div className="flex items-end gap-1 h-24">
            {series.up.map((v, i) => {
              const h = Math.round((v / maxVal) * 96)
              const key = `u-${i}-${v}`
              return <div key={key} title={`up ${v}`} className="w-2 bg-emerald-400" style={{ height: `${h}px` }} />
            })}
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-gray-500">
            {series.labels.map((l, i) => {
              const key = `l-${i}-${l}`
              return <span key={key}>{l}</span>
            })}
          </div>
        </div>
      )}
    </DashboardWidget>
  )
}


