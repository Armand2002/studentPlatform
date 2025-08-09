export default function FeaturesSection() {
  const features = [
    { title: 'Prenotazioni Smart', desc: 'Disponibilità in tempo reale, gestione slot e conferme rapide.', icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M8 7V3m8 4V3M3 11h18M5 19h14a2 2 0 0 0 2-2v-6H3v6a2 2 0 0 0 2 2Z" strokeWidth="1.8" strokeLinecap="round"/></svg>
    )},
    { title: 'Materiali Didattici', desc: 'Upload sicuro e accesso controllato per studenti dei pacchetti attivi.', icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 4h10l6 6v10a2 2 0 0 1-2 2H4Z" strokeWidth="1.8"/><path d="M14 4v6h6" strokeWidth="1.8"/></svg>
    )},
    { title: 'Dashboard Ruoli', desc: 'Esperienze ottimizzate per Studente, Tutor e Admin.', icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="8" cy="8" r="3"/><circle cx="16" cy="8" r="3"/><path d="M2 20a6 6 0 0 1 12 0"/><path d="M10 20a6 6 0 0 1 12 0"/></svg>
    )},
  ]

  return (
    <section className="mt-10 grid gap-6 md:grid-cols-3">
      {features.map((f) => (
        <div key={f.title} className="rounded-xl border border-primary-100 bg-white p-6 shadow-card hover:shadow-lg transition-shadow">
          <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-700 animate-float">{f.icon}</div>
          <h3 className="text-lg font-semibold text-gray-900">{f.title}</h3>
          <p className="mt-1 text-sm text-gray-700">{f.desc}</p>
        </div>
      ))}
    </section>
  )
}


