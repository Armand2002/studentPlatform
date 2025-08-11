"use client"
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { isAxiosError } from 'axios'

type PackageDto = {
  id: number
  tutor_id: number
  name: string
  description?: string | null
  total_hours: number
  price: number
  subject: string
}

export default function PackageDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [data, setData] = useState<PackageDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [purchasing, setPurchasing] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get(`/api/packages/${params.id}`)
      setData(res.data as PackageDto)
    } catch (e) {
      if (isAxiosError(e)) setError(e.response?.data?.detail || 'Pacchetto non trovato')
      else setError('Pacchetto non trovato')
    } finally {
      setLoading(false)
    }
  }

  async function purchase() {
    if (!data) return
    setPurchasing(true)
    setSuccess(null)
    setError(null)
    try {
      // Nota: in un flusso reale servono student_id e expiry_date; qui si simula con dati minimi,
      // la rotta backend richiederà i campi corretti presenti nel modello.
      const expiry = new Date()
      expiry.setMonth(expiry.getMonth() + 1)
      await api.post('/api/packages/purchases', {
        student_id: 0, // sarà impostato lato backend sul current user o via profilo
        package_id: data.id,
        expiry_date: expiry.toISOString().slice(0, 10),
        hours_remaining: data.total_hours,
        is_active: true,
      })
      setSuccess('Acquisto completato')
      router.push('/dashboard')
    } catch (e) {
      if (isAxiosError(e)) setError(e.response?.data?.detail || 'Acquisto non riuscito')
      else setError('Acquisto non riuscito')
    } finally {
      setPurchasing(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  return (
    <section className="w-full">
      <div className="container-app section-wrap">
        {loading && <div className="h-32 w-full rounded-xl bg-blue-50" />}
        {!loading && error && <div className="text-sm text-red-600">{error}</div>}
        {!loading && !error && data && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <h1 className="text-2xl font-bold text-gray-900">{data.name}</h1>
              <div className="mt-2 inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">{data.subject}</div>
              <p className="mt-4 text-gray-700">{data.description || '—'}</p>
            </div>
            <div className="md:col-span-1">
              <div className="rounded-xl border bg-white p-4 shadow-card">
                <div className="text-sm text-gray-700">
                  <div className="mb-1"><span className="font-medium">Ore totali:</span> {data.total_hours}</div>
                  <div className="mb-1"><span className="font-medium">Prezzo:</span> € {Number(data.price).toFixed(2)}</div>
                </div>
                <button disabled={purchasing} onClick={purchase} className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-white hover:bg-primary-600 disabled:opacity-50">
                  {purchasing ? 'Acquisto…' : 'Acquista'}
                </button>
                {success && <div className="mt-2 text-xs text-green-700">{success}</div>}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}


