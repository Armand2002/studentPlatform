import { useCallback, useEffect, useMemo, useState } from 'react'
import DashboardWidget from './DashboardWidget'
import { api } from '@/lib/api'

type Tutor = { id: number; user_id: number; first_name?: string; last_name?: string }
type Slot = { id: number; tutor_id: number; date: string; start_time: string; end_time: string; is_available: boolean }
type Purchase = { id: number; package_id: number; hours_remaining: number; expiry_date: string; is_active: boolean }
type Student = { id: number; user_id: number }

function startOfMonth(date: Date) {
  const d = new Date(date)
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d
}

function addMonths(date: Date, months: number) {
  const d = new Date(date)
  d.setMonth(d.getMonth() + months)
  return d
}

function addDays(date: Date, days: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function toDateInputValue(d: Date) {
  return d.toISOString().slice(0, 10)
}

function monthGrid(date: Date) {
  // Monday-first grid of 6 weeks (42 cells)
  const first = startOfMonth(date)
  const weekday = (first.getDay() + 6) % 7 // 0=Mon
  const start = addDays(first, -weekday)
  return Array.from({ length: 42 }).map((_, i) => addDays(start, i))
}

function formatTimeLabel(isoTime: string) {
  const d = new Date(isoTime)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function downloadIcs(filename: string, title: string, startIso: string, endIso: string) {
  const dt = (iso: string) => iso.replace(/[-:]/g, '').split('.')[0] + 'Z'
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Student Platform//Booking//EN',
    'BEGIN:VEVENT',
    `UID:${crypto.randomUUID()}@student-platform`,
    `DTSTAMP:${dt(new Date().toISOString())}`,
    `DTSTART:${dt(startIso)}`,
    `DTEND:${dt(endIso)}`,
    `SUMMARY:${title}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function MonthlyCalendarWidget() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [student, setStudent] = useState<Student | null>(null)
  const [tutors, setTutors] = useState<Tutor[]>([])
  const [purchases, setPurchases] = useState<Purchase[]>([])

  const [month, setMonth] = useState<Date>(() => startOfMonth(new Date()))
  const [selectedTutorId, setSelectedTutorId] = useState<number | ''>('')
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [daySlots, setDaySlots] = useState<Slot[] | null>(null)
  const [dayLoading, setDayLoading] = useState(false)
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null)
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<number | ''>('')
  const [subject, setSubject] = useState('')
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null)

  const days = useMemo(() => monthGrid(month), [month])
  const monthLabel = useMemo(() => month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }), [month])

  const loadBootstrap = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [me, t] = await Promise.all([
        api.get('/api/users/me/student').catch(() => null),
        api.get('/api/users/tutors', { params: { limit: 50 } }),
      ])
      if (me?.data) setStudent(me.data as Student)
      setTutors((t.data as Tutor[]) || [])
      if (me?.data) {
        const p = await api.get('/api/packages/purchases/active').catch(() => null)
        if (p?.data) setPurchases(p.data as Purchase[])
      }
    } catch {
      setError('Impossibile caricare calendario mensile')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadDaySlots = useCallback(async () => {
    if (!selectedTutorId || !selectedDate) return
    setDayLoading(true)
    setDaySlots(null)
    try {
      const res = await api.get('/api/slots/available', { params: { tutor_id: selectedTutorId, slot_date: selectedDate } })
      setDaySlots(res.data as Slot[])
    } catch {
      setDaySlots([])
    } finally {
      setDayLoading(false)
    }
  }, [selectedTutorId, selectedDate])

  async function createBooking() {
    if (!student || !selectedSlotId || !selectedPurchaseId || !daySlots) return
    const slot = daySlots.find((s) => s.id === selectedSlotId)
    if (!slot) return
    setBookingLoading(true)
    setBookingSuccess(null)
    try {
      const start = new Date(slot.start_time)
      const end = new Date(slot.end_time)
      const durationHours = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60)))
      await api.post('/api/bookings', {
        student_id: student.id,
        tutor_id: slot.tutor_id,
        package_purchase_id: selectedPurchaseId,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        duration_hours: durationHours,
        subject: subject || 'Lezione',
      })
      setBookingSuccess('Prenotazione creata')
      // Offer ICS
      downloadIcs('lezione.ics', subject || 'Lezione', start.toISOString(), end.toISOString())
      await loadDaySlots()
      setSelectedSlotId(null)
      setSubject('')
    } finally {
      setBookingLoading(false)
    }
  }

  useEffect(() => {
    loadBootstrap()
  }, [loadBootstrap])

  useEffect(() => {
    loadDaySlots()
  }, [loadDaySlots])

  return (
    <DashboardWidget title="Calendario Mensile" action={
      <div className="flex items-center gap-2">
        <button onClick={() => setMonth(addMonths(month, -1))} className="rounded-md border border-blue-200 px-2 py-1 text-xs text-blue-700 hover:bg-blue-50">← Mese</button>
        <span className="text-xs text-gray-600">{monthLabel}</span>
        <button onClick={() => setMonth(addMonths(month, 1))} className="rounded-md border border-blue-200 px-2 py-1 text-xs text-blue-700 hover:bg-blue-50">Mese →</button>
      </div>
    }>
      {loading && (
        <div className="space-y-2">
          <div className="h-4 w-1/2 rounded bg-blue-50" />
          <div className="h-4 w-2/3 rounded bg-blue-50" />
        </div>
      )}
      {!loading && error && <div className="text-sm text-red-600">{error}</div>}
      {!loading && !error && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label id="tutor-month-label" htmlFor="tutor-month" className="mb-1 block text-sm font-medium text-gray-900">Tutor</label>
              <select id="tutor-month" aria-labelledby="tutor-month-label" value={selectedTutorId} onChange={(e)=> setSelectedTutorId(e.target.value ? Number(e.target.value) : '')} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
                <option value="">Seleziona tutor</option>
                {tutors.map((t) => (
                  <option key={t.id} value={t.id}>{t.first_name || ''} {t.last_name || ''} (#{t.id})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[720px]">
              <div className="grid grid-cols-7 gap-2 text-xs font-medium text-gray-600">
                {['Lun','Mar','Mer','Gio','Ven','Sab','Dom'].map((d) => <div key={d} className="px-2 py-1">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {days.map((d) => {
                  const inMonth = d.getMonth() === month.getMonth()
                  const key = toDateInputValue(d)
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedDate(key)}
                      className={`h-20 rounded-lg border px-2 text-left ${inMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'} ${selectedDate === key ? 'ring-2 ring-primary-400' : ''}`}
                    >
                      <div className="text-xs font-semibold text-gray-700">{d.getDate()}</div>
                      <div className="mt-1 text-[11px] text-gray-500">{inMonth ? ' ' : ''}</div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {selectedDate && (
            <div className="rounded-lg border bg-blue-50 p-3">
              <div className="mb-2 text-sm font-medium text-gray-900">{new Date(selectedDate).toLocaleDateString()}</div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  {dayLoading && <div className="h-10 w-full rounded bg-blue-100" />}
                  {!dayLoading && daySlots && daySlots.length === 0 && <div className="text-xs text-blue-700">Nessuno slot disponibile</div>}
                  {!dayLoading && daySlots && daySlots.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {daySlots.map((s) => (
                        <button key={s.id} type="button" onClick={() => setSelectedSlotId(s.id)} className={`h-8 rounded border px-2 text-xs ${selectedSlotId === s.id ? 'border-primary bg-primary-50 text-blue-800' : 'border-blue-200 text-blue-800 hover:bg-blue-50'}`}>
                          {formatTimeLabel(s.start_time)} - {formatTimeLabel(s.end_time)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label id="purchase-month-label" htmlFor="purchase-month" className="mb-1 block text-xs text-gray-700">Pacchetto</label>
                  <select id="purchase-month" aria-labelledby="purchase-month-label" value={selectedPurchaseId} onChange={(e)=> setSelectedPurchaseId(e.target.value ? Number(e.target.value) : '')} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
                    <option value="">Seleziona</option>
                    {purchases.map((p) => (
                      <option key={p.id} value={p.id}>#{p.id} • {p.hours_remaining}h</option>
                    ))}
                  </select>
                  <label id="subject-month-label" htmlFor="subject-month" className="mt-2 mb-1 block text-xs text-gray-700">Materia</label>
                  <input id="subject-month" aria-labelledby="subject-month-label" value={subject} onChange={(e)=> setSubject(e.target.value)} placeholder="es. Matematica" className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
                  <button disabled={!student || !selectedSlotId || !selectedPurchaseId || bookingLoading} onClick={createBooking} className="mt-3 inline-flex h-9 w-full items-center justify-center rounded-md bg-primary px-3 text-white hover:bg-primary-600 disabled:opacity-50">
                    {bookingLoading ? 'Prenotazione…' : 'Prenota'}
                  </button>
                  {bookingSuccess && <div className="mt-2 text-[11px] text-green-700">{bookingSuccess}</div>}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardWidget>
  )
}


