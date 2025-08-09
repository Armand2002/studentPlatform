import DashboardWidget from './DashboardWidget'

export default function BookingCalendarWidget() {
  // Placeholder mini-calendar grid
  const days = Array.from({ length: 14 }, (_, i) => ({ d: i + 1, available: i % 3 !== 0 }))
  return (
    <DashboardWidget title="Calendario Prenotazioni">
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {days.map((x) => (
          <div key={x.d} className={`rounded-md px-2 py-3 ${x.available ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-400'}`}>{x.d}</div>
        ))}
      </div>
    </DashboardWidget>
  )
}


