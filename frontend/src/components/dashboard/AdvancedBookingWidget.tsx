import { useEffect, useMemo, useState } from 'react'
import DashboardWidget from './DashboardWidget'
import { api } from '@/lib/api'
import { isAxiosError } from 'axios'

type Tutor = { id: number; user_id: number; first_name?: string; last_name?: string }
type Slot = { id: number; tutor_id: number; date: string; start_time: string; end_time: string; is_available: boolean }
type Purchase = { id: number; package_id: number; hours_remaining: number; expiry_date: string; is_active: boolean }
type Student = { id: number; user_id: number }

function formatTimeLabel(isoTime: string) {
  const d = new Date(isoTime)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

async function fetchStudent(): Promise<Student | null> {
  try {
    const s = await api.get('/api/users/me/student')
    return s.data as Student
  } catch (e) {
    if (isAxiosError(e) && e.response?.status === 404) return null
    throw e
  }
}

async function fetchTutors(): Promise<Tutor[]> {
  const t = await api.get('/api/users/tutors', { params: { limit: 50 } })
  return t.data as Tutor[]
}

export default function AdvancedBookingWidget() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [student, setStudent] = useState<Student | null>(null)
  const [tutors, setTutors] = useState<Tutor[]>([])
  const [purchases, setPurchases] = useState<Purchase[]>([])

  const [selectedTutorId, setSelectedTutorId] = useState<number | ''>('')
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10))
  const [slots, setSlots] = useState<Slot[] | null>(null)
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [slotsError, setSlotsError] = useState<string | null>(null)

  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null)
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<number | ''>('')
  const [subject, setSubject] = useState('')
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null)

  async function bootstrap() {
    setLoading(true)
    setError(null)
    try {
      const [s, t] = await Promise.all([fetchStudent(), fetchTutors()])
      setStudent(s)
      setTutors(t)
      if (s) {
        try {
          const p = await api.get('/api/packages/purchases/active')
          setPurchases(p.data as Purchase[])
        } catch (e) {
          if (!(isAxiosError(e) && e.response?.status === 404)) setError('Impossibile caricare i pacchetti attivi')
        }
      }
    } catch (e: unknown) {
      if (isAxiosError(e)) {
        const status = e.response?.status
        if (status && status >= 500) setError('Errore del server, riprova più tardi')
        else setError('Impossibile caricare i dati per la prenotazione')
      } else setError('Impossibile caricare i dati per la prenotazione')
    } finally {
      setLoading(false)
    }
  }

  async function hasStudent(): Promise<boolean> {
    try {
      const s = await fetchStudent()
      if (s) setStudent(s)
      return !!s
    } catch {
      return false
    }
  }

  async function loadSlots() {
    if (!selectedTutorId || !selectedDate) return
    setSlotsLoading(true)
    setSlotsError(null)
    setSlots(null)
    try {
      const res = await api.get('/api/slots/available', { params: { tutor_id: selectedTutorId, slot_date: selectedDate } })
      const data = res.data as Slot[]
      setSlots(data)
    } catch (e: unknown) {
      if (isAxiosError(e)) {
        const status = e.response?.status
        if (status && status >= 500) setSlotsError('Errore del server nel caricare gli slot')
        else setSlotsError('Impossibile caricare gli slot')
      } else setSlotsError('Impossibile caricare gli slot')
    } finally {
      setSlotsLoading(false)
    }
  }

  async function createBooking() {
    if (!student) {
      setError('Profilo studente non trovato')
      return
    }
    if (!selectedTutorId || !selectedPurchaseId || !selectedSlotId) {
      setError('Compila tutti i campi per prenotare')
      return
    }
    const slot = (slots || []).find((s) => s.id === selectedSlotId)
    if (!slot) {
      setError('Slot non valido')
      return
    }
    setBookingLoading(true)
    setBookingSuccess(null)
    setError(null)
    try {
      const start = new Date(slot.start_time)
      const end = new Date(slot.end_time)
      const durationHours = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60)))
      await api.post('/api/bookings', {
        student_id: student.id,
        tutor_id: selectedTutorId,
        package_purchase_id: selectedPurchaseId,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        duration_hours: durationHours,
        subject: subject || 'Lezione',
        notes: undefined,
      })
      setBookingSuccess('Prenotazione creata con successo')
      // reload slots to reflect potential availability change
      await loadSlots()
    } catch (e: unknown) {
      if (isAxiosError(e)) {
        const status = e.response?.status
        if (status === 400) setError((e.response?.data as any)?.detail || 'Dati non validi')
        else if (status === 403) setError('Permesso negato')
        else if (status && status >= 500) setError('Errore del server, riprova più tardi')
        else setError('Impossibile creare la prenotazione')
      } else setError('Impossibile creare la prenotazione')
    } finally {
      setBookingLoading(false)
    }
  }

  useEffect(() => {
    bootstrap()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // Auto load slots when tutor/date changes
    loadSlots()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTutorId, selectedDate])

  const canBook = useMemo(() => !!student && !!selectedTutorId && !!selectedPurchaseId && !!selectedSlotId, [student, selectedTutorId, selectedPurchaseId, selectedSlotId])

  return (
    <DashboardWidget title="Prenota una Lezione" action={
      <button onClick={loadSlots} className="rounded-md border border-blue-200 px-3 py-1 text-xs text-blue-700 hover:bg-blue-50">Aggiorna</button>
    }>
      {loading && (
        <div className="space-y-2">
          <div className="h-4 w-1/2 rounded bg-blue-50" />
          <div className="h-4 w-2/3 rounded bg-blue-50" />
          <div className="h-4 w-1/3 rounded bg-blue-50" />
        </div>
      )}
      {!loading && error && (
        <div className="text-sm text-red-600">{error}</div>
      )}
      {!loading && !error && !student && (
        <p className="text-sm text-blue-700">Completa il profilo studente per prenotare</p>
      )}
      {!loading && !error && student && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label htmlFor="tutor" className="mb-1 block text-sm font-medium text-gray-900">Tutor</label>
              <select id="tutor" value={selectedTutorId} onChange={(e)=> setSelectedTutorId(e.target.value ? Number(e.target.value) : '')} className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 text-sm">
                <option value="">Seleziona tutor</option>
                {tutors.map((t) => (
                  <option key={t.id} value={t.id}>{t.first_name || ''} {t.last_name || ''} (#{t.id})</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="date" className="mb-1 block text-sm font-medium text-gray-900">Data</label>
              <input id="date" type="date" value={selectedDate} onChange={(e)=> setSelectedDate(e.target.value)} className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 text-sm" />
            </div>
            <div>
              <label htmlFor="purchase" className="mb-1 block text-sm font-medium text-gray-900">Pacchetto</label>
              <select id="purchase" value={selectedPurchaseId} onChange={(e)=> setSelectedPurchaseId(e.target.value ? Number(e.target.value) : '')} className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 text-sm">
                <option value="">Seleziona pacchetto</option>
                {purchases.map((p) => (
                  <option key={p.id} value={p.id}>#{p.id} • {p.hours_remaining}h rimaste • Scade {new Date(p.expiry_date).toLocaleDateString()}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="subject" className="mb-1 block text-sm font-medium text-gray-900">Materia</label>
            <input id="subject" value={subject} onChange={(e)=> setSubject(e.target.value)} placeholder="es. Matematica" className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 text-sm" />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-gray-900">Slot disponibili</p>
            {slotsLoading && (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => {
                  const key = `s-${i}`
                  return <div key={key} className="h-9 rounded-md bg-blue-50" />
                })}
              </div>
            )}
            {!slotsLoading && slotsError && (
              <div className="text-sm text-red-600">{slotsError}</div>
            )}
            {!slotsLoading && !slotsError && slots && slots.length === 0 && (
              <p className="text-sm text-blue-700">Nessuno slot disponibile per i criteri selezionati</p>
            )}
            {!slotsLoading && !slotsError && slots && slots.length > 0 && (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {slots.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedSlotId(s.id)}
                    className={
                      `h-9 rounded-md border px-2 text-sm ${selectedSlotId === s.id ? 'border-primary bg-primary-50 text-blue-800' : 'border-blue-200 text-blue-800 hover:bg-blue-50'}`
                    }
                  >
                    {formatTimeLabel(s.start_time)} - {formatTimeLabel(s.end_time)}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="pt-1">
            <button disabled={!canBook || bookingLoading} onClick={createBooking} className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-white hover:bg-primary-600 disabled:opacity-50">
              {bookingLoading ? 'Prenotazione...' : 'Conferma prenotazione'}
            </button>
            {bookingSuccess && <span className="ml-3 text-sm text-green-700">{bookingSuccess}</span>}
          </div>
        </div>
      )}
    </DashboardWidget>
  )
}


