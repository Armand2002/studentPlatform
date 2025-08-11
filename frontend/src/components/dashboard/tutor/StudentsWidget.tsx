import DashboardWidget from '../DashboardWidget'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { isAxiosError } from 'axios'

type Student = { id: number; first_name?: string; last_name?: string; user_id: number }

export default function StudentsWidget() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [students, setStudents] = useState<Student[]>([])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      // Non esiste endpoint "i miei studenti"; come placeholder mostriamo ultimi 5 completati e inferiamo studenti unici
      const res = await api.get('/api/bookings/completed', { params: { limit: 100 } })
      const unique = new Map<number, Student>()
      const bookings = res.data as any[]
      bookings.forEach((b) => {
        if (b.student) unique.set(b.student.id, { id: b.student.id, first_name: b.student.first_name, last_name: b.student.last_name, user_id: b.student.user_id })
      })
      setStudents(Array.from(unique.values()).slice(0, 5))
    } catch (e) {
      if (isAxiosError(e) && e.response?.status === 404) {
        setStudents([])
        setError(null)
      } else {
        setError('Impossibile caricare gli studenti')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <DashboardWidget title="Studenti Recenti">
      {loading && <div className="h-8 w-1/2 rounded bg-blue-50" />}
      {!loading && error && <div className="text-sm text-red-600">{error}</div>}
      {!loading && !error && students.length === 0 && <div className="text-sm text-blue-700">Nessuno studente</div>}
      {!loading && !error && students.length > 0 && (
        <ul className="space-y-2 text-sm text-gray-800">
          {students.map((s) => <li key={s.id}>{s.first_name || ''} {s.last_name || ''}</li>)}
        </ul>
      )}
    </DashboardWidget>
  )}


