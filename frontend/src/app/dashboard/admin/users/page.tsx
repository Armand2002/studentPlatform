"use client"
import RequireAuth from '@/components/auth/RequireAuth'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { useEffect, useMemo, useState } from 'react'

type Tutor = { id: number; first_name?: string; last_name?: string; user_id: number }
type Student = { id: number; first_name?: string; last_name?: string; user_id: number }
type User = { id: number; is_active: boolean }

export default function AdminUsersListPage() {
  const { user } = useAuth()
  const [role, setRole] = useState<'tutors' | 'students'>('tutors')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(0)
  const pageSize = 20
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<Array<Tutor | Student>>([])
  const [minUserId, setMinUserId] = useState<string>('')
  const [maxUserId, setMaxUserId] = useState<string>('')

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const params = { skip: page * pageSize, limit: pageSize }
      const url = role === 'tutors' ? '/api/users/tutors' : '/api/users/students'
      const res = await api.get(url, { params })
      setItems(res.data as Array<Tutor | Student>)
    } catch {
      setError('Impossibile caricare gli utenti')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [role, page])

  const filtered = useMemo(() => {
    let list = items
    if (query) {
      const q = query.toLowerCase()
      list = list.filter((u: any) => `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase().includes(q))
    }
    const min = minUserId ? parseInt(minUserId) : undefined
    const max = maxUserId ? parseInt(maxUserId) : undefined
    if (min !== undefined) list = list.filter((u: any) => u.user_id >= min)
    if (max !== undefined) list = list.filter((u: any) => u.user_id <= max)
    return list
  }, [items, query, minUserId, maxUserId])

  function exportCsv() {
    const header = ['id', 'first_name', 'last_name', 'user_id']
    const rows = (filtered as any[]).map((u) => [u.id, u.first_name || '', u.last_name || '', u.user_id])
    const csv = [header.join(','), ...rows.map((r) => r.map((v) => `"${String(v).replaceAll('"','""')}"`).join(','))].join('\r\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${role}-page${page+1}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <RequireAuth>
      {user?.role === 'admin' ? (
        <div className="container-app space-y-4">
          <div>
            <h1 className="text-2xl font-semibold text-blue-900">Utenti</h1>
            <p className="text-blue-600">Gestione elenco con paginazione e filtri.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select value={role} onChange={(e)=> { setPage(0); setRole(e.target.value as 'tutors' | 'students') }} className="h-9 rounded-md border border-gray-300 px-2 text-sm">
              <option value="tutors">Tutors</option>
              <option value="students">Students</option>
            </select>
            <input value={query} onChange={(e)=> setQuery(e.target.value)} placeholder="Cerca nome" className="h-9 w-52 rounded-md border border-gray-300 px-3 text-sm" />
            <input value={minUserId} onChange={(e)=> setMinUserId(e.target.value)} placeholder="User ID min" className="h-9 w-32 rounded-md border border-gray-300 px-2 text-sm" />
            <input value={maxUserId} onChange={(e)=> setMaxUserId(e.target.value)} placeholder="User ID max" className="h-9 w-32 rounded-md border border-gray-300 px-2 text-sm" />
            <button onClick={()=> { setPage(0); load() }} className="inline-flex h-9 items-center rounded-md border border-blue-200 px-3 text-sm text-blue-700 hover:bg-blue-50">Aggiorna</button>
            <button onClick={exportCsv} className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm text-white hover:bg-primary-600">Export CSV</button>
          </div>

          {loading && <div className="h-10 w-full rounded bg-blue-50" />}
          {!loading && error && <div className="text-sm text-red-600">{error}</div>}
          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="min-w-[720px] w-full table-auto border-collapse">
                <thead>
                  <tr className="border-b bg-gray-50 text-left text-xs text-gray-600">
                    <th className="px-3 py-2">ID</th>
                    <th className="px-3 py-2">Nome</th>
                    <th className="px-3 py-2">User ID</th>
                    <th className="px-3 py-2">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u: any) => (
                    <tr key={`${role}-${u.id}`} className="border-b text-sm text-gray-800">
                      <td className="px-3 py-2">{u.id}</td>
                      <td className="px-3 py-2">{u.first_name || ''} {u.last_name || ''}</td>
                      <td className="px-3 py-2">{u.user_id}</td>
                      <td className="px-3 py-2">
                        <button className="mr-3 text-blue-700 hover:underline">Dettagli</button>
                        <button
                          onClick={async ()=> {
                            try {
                              const userId = (u as any).user_id
                              await api.put(`/api/users/${userId}`, { is_active: true })
                              await load()
                            } catch {}
                          }}
                          className="mr-2 text-green-700 hover:underline"
                        >Attiva</button>
                        <button
                          onClick={async ()=> {
                            try {
                              const userId = (u as any).user_id
                              await api.put(`/api/users/${userId}`, { is_active: false })
                              await load()
                            } catch {}
                          }}
                          className="mr-4 text-red-700 hover:underline"
                        >Disattiva</button>
                        <button
                          onClick={async ()=> {
                            try {
                              const userId = (u as any).user_id
                              await api.put(`/api/users/${userId}`, { is_verified: true })
                              await load()
                            } catch {}
                          }}
                          className="mr-2 text-emerald-700 hover:underline"
                        >Verifica</button>
                        <button
                          onClick={async ()=> {
                            try {
                              const userId = (u as any).user_id
                              await api.put(`/api/users/${userId}`, { is_verified: false })
                              await load()
                            } catch {}
                          }}
                          className="text-amber-700 hover:underline"
                        >Rimuovi verifica</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-4 flex items-center justify-between">
                <button onClick={()=> setPage((p)=> Math.max(0, p-1))} disabled={page===0} className="inline-flex h-9 items-center rounded-md border border-blue-200 px-3 text-sm text-blue-700 hover:bg-blue-50 disabled:opacity-50">← Precedente</button>
                <span className="text-xs text-gray-600">Pagina {page+1}</span>
                <button onClick={()=> setPage((p)=> p+1)} disabled={items.length < pageSize} className="inline-flex h-9 items-center rounded-md border border-blue-200 px-3 text-sm text-blue-700 hover:bg-blue-50 disabled:opacity-50">Successiva →</button>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </RequireAuth>
  )
}


