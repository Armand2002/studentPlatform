export default function HowItWorksSection() {
  const steps = [
    { n: 1, title: 'Crea account', desc: 'Registrati come studente o tutor in pochi secondi.' },
    { n: 2, title: 'Configura profilo', desc: 'Imposta materie, disponibilità o dati anagrafici.' },
    { n: 3, title: 'Prenota o insegna', desc: 'Gestisci lezioni, conferme e materiali dalla dashboard.' },
  ]

  return (
    <section className="mt-10 rounded-2xl bg-white p-6 shadow-card">
      <h2 className="mb-4 text-xl font-bold text-gray-900">Come funziona</h2>
      <div className="grid gap-6 md:grid-cols-3">
        {steps.map((s) => (
          <div key={s.n} className="relative rounded-xl border border-primary-100 bg-gradient-to-br from-primary-50 to-white p-6 hover:shadow-md transition-shadow">
            <div className="absolute -top-3 left-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">{s.n}</div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">{s.title}</h3>
            <p className="mt-1 text-sm text-gray-700">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}


