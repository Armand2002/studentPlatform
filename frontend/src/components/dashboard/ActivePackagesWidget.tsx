import React, { useState, useEffect } from 'react'
import { isAxiosError } from 'axios'
import DashboardWidget from './DashboardWidget'
import { api } from '@/lib/api'
import { getCurrentStudentProfile } from '@/lib/api'

type ActivePackage = { id: number; name: string; remaining_hours?: number; expires_at?: string }

export default function ActivePackagesWidget() {
  const [data, setData] = useState<ActivePackage[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // 🆕 USA NUOVA FUNZIONE API per verificare profilo studente
      try {
        await getCurrentStudentProfile()
      } catch (e) {
        if (isAxiosError(e) && e.response?.status === 404) {
          setData([])
          setLoading(false)
          return
        }
        throw e
      }

      const res = await api.get('/api/packages/purchases/active')
      const list = res.data as any[]
      setData(list)
    } catch (e: unknown) {
      if (isAxiosError(e)) {
        const status = e.response?.status
        if (status === 404) {
          // Nessun profilo studente o nessun dato: trattalo come stato vuoto
          setData([])
          setError(null)
          return
        }
        console.error('ActivePackagesWidget fetch failed', e)
        if (status && status >= 500) setError('Errore del server, riprova più tardi')
        else setError('Impossibile caricare i pacchetti')
      } else {
        console.error('ActivePackagesWidget fetch failed', e)
        setError('Impossibile caricare i pacchetti')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <DashboardWidget title="Pacchetti Attivi">
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
        <p className="text-sm text-blue-700">Nessun pacchetto attivo</p>
      )}
      {!loading && !error && data && data.length > 0 && (
        <ul className="divide-y divide-blue-50">
          {data.map((p) => (
            <li key={p.id} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-blue-900">{p.name}</p>
                {p.expires_at && <p className="text-xs text-blue-600">Scade il {new Date(p.expires_at).toLocaleDateString()}</p>}
              </div>
              <div className="text-sm font-semibold text-blue-700">{p.remaining_hours ?? 0}h</div>
            </li>
          ))}
        </ul>
      )}
    </DashboardWidget>
  )
}


