export default function HomePage() {
	return (
		<main className="min-h-[70vh] flex flex-col justify-center items-center bg-white">
			<section className="w-full max-w-2xl rounded-2xl shadow-card bg-gradient-to-br from-blue-100 via-blue-50 to-white p-8 mt-12 mb-8 flex flex-col items-center">
				<div className="mb-6">
					<svg width="64" height="64" fill="none" viewBox="0 0 64 64">
						<circle cx="32" cy="32" r="32" fill="#e0f2fe" />
						<path d="M20 44V28a12 12 0 1 1 24 0v16" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
						<rect x="16" y="44" width="32" height="8" rx="4" fill="#38bdf8" />
					</svg>
				</div>
				<h1 className="text-4xl font-bold text-blue-700 mb-2 text-center">Benvenuto nella Student Platform</h1>
				<p className="text-lg text-blue-500 mb-6 text-center max-w-md">La piattaforma moderna per studenti, tutor e amministratori. Gestisci lezioni, prenotazioni e comunicazioni in modo semplice e veloce.</p>
				<div className="flex gap-4 w-full justify-center">
					<a href="/login" className="px-6 py-2 rounded-lg bg-blue-500 text-white font-semibold shadow hover:bg-blue-600 transition">Login</a>
					<a href="/register" className="px-6 py-2 rounded-lg bg-white border border-blue-300 text-blue-600 font-semibold shadow hover:bg-blue-50 transition">Registrati</a>
				</div>
			</section>
			<footer className="text-xs text-gray-400 mt-auto mb-2">&copy; {new Date().getFullYear()} Student Platform</footer>
		</main>
	)
}
