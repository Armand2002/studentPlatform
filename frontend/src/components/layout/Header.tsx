import Link from 'next/link'

export default function Header() {
	return (
		<header className="border-b bg-white">
			<div className="container-responsive h-14 flex items-center justify-between">
				<Link href="/" className="font-semibold">Student Platform</Link>
				<nav className="flex items-center gap-4 text-sm text-gray-700">
					<Link href="/login" className="hover:text-gray-900">Login</Link>
					<Link href="/register" className="hover:text-gray-900">Registrati</Link>
				</nav>
			</div>
		</header>
	)
}
