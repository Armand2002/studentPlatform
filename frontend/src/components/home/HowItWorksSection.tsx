export default function HowItWorksSection() {
  const steps = [
    { n: 1, title: 'Crea account', desc: 'Registrati come studente o tutor in pochi secondi.' },
    { n: 2, title: 'Configura profilo', desc: 'Scegli materie, disponibilità e preferenze.' },
    { n: 3, title: 'Prenota o insegna', desc: 'Visualizza disponibilità e conferma in 1 click.' },
    { n: 4, title: 'Segui i progressi', desc: 'Traccia risultati e prossimi passi.' },
  ]

  return (
    <div className="mt-10 rounded-2xl bg-white p-4 sm:p-6 shadow-card">
      <h2 className="mb-4 text-xl font-bold text-gray-900">Come funziona</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
        {steps.map((s) => (
          <div key={s.n} className="relative rounded-xl border border-primary-100 bg-gradient-to-br from-primary-50 to-white p-6 hover:shadow-md transition-shadow">
            <div className="absolute -top-3 left-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">{s.n}</div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">{s.title}</h3>
            <p className="mt-1 text-sm text-gray-700">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}


