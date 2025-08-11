import DashboardWidget from '../../dashboard/DashboardWidget'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

type Tutor = { id: number; first_name?: string; last_name?: string }
type Student = { id: number; first_name?: string; last_name?: string }

export default function AdminUsersWidget() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tutors, setTutors] = useState<Tutor[]>([])
  const [students, setStudents] = useState<Student[]>([])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const [t, s] = await Promise.all([
        api.get('/api/users/tutors', { params: { limit: 100 } }),
        api.get('/api/users/students', { params: { limit: 100 } }),
      ])
      setTutors((t.data as Tutor[]) || [])
      setStudents((s.data as Student[]) || [])
    } catch {
      setError('Impossibile caricare gli utenti')
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  return (
    <DashboardWidget title="Utenti (ultimi 100)">
      {loading && <div className="h-8 w-1/2 rounded bg-blue-50" />}
      {!loading && error && <div className="text-sm text-red-600">{error}</div>}
      {!loading && !error && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <div className="mb-1 text-xs font-semibold text-gray-700">Tutors ({tutors.length})</div>
            <ul className="space-y-1 text-sm text-gray-800">
              {tutors.slice(0, 8).map((u) => <li key={u.id}>{u.first_name || ''} {u.last_name || ''}</li>)}
            </ul>
          </div>
          <div>
            <div className="mb-1 text-xs font-semibold text-gray-700">Students ({students.length})</div>
            <ul className="space-y-1 text-sm text-gray-800">
              {students.slice(0, 8).map((u) => <li key={u.id}>{u.first_name || ''} {u.last_name || ''}</li>)}
            </ul>
          </div>
        </div>
      )}
    </DashboardWidget>
  )
}


