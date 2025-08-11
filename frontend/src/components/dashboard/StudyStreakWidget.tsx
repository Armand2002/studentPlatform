import { useEffect, useMemo, useState } from 'react'
import DashboardWidget from './DashboardWidget'
import { api } from '@/lib/api'
import { isAxiosError } from 'axios'

type Booking = { id: number; start_time: string }

function computeStreaks(dates: Date[]): { current: number; best: number } {
  if (dates.length === 0) return { current: 0, best: 0 }
  // Normalize to date-only strings for quick lookup
  const set = new Set(dates.map((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).toDateString()))
  const today = new Date()

  // Current streak: count backwards from today
  let current = 0
  let cursor = new Date(today)
  while (set.has(new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate()).toDateString())) {
    current += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  // Best streak: scan a 60-day window
  let best = current
  let tmp = 0
  const start = new Date(today)
  start.setDate(start.getDate() - 59)
  const walk = new Date(start)
  while (walk <= today) {
    const key = new Date(walk.getFullYear(), walk.getMonth(), walk.getDate()).toDateString()
    if (set.has(key)) {
      tmp += 1
      if (tmp > best) best = tmp
    } else {
      tmp = 0
    }
    walk.setDate(walk.getDate() + 1)
  }

  // If no lesson today but there is a recent streak, current may be 0
  // This matches typical streak definitions
  return { current, best }
}

export default function StudyStreakWidget() {
  const [completed, setCompleted] = useState<Booking[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchData() {
    setError(null)
    setLoading(true)
    try {
      try {
        await api.get('/api/users/me/student')
      } catch (e) {
        if (isAxiosError(e) && e.response?.status === 404) {
          setCompleted([])
          setLoading(false)
          return
        }
        throw e
      }

      const res = await api.get('/api/bookings/completed', { params: { limit: 200 } })
      setCompleted(res.data as Booking[])
    } catch (e: unknown) {
      if (isAxiosError(e)) {
        const status = e.response?.status
        if (status === 404) {
          setCompleted([])
          setError(null)
        } else if (status && status >= 500) setError('Errore del server, riprova più tardi')
        else setError('Impossibile caricare gli streak')
      } else setError('Impossibile caricare gli streak')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const streak = useMemo(() => {
    const dates = (completed || []).map((b) => new Date(b.start_time))
    return computeStreaks(dates)
  }, [completed])

  return (
    <DashboardWidget title="Study Streak">
      {loading && (
        <div className="space-y-2">
          <div className="h-6 w-24 rounded bg-blue-50" />
          <div className="h-4 w-32 rounded bg-blue-50" />
        </div>
      )}
      {!loading && error && (
        <div className="text-sm text-red-600">
          {error}
          <button onClick={fetchData} className="ml-2 text-blue-700 underline">Riprova</button>
        </div>
      )}
      {!loading && !error && (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-800">Streak attuale</p>
            <p className="text-2xl font-bold text-blue-900">{streak.current} giorni</p>
          </div>
          <div>
            <p className="text-sm text-blue-800">Migliore</p>
            <p className="text-2xl font-bold text-blue-900">{streak.best} giorni</p>
          </div>
        </div>
      )}
    </DashboardWidget>
  )
}


