import DashboardWidget from './DashboardWidget'

export default function LearningProgressWidget() {
  const progress = 58 // placeholder
  return (
    <DashboardWidget title="Progresso di Apprendimento">
      <div>
        <div className="mb-2 flex items-center justify-between text-sm text-blue-800">
          <span>Completato</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-primary-100">
          <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </DashboardWidget>
  )
}


