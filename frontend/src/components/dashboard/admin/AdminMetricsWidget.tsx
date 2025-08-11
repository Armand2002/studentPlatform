import DashboardWidget from '../../dashboard/DashboardWidget'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

type Tutor = { id: number }
type Student = { id: number }
type PackageDto = { id: number }

export default function AdminMetricsWidget() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tutors, setTutors] = useState(0)
  const [students, setStudents] = useState(0)
  const [packages, setPackages] = useState(0)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const [t, s, p] = await Promise.all([
        api.get('/api/users/tutors', { params: { limit: 1000 } }),
        api.get('/api/users/students', { params: { limit: 1000 } }),
        api.get('/api/packages', { params: { limit: 1000 } }),
      ])
      setTutors((t.data as Tutor[]).length)
      setStudents((s.data as Student[]).length)
      setPackages((p.data as PackageDto[]).length)
    } catch {
      setError('Impossibile caricare le metriche')
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  return (
    <DashboardWidget title="Metriche Principali">
      {loading && <div className="h-8 w-1/2 rounded bg-blue-50" />}
      {!loading && error && <div className="text-sm text-red-600">{error}</div>}
      {!loading && !error && (
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="rounded-lg border bg-white p-3">
            <div className="text-xs text-gray-500">Tutors</div>
            <div className="text-lg font-semibold text-gray-900">{tutors}</div>
          </div>
          <div className="rounded-lg border bg-white p-3">
            <div className="text-xs text-gray-500">Students</div>
            <div className="text-lg font-semibold text-gray-900">{students}</div>
          </div>
          <div className="rounded-lg border bg-white p-3">
            <div className="text-xs text-gray-500">Packages</div>
            <div className="text-lg font-semibold text-gray-900">{packages}</div>
          </div>
        </div>
      )}
    </DashboardWidget>
  )
}


