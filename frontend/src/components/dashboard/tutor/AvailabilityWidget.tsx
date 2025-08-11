import DashboardWidget from '../DashboardWidget'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { api, createTutorProfileSelf } from '@/lib/api'
import { isAxiosError } from 'axios'

type Tutor = { id: number; user_id: number }
type Slot = { id: number; date: string; start_time: string; end_time: string; is_available: boolean }

function toDateInputValue(d: Date) { return d.toISOString().slice(0,10) }

export default function AvailabilityWidget() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tutor, setTutor] = useState<Tutor | null>(null)
  const [needsProfile, setNeedsProfile] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [hourlyRate, setHourlyRate] = useState<number>(20)
  const [subjects, setSubjects] = useState('')
  const [date, setDate] = useState<string>(toDateInputValue(new Date()))
  const [slots, setSlots] = useState<Slot[]>([])
  const [saving, setSaving] = useState(false)
  const [rangeStart, setRangeStart] = useState<string>(toDateInputValue(new Date()))
  const [rangeEnd, setRangeEnd] = useState<string>(toDateInputValue(new Date()))
  const [timeStart, setTimeStart] = useState<string>('09:00')
  const [timeEnd, setTimeEnd] = useState<string>('10:00')
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([1,2,3,4,5]) // Mon-Fri

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const me = await api.get('/api/users/me/tutor')
      setTutor(me.data as Tutor)
      setNeedsProfile(false)
      const res = await api.get('/api/slots', { params: { slot_date: date } })
      setSlots(res.data as Slot[])
    } catch (e) {
      if (isAxiosError(e) && e.response?.status === 404) {
        setNeedsProfile(true)
        setError(null)
        setTutor(null)
        setSlots([])
      } else {
        setError('Impossibile caricare disponibilità')
      }
    } finally {
      setLoading(false)
    }
  }, [date])

  useEffect(() => { load() }, [load])

  async function addSlot() {
    if (!tutor) return
    setSaving(true)
    try {
      const start = '09:00:00'
      const end = '10:00:00'
      await api.post('/api/slots', { tutor_id: tutor.id, date, start_time: start, end_time: end })
      await load()
    } finally { setSaving(false) }
  }

  async function addSlotsRange() {
    if (!tutor) return
    setSaving(true)
    try {
      const payload = {
        tutor_id: tutor.id,
        start_date: rangeStart,
        end_date: rangeEnd,
        start_time: `${timeStart}:00`,
        end_time: `${timeEnd}:00`,
        days_of_week: daysOfWeek,
      }
      await api.post('/api/slots/multiple', payload)
      await load()
    } finally { setSaving(false) }
  }

  async function deleteSlot(slotId: number) {
    setSaving(true)
    try {
      await api.delete(`/api/slots/${slotId}`)
      await load()
    } finally { setSaving(false) }
  }

  const dayLabel = useMemo(() => new Date(date).toLocaleDateString(), [date])

  return (
    <DashboardWidget title="Disponibilità Giornaliera" action={<span className="text-xs text-gray-600">{dayLabel}</span>}>
      {needsProfile && (
        <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3">
          <p className="mb-2 text-sm text-amber-800">Completa il profilo tutor per gestire la disponibilità.</p>
          <div className="mb-2 grid grid-cols-1 gap-2 sm:grid-cols-4">
            <input placeholder="Nome" value={firstName} onChange={(e)=> setFirstName(e.target.value)} className="h-8 rounded-md border border-gray-300 px-2 text-xs" />
            <input placeholder="Cognome" value={lastName} onChange={(e)=> setLastName(e.target.value)} className="h-8 rounded-md border border-gray-300 px-2 text-xs" />
            <input placeholder="Tariffa oraria (€)" type="number" min={1} value={hourlyRate} onChange={(e)=> setHourlyRate(Number(e.target.value))} className="h-8 rounded-md border border-gray-300 px-2 text-xs" />
            <input placeholder="Materie (es. Matematica)" value={subjects} onChange={(e)=> setSubjects(e.target.value)} className="h-8 rounded-md border border-gray-300 px-2 text-xs" />
          </div>
          <button
            onClick={async ()=> { await createTutorProfileSelf({ first_name: firstName || 'Tutor', last_name: lastName || 'User', hourly_rate: hourlyRate || 20, subjects }); await load() }}
            className="inline-flex h-8 items-center rounded-md bg-primary px-3 text-xs text-white hover:bg-primary-600"
          >Crea profilo tutor</button>
        </div>
      )}
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <input type="date" value={date} onChange={(e)=> setDate(e.target.value)} className="h-9 rounded-md border border-gray-300 px-2 text-sm" />
        <button onClick={addSlot} disabled={!tutor || saving} className="inline-flex h-9 items-center rounded-md border border-blue-200 px-3 text-xs text-blue-700 hover:bg-blue-50 disabled:opacity-50">+ Slot 9-10</button>
      </div>
      <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-5">
        <div className="flex items-center gap-2">
          <label htmlFor="range-start" className="text-xs text-gray-600">Dal</label>
          <input id="range-start" type="date" value={rangeStart} onChange={(e)=> setRangeStart(e.target.value)} className="h-8 rounded-md border border-gray-300 px-2 text-xs" />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="range-end" className="text-xs text-gray-600">Al</label>
          <input id="range-end" type="date" value={rangeEnd} onChange={(e)=> setRangeEnd(e.target.value)} className="h-8 rounded-md border border-gray-300 px-2 text-xs" />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="time-start" className="text-xs text-gray-600">Dalle</label>
          <input id="time-start" type="time" value={timeStart} onChange={(e)=> setTimeStart(e.target.value)} className="h-8 rounded-md border border-gray-300 px-2 text-xs" />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="time-end" className="text-xs text-gray-600">Alle</label>
          <input id="time-end" type="time" value={timeEnd} onChange={(e)=> setTimeEnd(e.target.value)} className="h-8 rounded-md border border-gray-300 px-2 text-xs" />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="days-select" className="text-xs text-gray-600">Giorni</label>
          <select id="days-select" multiple value={daysOfWeek.map(String)} onChange={(e)=> setDaysOfWeek(Array.from(e.target.selectedOptions).map((o)=> Number(o.value)))} className="h-16 w-full rounded-md border border-gray-300 px-2 text-xs">
            <option value={1}>Lun</option>
            <option value={2}>Mar</option>
            <option value={3}>Mer</option>
            <option value={4}>Gio</option>
            <option value={5}>Ven</option>
            <option value={6}>Sab</option>
            <option value={0}>Dom</option>
          </select>
        </div>
        <div className="sm:col-span-5">
          <button onClick={addSlotsRange} disabled={!tutor || saving} className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-xs text-white hover:bg-primary-600 disabled:opacity-50">Crea fascia</button>
        </div>
      </div>
      {loading && <div className="h-8 w-1/2 rounded bg-blue-50" />}
      {!loading && error && <div className="text-sm text-red-600">{error}</div>}
      {!loading && !error && (
        <ul className="space-y-2 text-sm text-gray-800">
          {slots.map((s) => (
            <li key={s.id} className="flex items-center justify-between">
              <span>{new Date(s.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(s.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <div className="flex items-center gap-2">
                <span className={s.is_available ? 'text-green-700' : 'text-gray-500'}>{s.is_available ? 'Disponibile' : 'Occupato'}</span>
                <button onClick={()=> deleteSlot(s.id)} className="text-xs text-red-600 hover:underline">Elimina</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </DashboardWidget>
  )
}


