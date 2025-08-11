import DashboardWidget from '../../dashboard/DashboardWidget'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

type PackageDto = { id: number; name: string; subject: string; total_hours: number; price: number }

export default function AdminPackagesWidget() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<PackageDto[]>([])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/api/packages', { params: { limit: 10 } })
      setItems((res.data as PackageDto[]) || [])
    } catch {
      setError('Impossibile caricare i pacchetti')
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  return (
    <DashboardWidget title="Pacchetti Recenti">
      {loading && <div className="h-8 w-1/2 rounded bg-blue-50" />}
      {!loading && error && <div className="text-sm text-red-600">{error}</div>}
      {!loading && !error && items.length === 0 && <div className="text-sm text-blue-700">Nessun pacchetto</div>}
      {!loading && !error && items.length > 0 && (
        <ul className="space-y-2 text-sm text-gray-800">
          {items.map((p) => (
            <li key={p.id} className="flex items-center justify-between">
              <span className="truncate">{p.name} • {p.subject}</span>
              <span className="text-gray-600">{p.total_hours}h • € {Number(p.price).toFixed(2)}</span>
            </li>
          ))}
        </ul>
      )}
    </DashboardWidget>
  )
}


