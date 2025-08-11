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
  const [labels, setLabels] = useState<string[]>([])
  const [comp, setComp] = useState<number[]>([])
  const [up, setUp] = useState<number[]>([])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/api/analytics/trends', { params: { days: 14 } })
      const data = res.data as { labels: string[]; completed: number[]; upcoming: number[] }
      setLabels(data.labels)
      setComp(data.completed)
      setUp(data.upcoming)
    } catch {
      setError('Impossibile caricare i trend')
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const series = useMemo(() => ({ labels, comp, up }), [labels, comp, up])

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


