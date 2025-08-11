import { useEffect, useState } from 'react'
import { isAxiosError } from 'axios'
import DashboardWidget from './DashboardWidget'
import { api } from '@/lib/api'

type Booking = { id: number; start_time: string; subject?: string; tutor_name?: string }

export default function UpcomingLessonsWidget() {
  const [data, setData] = useState<Booking[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchData() {
    setError(null)
    setLoading(true)
    try {
      // Gate: ensure profile exists
      try {
        await api.get('/api/users/me/student')
      } catch (e) {
        if (isAxiosError(e) && e.response?.status === 404) {
          setData([])
          setLoading(false)
          return
        }
        throw e
      }

      const res = await api.get('/api/bookings/upcoming')
      setData(res.data as Booking[])
    } catch (e: unknown) {
      if (isAxiosError(e)) {
        const status = e.response?.status
        if (status === 404) {
          // Nessun profilo/nessun dato → stato vuoto
          setData([])
          setError(null)
          return
        }
        console.error('UpcomingLessonsWidget fetch failed', e)
        if (status && status >= 500) setError('Errore del server, riprova più tardi')
        else setError('Impossibile caricare le prossime lezioni')
      } else {
        console.error('UpcomingLessonsWidget fetch failed', e)
        setError('Impossibile caricare le prossime lezioni')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <DashboardWidget title="Prossime Lezioni">
      {loading && (
        <div className="space-y-2">
          <div className="h-4 w-2/3 rounded bg-blue-50" />
          <div className="h-4 w-1/2 rounded bg-blue-50" />
          <div className="h-4 w-3/4 rounded bg-blue-50" />
        </div>
      )}
      {!loading && error && (
        <div className="text-sm text-red-600">
          {error}
          <button onClick={fetchData} className="ml-2 text-blue-700 underline">Riprova</button>
        </div>
      )}
      {!loading && !error && (!data || data.length === 0) && (
        <p className="text-sm text-blue-700">Nessuna lezione in arrivo</p>
      )}
      {!loading && !error && data && data.length > 0 && (
        <div className="flex flex-col gap-2">
          {data.map((l) => {
            const when = new Date(l.start_time).toLocaleString()
            return (
              <div key={l.id} className="rounded-lg border border-blue-100 p-3">
                <p className="text-sm font-medium text-blue-900">{when}</p>
                <p className="text-xs text-blue-600">{l.subject ?? 'Lezione'} • {l.tutor_name ?? ''}</p>
              </div>
            )
          })}
        </div>
      )}
    </DashboardWidget>
  )
}


