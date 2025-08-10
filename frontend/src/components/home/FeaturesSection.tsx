export default function FeaturesSection() {
  const features = [
    { title: 'Prenotazioni Smart', desc: 'Disponibilità in tempo reale e conferme rapide.', icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M8 7V3m8 4V3M3 11h18M5 19h14a2 2 0 0 0 2-2v-6H3v6a2 2 0 0 0 2 2Z" strokeWidth="1.8" strokeLinecap="round"/></svg>
    )},
    { title: 'Materiali Sicuri', desc: 'Upload protetto, accessi controllati e versioning.', icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 4h10l6 6v10a2 2 0 0 1-2 2H4Z" strokeWidth="1.8"/><path d="M14 4v6h6" strokeWidth="1.8"/></svg>
    )},
    { title: 'Dashboard Ruoli', desc: 'Esperienza su misura per Studente, Tutor e Admin.', icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="8" cy="8" r="3"/><circle cx="16" cy="8" r="3"/><path d="M2 20a6 6 0 0 1 12 0"/><path d="M10 20a6 6 0 0 1 12 0"/></svg>
    )},
    { title: 'Pagamenti Pronti', desc: 'Integrazione gateway e fatture (prossima fase).', icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 5h18v14H3z"/><path d="M3 10h18"/><path d="M7 15h2"/></svg>
    )},
    { title: 'Notifiche & Reminder', desc: 'Email e reminder per zero no‑show.', icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2z"/></svg>
    )},
    { title: 'Analytics', desc: 'Progressi, conversioni e performance a colpo d’occhio.', icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 3v18h18"/><path d="M7 15v-4"/><path d="M12 15V7"/><path d="M17 15v-2"/></svg>
    )},
  ]

  return (
    <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
      {features.map((f) => (
        <div key={f.title} className="rounded-xl border border-primary-100 bg-white p-5 shadow-card hover:shadow-lg transition-shadow">
          <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-700 animate-float sm:animate-none">{f.icon}</div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 break-words">{f.title}</h3>
          <p className="mt-1 text-sm sm:text-base text-gray-700 break-words">{f.desc}</p>
        </div>
      ))}
    </div>
  )
}


