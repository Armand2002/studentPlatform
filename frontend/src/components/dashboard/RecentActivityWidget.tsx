import { useEffect, useState } from 'react'
import DashboardWidget from './DashboardWidget'
import { api } from '@/lib/api'
import { isAxiosError } from 'axios'

type Booking = { id: number; start_time: string; subject?: string }

export default function RecentActivityWidget() {
  const [items, setItems] = useState<Booking[] | null>(null)
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
          setItems([])
          setLoading(false)
          return
        }
        throw e
      }

      // Mix di completed + upcoming per avere un feed
      const [completed, upcoming] = await Promise.all([
        api.get('/api/bookings/completed', { params: { limit: 5 } }),
        api.get('/api/bookings/upcoming', { params: { limit: 5 } }),
      ])
      const merged = [...(completed.data as Booking[]), ...(upcoming.data as Booking[])]
        .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
        .slice(0, 6)
      setItems(merged)
    } catch (e: unknown) {
      if (isAxiosError(e)) {
        const status = e.response?.status
        if (status === 404) {
          setItems([])
          setError(null)
        } else if (status && status >= 500) setError('Errore del server, riprova più tardi')
        else setError('Impossibile caricare le attività')
      } else setError('Impossibile caricare le attività')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <DashboardWidget title="Attività Recenti">
      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => {
            const key = `sk-${i}`
            return <div key={key} className="h-4 w-full rounded bg-blue-50" />
          })}
        </div>
      )}
      {!loading && error && (
        <div className="text-sm text-red-600">
          {error}
          <button onClick={fetchData} className="ml-2 text-blue-700 underline">Riprova</button>
        </div>
      )}
      {!loading && !error && items && items.length === 0 && (
        <p className="text-sm text-blue-700">Nessuna attività recente</p>
      )}
      {!loading && !error && items && items.length > 0 && (
        <ul className="space-y-2">
          {items.map((x) => (
            <li key={x.id} className="rounded border border-blue-100 p-2 text-sm text-blue-900">
              {new Date(x.start_time).toLocaleString()} • {x.subject ?? 'Lezione'}
            </li>
          ))}
        </ul>
      )}
    </DashboardWidget>
  )}


