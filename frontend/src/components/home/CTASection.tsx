export default function CTASection() {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-primary-800 via-primary-600 to-primary-500">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 h-56 w-56 rounded-full bg-gradient-to-br from-primary-900 to-primary-700 opacity-30 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-gradient-to-br from-primary-700 to-primary-500 opacity-40 blur-3xl" />
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white">Pronto a migliorare il tuo percorso di studio?</h2>
        <p className="mt-3 text-white/90 max-w-3xl mx-auto text-sm sm:text-base">Unisciti a migliaia di studenti e tutor che prenotano, organizzano e imparano in modo più intelligente.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3 px-2">
          <a href="/register" className="inline-flex h-11 items-center rounded-full bg-white px-6 text-primary-700 hover:bg-white/90">Inizia ora</a>
          <a href="/login" className="inline-flex h-11 items-center rounded-full border border-white/40 px-6 text-white hover:bg-white/10">Accedi</a>
        </div>
      </div>
    </section>
  )
}


