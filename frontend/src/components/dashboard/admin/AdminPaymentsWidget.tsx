import DashboardWidget from '../../dashboard/DashboardWidget'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

type Payment = { id: number; amount_cents: number; currency: string; status: string; provider?: string | null; description?: string | null }

function euros(cents: number, currency: string) { return `${currency} ${(cents/100).toFixed(2)}` }

export default function AdminPaymentsWidget() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<Payment[]>([])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      // Use trailing slash to avoid 307 redirect that can break CORS preflight
      const res = await api.get('/api/payments/', { params: { limit: 10 } })
      setItems((res.data as Payment[]) || [])
    } catch {
      setError('Impossibile caricare i pagamenti')
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  return (
    <DashboardWidget title="Pagamenti Recenti" action={<button onClick={load} className="text-xs text-blue-700 underline">Aggiorna</button>}>
      {loading && <div className="h-8 w-1/2 rounded bg-blue-50" />}
      {!loading && error && <div className="text-sm text-red-600">{error}</div>}
      {!loading && !error && items.length === 0 && <div className="text-sm text-blue-700">Nessun pagamento</div>}
      {!loading && !error && items.length > 0 && (
        <ul className="space-y-2 text-sm text-gray-800">
          {items.map((p) => (
            <li key={p.id} className="flex items-center justify-between">
              <span className="truncate">{p.description || p.provider || '—'}</span>
              <span className="text-gray-600">{euros(p.amount_cents, p.currency)} • {p.status}</span>
            </li>
          ))}
        </ul>
      )}
    </DashboardWidget>
  )
}


