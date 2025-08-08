export default function LoginPage() {
  return (
    <div className="max-w-sm mx-auto">
      <h2 className="text-xl font-semibold mb-4">Accedi</h2>
      <form className="space-y-3">
        <input className="block w-full rounded-md border border-gray-300 px-3 py-2" placeholder="Email" />
        <input className="block w-full rounded-md border border-gray-300 px-3 py-2" placeholder="Password" type="password" />
        <button className="w-full h-10 rounded-md bg-blue-600 text-white">Login</button>
      </form>
    </div>
  )
}
