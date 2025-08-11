"use client"
import { useEffect, useMemo, useState } from 'react'
import { api } from '@/lib/api'
import PackageCard, { PackageDto } from '@/components/packages/PackageCard'
import { isAxiosError } from 'axios'
import { useRouter } from 'next/navigation'
type Tutor = { id: number; user_id: number; first_name?: string; last_name?: string }

export default function PackagesPage() {
  const [items, setItems] = useState<PackageDto[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [subject, setSubject] = useState('')
  const [tutors, setTutors] = useState<Tutor[]>([])
  const [tutorId, setTutorId] = useState<number | ''>('')
  const [minPrice, setMinPrice] = useState<string>('')
  const [maxPrice, setMaxPrice] = useState<string>('')
  const [minHours, setMinHours] = useState<string>('')
  const [sort, setSort] = useState<string>('relevance')
  const [page, setPage] = useState(0)
  const pageSize = 12

  const router = useRouter()

  async function fetchData() {
    setLoading(true)
    setError(null)
    try {
      const params: any = { skip: page * pageSize, limit: pageSize }
      if (subject) params.subject = subject
      if (tutorId) params.tutor_id = tutorId
      const res = await api.get('/api/packages', { params })
      setItems(res.data as PackageDto[])
    } catch (e: unknown) {
      if (isAxiosError(e)) setError(e.response?.data?.detail || 'Impossibile caricare i pacchetti')
      else setError('Impossibile caricare i pacchetti')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  useEffect(() => {
    // tutors for filter
    api.get('/api/users/tutors', { params: { limit: 100 } }).then((r) => setTutors(r.data as Tutor[])).catch(() => setTutors([]))
  }, [])

  const filtered = useMemo(() => {
    let list = (items || []).slice()
    const minP = minPrice ? parseFloat(minPrice) : undefined
    const maxP = maxPrice ? parseFloat(maxPrice) : undefined
    const minH = minHours ? parseInt(minHours) : undefined
    if (minP !== undefined) list = list.filter((p) => Number(p.price) >= minP)
    if (maxP !== undefined) list = list.filter((p) => Number(p.price) <= maxP)
    if (minH !== undefined) list = list.filter((p) => p.total_hours >= minH)
    switch (sort) {
      case 'priceAsc': list.sort((a,b)=> Number(a.price)-Number(b.price)); break
      case 'priceDesc': list.sort((a,b)=> Number(b.price)-Number(a.price)); break
      case 'hoursDesc': list.sort((a,b)=> b.total_hours-a.total_hours); break
      case 'nameAsc': list.sort((a,b)=> a.name.localeCompare(b.name)); break
      default: break
    }
    return list
  }, [items, minPrice, maxPrice, minHours, sort])

  async function handlePurchase(pkg: PackageDto) {
    router.push(`/packages/${pkg.id}`)
  }

  return (
    <section className="w-full">
      <div className="container-app section-wrap">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h1 className="text-xl font-bold text-gray-900">Pacchetti</h1>
          <div className="flex flex-wrap items-center gap-2">
            <input value={subject} onChange={(e)=> setSubject(e.target.value)} placeholder="Materia" className="h-9 w-40 rounded-md border border-gray-300 px-3 text-sm" />
            <select value={tutorId} onChange={(e)=> setTutorId(e.target.value ? Number(e.target.value) : '')} className="h-9 w-44 rounded-md border border-gray-300 px-2 text-sm">
              <option value="">Tutor</option>
              {tutors.map((t) => <option key={t.id} value={t.id}>{t.first_name || ''} {t.last_name || ''}</option>)}
            </select>
            <input value={minPrice} onChange={(e)=> setMinPrice(e.target.value)} placeholder="Prezzo min" className="h-9 w-28 rounded-md border border-gray-300 px-2 text-sm" />
            <input value={maxPrice} onChange={(e)=> setMaxPrice(e.target.value)} placeholder="Prezzo max" className="h-9 w-28 rounded-md border border-gray-300 px-2 text-sm" />
            <input value={minHours} onChange={(e)=> setMinHours(e.target.value)} placeholder="Ore min" className="h-9 w-24 rounded-md border border-gray-300 px-2 text-sm" />
            <select value={sort} onChange={(e)=> setSort(e.target.value)} className="h-9 w-40 rounded-md border border-gray-300 px-2 text-sm">
              <option value="relevance">Rilevanza</option>
              <option value="priceAsc">Prezzo ↑</option>
              <option value="priceDesc">Prezzo ↓</option>
              <option value="hoursDesc">Ore ↓</option>
              <option value="nameAsc">Nome A-Z</option>
            </select>
            <button onClick={()=> { setPage(0); fetchData() }} className="inline-flex h-9 items-center rounded-md border border-blue-200 px-3 text-sm text-blue-700 hover:bg-blue-50">Applica</button>
          </div>
        </div>

        {loading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => {
              const key = `s-${i}-${Math.random().toString(36).slice(2, 7)}`
              return <div key={key} className="h-40 rounded-xl bg-blue-50" />
            })}
          </div>
        )}
        {!loading && error && <div className="text-sm text-red-600">{error}</div>}
        {!loading && !error && filtered.length === 0 && <div className="text-sm text-blue-700">Nessun pacchetto trovato</div>}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {filtered.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} onPurchase={handlePurchase} />
            ))}
          </div>
          <div className="mt-6 flex items-center justify-between">
            <button onClick={()=> setPage((p)=> Math.max(0, p-1))} disabled={page===0} className="inline-flex h-9 items-center rounded-md border border-blue-200 px-3 text-sm text-blue-700 hover:bg-blue-50 disabled:opacity-50">← Precedente</button>
            <span className="text-xs text-gray-600">Pagina {page+1}</span>
            <button onClick={()=> setPage((p)=> p+1)} disabled={(items||[]).length < pageSize} className="inline-flex h-9 items-center rounded-md border border-blue-200 px-3 text-sm text-blue-700 hover:bg-blue-50 disabled:opacity-50">Successiva →</button>
          </div>
        )}
      </div>
    </section>
  )
}


