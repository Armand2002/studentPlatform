import DashboardWidget from '../DashboardWidget'
import { useCallback, useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { isAxiosError } from 'axios'

type FileItem = { id: number; original_filename: string; subject: string; description?: string | null }

export default function MaterialsWidget() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<FileItem[]>([])
  const [subject, setSubject] = useState('')
  const [uploading, setUploading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/api/files', { params: subject ? { subject } : undefined })
      setItems(res.data as FileItem[])
    } catch (e) {
      if (isAxiosError(e) && e.response?.status === 404) {
        setItems([])
        setError(null)
      } else {
        setError('Impossibile caricare i materiali')
      }
    } finally { setLoading(false) }
  }, [subject])

  useEffect(() => { load() }, [load])

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('subject', subject || 'Generale')
      form.append('description', '')
      form.append('is_public', 'false')
      await api.post('/api/files/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      await load()
    } finally { setUploading(false) }
  }

  return (
    <DashboardWidget title="Materiali" action={
      <div className="flex items-center gap-2">
        <input value={subject} onChange={(e)=> setSubject(e.target.value)} placeholder="Materia" className="h-8 w-36 rounded-md border border-gray-300 px-2 text-xs" />
        <button onClick={load} className="inline-flex h-8 items-center rounded-md border border-blue-200 px-2 text-xs text-blue-700 hover:bg-blue-50">Filtra</button>
        <label className="inline-flex h-8 cursor-pointer items-center rounded-md bg-primary px-2 text-xs text-white hover:bg-primary-600">
          {uploading ? 'Caricamento…' : 'Carica'}
          <input type="file" className="hidden" onChange={onUpload} />
        </label>
      </div>
    }>
      {loading && <div className="h-8 w-1/2 rounded bg-blue-50" />}
      {!loading && error && <div className="text-sm text-red-600">{error}</div>}
      {!loading && !error && items.length === 0 && <div className="text-sm text-blue-700">Nessun materiale</div>}
      {!loading && !error && items.length > 0 && (
        <ul className="space-y-2 text-sm text-gray-800">
          {items.map((f) => (
            <li key={f.id} className="flex items-center justify-between">
              <span className="truncate">{f.original_filename}</span>
              <div className="flex items-center gap-3">
                <a href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/files/${f.id}/download`} className="text-blue-700 underline">Scarica</a>
                <button onClick={async ()=> { await api.delete(`/api/files/${f.id}`); await load() }} className="text-red-600 hover:underline">Elimina</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </DashboardWidget>
  )
}


