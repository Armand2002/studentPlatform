export default function TestimonialsSection() {
  const items = [
    { name: 'Giulia, Studentessa', text: 'Ho prenotato lezioni in 2 minuti. Dashboard chiarissima.' },
    { name: 'Marco, Tutor', text: 'Gestire disponibilità e materiali è diventato semplicissimo.' },
    { name: 'Sara, Admin', text: 'Controllo immediato su pagamenti e andamento lezioni.' },
  ]

  return (
    <section className="mt-10">
      <h2 className="mb-4 text-xl font-bold text-gray-900">Dicono di noi</h2>
      <div className="grid gap-6 md:grid-cols-3">
        {items.map((t) => (
          <figure key={t.name} className="rounded-xl border border-primary-100 bg-white p-6 shadow-card hover:shadow-lg transition-shadow">
            <blockquote className="text-gray-800">“{t.text}”</blockquote>
            <figcaption className="mt-3 text-sm font-medium text-gray-900">{t.name}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}


