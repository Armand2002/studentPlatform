import DashboardWidget from './DashboardWidget'

export default function ActivePackagesWidget() {
  // Placeholder static — later wire to /api/packages and purchases
  const data = [
    { name: 'Matematica Base', hoursRemaining: 6, expiry: '14 gg' },
    { name: 'Fisica Intermedio', hoursRemaining: 3, expiry: '9 gg' },
  ]

  return (
    <DashboardWidget title="Pacchetti Attivi">
      <ul className="divide-y divide-blue-50">
        {data.map((p) => (
          <li key={p.name} className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-blue-900">{p.name}</p>
              <p className="text-xs text-blue-600">Scade in {p.expiry}</p>
            </div>
            <div className="text-sm font-semibold text-blue-700">{p.hoursRemaining}h</div>
          </li>
        ))}
      </ul>
    </DashboardWidget>
  )
}


