import { useEffect, useMemo, useState } from 'react'
import DashboardWidget from './DashboardWidget'
import { api } from '@/lib/api'
import { isAxiosError } from 'axios'
import { useAuth } from '@/contexts/AuthContext'

interface Booking { id: number; start_time: string }

export default function BookingCalendarWidget() {
  const { user } = useAuth()
  const [data, setData] = useState<Booking[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchData() {
    setError(null)
    setLoading(true)
    try {
      // Se l'utente è studente, precheck per evitare 404 rumorosi; se è tutor, salta il precheck
      if (user?.role === 'student') {
        try {
          await api.get('/api/users/me/student')
        } catch (e) {
          if (isAxiosError(e)) {
            const status = e.response?.status
            if (status === 404) {
              setData([])
              setLoading(false)
              return
            }
            // 403 (tutor/admin) non è un errore in questo widget → continua
          }
        }
      }

      const res = await api.get('/api/bookings/upcoming')
      setData(res.data as Booking[])
    } catch (e: unknown) {
      if (isAxiosError(e)) {
        const status = e.response?.status
        if (status === 404) {
          setData([])
          setError(null)
        } else if (status && status >= 500) {
          setError('Errore del server, riprova più tardi')
        } else {
          setError('Impossibile caricare il calendario')
        }
      } else {
        setError('Impossibile caricare il calendario')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const daysMatrix = useMemo(() => {
    const today = new Date()
    const list: { key: string; date: Date; has: boolean }[] = []
    const set = new Set(
      (data || []).map((b) => new Date(b.start_time).toDateString())
    )
    for (let i = 0; i < 14; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() + i)
      const has = set.has(d.toDateString())
      list.push({ key: d.toISOString(), date: d, has })
    }
    return list
  }, [data])

  return (
    <DashboardWidget title="Calendario Prenotazioni">
      {loading && (
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {Array.from({ length: 14 }).map((_, i) => {
            const key = `skeleton-${i}`
            return <div key={key} className="rounded-md px-2 py-3 bg-blue-50/50" />
          })}
        </div>
      )}
      {!loading && error && (
        <div className="text-sm text-red-600">
          {error}
          <button onClick={fetchData} className="ml-2 text-blue-700 underline">Riprova</button>
        </div>
      )}
      {!loading && !error && data && data.length === 0 && (
        <p className="text-sm text-blue-700">Nessuna prenotazione nei prossimi 14 giorni</p>
      )}
      {!loading && !error && daysMatrix.length > 0 && (
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {daysMatrix.map((x) => (
            <div
              key={x.key}
              className={`rounded-md px-2 py-3 ${x.has ? 'bg-blue-100 text-blue-800 font-medium' : 'bg-gray-50 text-gray-500'}`}
            >
              {x.date.getDate()}
            </div>
          ))}
        </div>
      )}
    </DashboardWidget>
  )
}


