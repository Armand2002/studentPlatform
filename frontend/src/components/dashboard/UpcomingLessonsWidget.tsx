import DashboardWidget from './DashboardWidget'

export default function UpcomingLessonsWidget() {
  const lessons = [
    { when: 'Oggi 15:00', subject: 'Matematica', with: 'Marco B.' },
    { when: 'Domani 10:00', subject: 'Fisica', with: 'Laura S.' },
  ]

  return (
    <DashboardWidget title="Prossime Lezioni">
      <div className="flex flex-col gap-2">
        {lessons.map((l, i) => (
          <div key={i} className="rounded-lg border border-blue-100 p-3">
            <p className="text-sm font-medium text-blue-900">{l.when}</p>
            <p className="text-xs text-blue-600">{l.subject} • {l.with}</p>
          </div>
        ))}
      </div>
    </DashboardWidget>
  )
}


