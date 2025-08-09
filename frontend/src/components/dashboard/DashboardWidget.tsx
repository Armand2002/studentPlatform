import { ReactNode } from 'react'

interface DashboardWidgetProps {
  title: string
  action?: ReactNode
  children: ReactNode
}

export default function DashboardWidget({ title, action, children }: DashboardWidgetProps) {
  return (
    <section className="rounded-xl border border-blue-100 bg-white p-4 shadow-card">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-blue-800">{title}</h3>
        {action}
      </div>
      <div>{children}</div>
    </section>
  )
}


