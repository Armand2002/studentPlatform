import { useCallback, useEffect, useMemo, useState } from 'react'
import DashboardWidget from './DashboardWidget'
import { api } from '@/lib/api'
import { isAxiosError } from 'axios'

type Tutor = { id: number; user_id: number; first_name?: string; last_name?: string }
type Slot = { id: number; tutor_id: number; date: string; start_time: string; end_time: string; is_available: boolean }
type Purchase = { id: number; package_id: number; hours_remaining: number; expiry_date: string; is_active: boolean }
type Student = { id: number; user_id: number }
type Booking = { id: number; student_id: number; tutor_id: number; start_time: string; end_time: string; status?: string }

function startOfWeek(date: Date) {
  const d = new Date(date)
  const day = d.getDay() // 0 Sun - 6 Sat
  const diff = (day === 0 ? -6 : 1) - day // make Monday first day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
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

function timeLabel(iso: string) {
  const t = new Date(iso)
  return t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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

export default function WeeklyCalendarWidget() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [student, setStudent] = useState<Student | null>(null)
  const [tutors, setTutors] = useState<Tutor[]>([])
  const [purchases, setPurchases] = useState<Purchase[]>([])

  const [selectedTutorId, setSelectedTutorId] = useState<number | ''>('')
  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek(new Date()))
  const [weekSlots, setWeekSlots] = useState<Record<string, Slot[]>>({})
  const [weekLoading, setWeekLoading] = useState(false)
  const [weekError, setWeekError] = useState<string | null>(null)

  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<number | ''>('')
  const [subject, setSubject] = useState('')
  const [recurrenceWeeks, setRecurrenceWeeks] = useState<number>(1)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])

  const days = useMemo(() => Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i)), [weekStart])

  const headerLabel = useMemo(() => {
    const end = addDays(weekStart, 6)
    return `${weekStart.toLocaleDateString()} - ${end.toLocaleDateString()}`
  }, [weekStart])

  const loadBootstrap = useCallback(async () => {
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
    } catch (e) {
      setError('Impossibile inizializzare il calendario')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadWeek = useCallback(async () => {
    if (!selectedTutorId) return
    setWeekLoading(true)
    setWeekError(null)
    setWeekSlots({})
    try {
      const promises = days.map((d) => api.get('/api/slots/available', { params: { tutor_id: selectedTutorId, slot_date: toDateInputValue(d) } }))
      const res = await Promise.allSettled(promises)
      const map: Record<string, Slot[]> = {}
      res.forEach((r, idx) => {
        const key = toDateInputValue(days[idx])
        if (r.status === 'fulfilled') map[key] = (r.value.data as Slot[])
        else map[key] = []
      })
      setWeekSlots(map)
    } catch (e) {
      setWeekError('Impossibile caricare gli slot della settimana')
    } finally {
      setWeekLoading(false)
    }
  }, [days, selectedTutorId])

  const loadBookings = useCallback(async () => {
    try {
      const res = await api.get('/api/bookings/upcoming', { params: { limit: 500 } })
      const list = (res.data as Booking[]) || []
      const ws = startOfWeek(weekStart)
      const we = addDays(ws, 7)
      const wst = ws.getTime()
      const wet = we.getTime()
      const inRange = list.filter((b) => {
        const bs = new Date(b.start_time).getTime()
        const be = new Date(b.end_time).getTime()
        return (bs >= wst && bs < wet) || (be > wst && be <= wet)
      })
      setBookings(inRange)
    } catch {
      setBookings([])
    }
  }, [weekStart])

  async function createBooking() {
    if (!student) return
    if (!selectedSlot || !selectedPurchaseId) return
    setBookingLoading(true)
    setBookingSuccess(null)
    try {
      const start0 = new Date(selectedSlot.start_time)
      const end0 = new Date(selectedSlot.end_time)
      const durationHours0 = Math.max(1, Math.round((end0.getTime() - start0.getTime()) / (1000 * 60 * 60)))
      let ok = 0
      const total = recurrenceWeeks || 1
      for (let k = 0; k < total; k += 1) {
        const start = new Date(start0)
        const end = new Date(end0)
        start.setDate(start.getDate() + 7 * k)
        end.setDate(end.getDate() + 7 * k)
        try {
          await api.post('/api/bookings', {
            student_id: student.id,
            tutor_id: selectedSlot.tutor_id,
            package_purchase_id: selectedPurchaseId,
            start_time: start.toISOString(),
            end_time: end.toISOString(),
            duration_hours: durationHours0,
            subject: subject || 'Lezione',
          })
          ok += 1
        } catch {
          // continue
        }
      }
      setBookingSuccess(`Prenotazioni create: ${ok}/${total}`)
      await Promise.all([loadWeek(), loadBookings()])
      setSelectedSlot(null)
      setSubject('')
    } catch (e) {
      setBookingSuccess(null)
    } finally {
      setBookingLoading(false)
    }
  }

  useEffect(() => {
    loadBootstrap()
  }, [loadBootstrap])

  useEffect(() => {
    loadWeek()
  }, [loadWeek])

  useEffect(() => {
    loadBookings()
  }, [loadBookings])

  function overlaps(aStartIso: string, aEndIso: string, bStartIso: string, bEndIso: string) {
    const aStart = new Date(aStartIso).getTime()
    const aEnd = new Date(aEndIso).getTime()
    const bStart = new Date(bStartIso).getTime()
    const bEnd = new Date(bEndIso).getTime()
    return aStart < bEnd && bStart < aEnd
  }

  const conflictingSlotId = useMemo(() => {
    if (!selectedSlot) return null
    const has = bookings.some((b) => overlaps(selectedSlot.start_time, selectedSlot.end_time, b.start_time, b.end_time))
    return has ? selectedSlot.id : null
  }, [bookings, selectedSlot])

  const suggestedSlots = useMemo(() => {
    const list: Slot[] = []
    Object.values(weekSlots).forEach((arr) => arr && arr.forEach((s) => list.push(s)))
    return list.filter((s) => !bookings.some((b) => overlaps(s.start_time, s.end_time, b.start_time, b.end_time))).slice(0, 3)
  }, [weekSlots, bookings])

  const canBook = !!student && !!selectedSlot && !!selectedPurchaseId && !conflictingSlotId

  return (
    <DashboardWidget title="Calendario Settimanale" action={
      <div className="flex items-center gap-2">
        <button onClick={() => setWeekStart(addDays(weekStart, -7))} className="rounded-md border border-blue-200 px-2 py-1 text-xs text-blue-700 hover:bg-blue-50">← Settimana</button>
        <span className="text-xs text-gray-600">{headerLabel}</span>
        <button onClick={() => setWeekStart(addDays(weekStart, 7))} className="rounded-md border border-blue-200 px-2 py-1 text-xs text-blue-700 hover:bg-blue-50">Settimana →</button>
      </div>
    }>
      {loading && (
        <div className="space-y-2">
          <div className="h-4 w-1/2 rounded bg-blue-50" />
          <div className="h-4 w-2/3 rounded bg-blue-50" />
        </div>
      )}
      {!loading && error && <div className="text-sm text-red-600">{error}</div>}
      {!loading && !error && weekError && <div className="text-sm text-red-600">{weekError}</div>}
      {!loading && !error && !student && (
        <p className="text-sm text-blue-700">Completa il profilo studente per usare il calendario</p>
      )}
      {!loading && !error && student && (
        <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label id="tutor-label" htmlFor="tutor" className="mb-1 block text-sm font-medium text-gray-900">Tutor</label>
              <select aria-labelledby="tutor-label" id="tutor" value={selectedTutorId} onChange={(e)=> setSelectedTutorId(e.target.value ? Number(e.target.value) : '')} className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 text-sm">
                <option value="">Seleziona tutor</option>
                {tutors.map((t) => (
                  <option key={t.id} value={t.id}>{t.first_name || ''} {t.last_name || ''} (#{t.id})</option>
                ))}
              </select>
            </div>
            <div>
              <label id="week-label" htmlFor="week" className="mb-1 block text-sm font-medium text-gray-900">Settimana</label>
              <input id="week" aria-labelledby="week-label" type="date" value={toDateInputValue(weekStart)} onChange={(e)=> setWeekStart(startOfWeek(new Date(e.target.value)))} className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 text-sm" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[720px] grid grid-cols-7 gap-2">
              {days.map((d) => {
                const key = toDateInputValue(d)
                const slots = weekSlots[key] || []
                return (
                  <div key={key} className="rounded-lg border bg-white p-2">
                    <div className="mb-2 text-xs font-semibold text-gray-700">{d.toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: '2-digit' })}</div>
                    {weekLoading && <div className="h-8 w-full rounded bg-blue-50" />}
                    {!weekLoading && slots.length === 0 && <div className="text-xs text-blue-700">Nessuno slot</div>}
                    {!weekLoading && slots.length > 0 && (
                      <div className="flex flex-col gap-1">
                        {slots.map((s) => {
                          const isConflict = bookings.some((b) => overlaps(s.start_time, s.end_time, b.start_time, b.end_time))
                          const isSelected = selectedSlot?.id === s.id
                          const cls = isConflict
                            ? 'border-red-300 text-red-700 line-through cursor-not-allowed'
                            : isSelected
                              ? 'border-primary bg-primary-50 text-blue-800'
                              : 'border-blue-200 text-blue-800 hover:bg-blue-50'
                          return (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => setSelectedSlot(s)}
                              disabled={isConflict}
                              className={`h-8 rounded border px-2 text-xs ${cls}`}
                            >
                              {timeLabel(s.start_time)} - {timeLabel(s.end_time)}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {selectedSlot && (
            <div className="rounded-lg border bg-blue-50 p-3">
              <div className="mb-2 text-sm font-medium text-gray-900">Conferma prenotazione</div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                <div>
                  <label id="purchase-label" htmlFor="purchase" className="mb-1 block text-xs text-gray-700">Pacchetto</label>
                  <select id="purchase" aria-labelledby="purchase-label" value={selectedPurchaseId} onChange={(e)=> setSelectedPurchaseId(e.target.value ? Number(e.target.value) : '')} className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 text-sm">
                    <option value="">Seleziona pacchetto</option>
                    {purchases.map((p) => (
                      <option key={p.id} value={p.id}>#{p.id} • {p.hours_remaining}h • Scade {new Date(p.expiry_date).toLocaleDateString()}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label id="subject-label" htmlFor="subject-input" className="mb-1 block text-xs text-gray-700">Materia</label>
                  <input id="subject-input" aria-labelledby="subject-label" value={subject} onChange={(e)=> setSubject(e.target.value)} placeholder="es. Matematica" className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 text-sm" />
                </div>
                <div>
                  <label id="recurrence-label" htmlFor="recurrence" className="mb-1 block text-xs text-gray-700">Ricorrenza</label>
                  <select id="recurrence" aria-labelledby="recurrence-label" value={recurrenceWeeks} onChange={(e)=> setRecurrenceWeeks(Number(e.target.value))} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
                    <option value={1}>Singola</option>
                    <option value={4}>4 settimane</option>
                    <option value={8}>8 settimane</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button disabled={!canBook || bookingLoading} onClick={createBooking} className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-white hover:bg-primary-600 disabled:opacity-50">
                    {bookingLoading ? 'Prenotazione…' : conflictingSlotId ? 'Conflitto' : 'Conferma'}
                  </button>
                </div>
              </div>
              {bookingSuccess && <div className="mt-2 text-xs text-green-700">{bookingSuccess}</div>}
              {conflictingSlotId && suggestedSlots.length > 0 && (
                <div className="mt-2 text-xs text-gray-700">
                  Suggerimenti: {suggestedSlots.map((s) => (
                    <button key={s.id} type="button" onClick={() => setSelectedSlot(s)} className="underline text-blue-700 hover:text-blue-900 mr-2">
                      {timeLabel(s.start_time)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </DashboardWidget>
  )
}


