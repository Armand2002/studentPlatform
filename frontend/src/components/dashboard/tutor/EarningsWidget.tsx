import DashboardWidget from '../DashboardWidget'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { isAxiosError } from 'axios'

type Booking = { id: number; tutor_id: number; start_time: string; end_time: string; status?: string }

function euros(n: number) { return `€ ${n.toFixed(2)}` }

export default function EarningsWidget() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [amount, setAmount] = useState<number>(0)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/api/bookings/completed', { params: { limit: 500 } })
      const bookings = (res.data as Booking[]) || []
      // Nota: non abbiamo la tariffa; stima: 20€/h
      const HOURLY = 20
      const total = bookings.reduce((sum, b) => {
        const start = new Date(b.start_time).getTime()
        const end = new Date(b.end_time).getTime()
        const hours = Math.max(1, Math.round((end - start) / (1000 * 60 * 60)))
        return sum + hours * HOURLY
      }, 0)
      setAmount(total)
    } catch (e) {
      if (isAxiosError(e) && e.response?.status === 404) {
        // Nessun profilo/nessuna prenotazione → mostra 0 senza errore
        setAmount(0)
        setError(null)
      } else {
        setError('Impossibile calcolare i guadagni')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <DashboardWidget title="Guadagni Stimati">
      {loading && <div className="h-8 w-1/2 rounded bg-blue-50" />}
      {!loading && error && <div className="text-sm text-red-600">{error}</div>}
      {!loading && !error && (
        <div className="text-2xl font-semibold text-gray-900">{euros(amount)}</div>
      )}
    </DashboardWidget>
  )
}


