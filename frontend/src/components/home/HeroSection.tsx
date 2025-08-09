export default function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-primary-800 via-primary-600 to-primary-400">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-28 -left-32 h-72 w-72 rounded-full bg-gradient-to-br from-primary-900 to-primary-700 opacity-30 blur-3xl" />
        <div className="absolute top-1/2 -right-28 h-80 w-80 rounded-full bg-gradient-to-br from-primary-800 to-primary-600 opacity-35 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-gradient-to-br from-primary-700 to-primary-500 opacity-40 blur-3xl" />
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white ring-1 ring-white/20">Piattaforma tutoraggio</span>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Impara meglio. Prenota più velocemente.
            </h1>
            <p className="mt-4 max-w-2xl text-white/90">
              Tutto per studenti e tutor: disponibilità real-time, prenotazioni smart, materiali sempre accessibili. Un unico posto, un flusso semplice.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="/register" className="inline-flex h-11 items-center rounded-full bg-white px-6 text-primary-700 hover:bg-white/90">
                Inizia ora
              </a>
              <a href="/login" className="inline-flex h-11 items-center rounded-full border border-white/40 px-6 text-white hover:bg-white/10">
                Accedi
              </a>
            </div>

            {/* Trust metrics */}
            <div className="mt-8 grid grid-cols-3 gap-4 text-white/90">
              <div>
                <p className="text-2xl font-bold">98%</p>
                <p className="text-xs">Soddisfazione</p>
              </div>
              <div>
                <p className="text-2xl font-bold">15k+</p>
                <p className="text-xs">Studenti</p>
              </div>
              <div>
                <p className="text-2xl font-bold">4.9/5</p>
                <p className="text-xs">Rating</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="mx-auto w-full max-w-2xl">
              <div className="relative aspect-[16/10] rounded-2xl bg-white/95 p-4 shadow-2xl ring-1 ring-white/20">
                <div className="absolute -top-6 -left-6 h-14 w-14 rounded-full bg-white/20 backdrop-blur animate-float" />
                <div className="absolute -bottom-8 -right-10 h-20 w-20 rounded-full bg-white/10 backdrop-blur animate-float" style={{ animationDelay: '1s' }} />
                <div className="h-full w-full overflow-hidden rounded-lg border border-primary-100">
                  {/* Placeholder illustration */}
                  <div className="h-full w-full bg-gradient-to-br from-white to-primary-50 grid place-items-center text-gray-800">
                    <div className="animate-fade-in-up text-center">
                      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-primary">
                        <rect x="3" y="4" width="18" height="14" rx="2"/>
                        <path d="M8 21h8"/>
                      </svg>
                      <p className="mt-2 text-sm text-gray-700">Anteprima Dashboard</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}


