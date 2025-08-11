"use client"
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { isAxiosError } from 'axios'

type Purchase = {
  id: number
  package_id: number
  hours_remaining: number
  purchase_date: string
  expiry_date: string
  is_active: boolean
}

export default function MyPurchasesPage() {
  const [items, setItems] = useState<Purchase[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/api/packages/purchases')
      setItems(res.data as Purchase[])
    } catch (e) {
      if (isAxiosError(e)) setError(e.response?.data?.detail || 'Impossibile caricare gli acquisti')
      else setError('Impossibile caricare gli acquisti')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <section className="w-full">
      <div className="container-app section-wrap">
        <h1 className="mb-4 text-xl font-bold text-gray-900">I miei pacchetti</h1>
        {loading && <div className="h-24 w-full rounded-xl bg-blue-50" />}
        {!loading && error && <div className="text-sm text-red-600">{error}</div>}
        {!loading && !error && items && items.length === 0 && <div className="text-sm text-blue-700">Nessun acquisto trovato</div>}
        {!loading && !error && items && items.length > 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {items.map((p) => (
              <div key={p.id} className="rounded-lg border bg-white p-4">
                <div className="text-sm text-gray-700">
                  <div className="mb-1"><span className="font-medium">Acquistato:</span> {new Date(p.purchase_date).toLocaleDateString()}</div>
                  <div className="mb-1"><span className="font-medium">Scadenza:</span> {new Date(p.expiry_date).toLocaleDateString()}</div>
                  <div className="mb-1"><span className="font-medium">Ore residue:</span> {p.hours_remaining}</div>
                  <div className="mb-1"><span className="font-medium">Stato:</span> {p.is_active ? 'Attivo' : 'Non attivo'}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}


