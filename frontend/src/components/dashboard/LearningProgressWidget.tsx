import { useEffect, useState } from 'react'
import DashboardWidget from './DashboardWidget'
import { api } from '@/lib/api'
import { isAxiosError } from 'axios'

export default function LearningProgressWidget() {
  const [progress, setProgress] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchData() {
    setError(null)
    setLoading(true)
    try {
      // Verifica che il profilo studente esista, altrimenti imposta progresso a 0%
      try {
        await api.get('/api/users/me/student')
      } catch (e) {
        if (isAxiosError(e) && e.response?.status === 404) {
          setProgress(0)
          setLoading(false)
          return
        }
        throw e
      }

      // Placeholder endpoint: when analytics endpoints exist, replace with real one
      const res = await api.get('/api/bookings/completed')
      const completed = Array.isArray(res.data) ? res.data.length : 0
      const total = completed + 10
      const pct = Math.max(0, Math.min(100, Math.round((completed / Math.max(1, total)) * 100)))
      setProgress(pct)
    } catch (e: unknown) {
      if (isAxiosError(e)) {
        const status = e.response?.status
        if (status === 404) {
          // Nessun profilo/nessun completato → mostra 0%
          setProgress(0)
          setError(null)
          return
        }
        console.error('LearningProgressWidget fetch failed', e)
        if (status && status >= 500) setError('Errore del server, riprova più tardi')
        else setError('Impossibile caricare il progresso')
      } else {
        console.error('LearningProgressWidget fetch failed', e)
        setError('Impossibile caricare il progresso')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <DashboardWidget title="Progresso di Apprendimento">
      {loading && (
        <div className="space-y-2">
          <div className="h-4 w-1/2 rounded bg-blue-50" />
          <div className="h-2 w-full rounded bg-blue-50" />
        </div>
      )}
      {!loading && error && (
        <div className="text-sm text-red-600">
          {error}
          <button onClick={fetchData} className="ml-2 text-blue-700 underline">Riprova</button>
        </div>
      )}
      {!loading && !error && progress !== null && (
        <div>
          <div className="mb-2 flex items-center justify-between text-sm text-blue-800">
            <span>Completato</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-primary-100">
            <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}
    </DashboardWidget>
  )
}


