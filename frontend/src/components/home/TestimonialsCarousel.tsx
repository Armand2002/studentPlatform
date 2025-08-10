"use client"
import { useEffect, useState } from 'react'

const items = [
  { name: 'Giulia, Studentessa', text: 'Ho prenotato lezioni in 2 minuti. Dashboard chiarissima.' },
  { name: 'Marco, Tutor', text: 'Gestire disponibilità e materiali è diventato semplicissimo.' },
  { name: 'Sara, Admin', text: 'Controllo immediato su pagamenti e andamento lezioni.' },
  { name: 'Luca, Studente', text: 'Lezioni più frequenti, zero intoppi.' },
  { name: 'Anna, Tutor', text: 'La mia agenda è finalmente sotto controllo.' },
  { name: 'Paolo, Studente', text: 'Materiali sempre a portata di mano.' },
]

export default function TestimonialsCarousel() {
  const [index, setIndex] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % items.length), 3500)
    return () => clearInterval(id)
  }, [])

  const visible = [items[index], items[(index + 1) % items.length], items[(index + 2) % items.length]]

  return (
    <div className="w-full bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <h2 className="mb-4 text-xl sm:text-2xl font-bold text-gray-900">Dicono di noi</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {visible.map((t, i) => (
            <figure key={t.name + i} className="rounded-xl border border-primary-100 bg-white p-5 sm:p-6 shadow-card h-full flex flex-col">
              <blockquote className="text-gray-800 text-sm sm:text-base flex-1">“{t.text}”</blockquote>
              <figcaption className="mt-3 text-sm font-medium text-gray-900 truncate">{t.name}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </div>
  )
}


