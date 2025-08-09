import DashboardWidget from './DashboardWidget'

export default function QuickActionsWidget() {
  const actions = [
    { label: 'Prenota lezione', href: '/dashboard/student' },
    { label: 'Sfoglia pacchetti', href: '/#packages' },
    { label: 'Materiali', href: '/dashboard/student' },
  ]
  return (
    <DashboardWidget title="Azioni Rapide">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {actions.map((a) => (
          <a key={a.label} href={a.href} className="rounded-md border border-blue-200 px-3 py-2 text-center text-sm font-medium text-blue-700 hover:bg-blue-50">
            {a.label}
          </a>
        ))}
      </div>
    </DashboardWidget>
  )
}


