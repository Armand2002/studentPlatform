"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { isAxiosError } from 'axios'
import { Card, CardContent } from '@/components/ui/Card'

export default function RegisterPage() {
  const { register } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'student'|'tutor'>('student')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await register({ email, password, role, first_name: firstName || undefined, last_name: lastName || undefined })
      router.push('/dashboard')
    } catch (err: unknown) {
      let msg = 'Registrazione fallita'
      if (isAxiosError(err)) {
        const status = err.response?.status
        const data = err.response?.data
        if (status && status >= 500) {
          msg = 'Errore del server, riprova più tardi'
        } else if (typeof data === 'object' && data !== null && 'detail' in data) {
          msg = (data as { detail?: string }).detail || msg
        }
      } else if (err instanceof Error) {
        msg = err.message
      }
      console.error('Register failed', err)
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="relative w-full min-h-[calc(100vh-4rem)] overflow-hidden bg-primary-gradient flex items-center justify-center">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -top-28 -left-32 h-72 w-72 rounded-full bg-gradient-to-br from-primary-900 to-primary-700 opacity-40 blur-3xl" />
        <div className="absolute top-1/2 -right-28 h-80 w-80 rounded-full bg-gradient-to-br from-primary-800 to-primary-600 opacity-45 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-gradient-to-br from-primary-700 to-primary-500 opacity-50 blur-3xl" />
      </div>
      <div className="relative z-10 w-full min-w-0 max-w-md sm:max-w-lg lg:max-w-xl 2xl:max-w-2xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 mx-auto">
        <Card className="bg-white/95 shadow-card">
          <CardContent className="p-5 sm:p-6">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold text-gray-900">Crea account</h1>
              <p className="mt-1 text-sm text-gray-700">Scegli il tuo ruolo e completa i campi</p>
            </div>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div>
                <label htmlFor="register-firstname" className="mb-1 block text-sm font-medium text-gray-900">Nome</label>
                <input id="register-firstname" className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 text-sm sm:text-base" placeholder="Nome" value={firstName} onChange={(e)=>setFirstName(e.target.value)} />
              </div>
              <div>
                <label htmlFor="register-lastname" className="mb-1 block text-sm font-medium text-gray-900">Cognome</label>
                <input id="register-lastname" className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 text-sm sm:text-base" placeholder="Cognome" value={lastName} onChange={(e)=>setLastName(e.target.value)} />
              </div>
              <div>
                <label htmlFor="register-email" className="mb-1 block text-sm font-medium text-gray-900">Email</label>
                <input id="register-email" className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 text-sm sm:text-base" placeholder="email" value={email} onChange={(e)=>setEmail(e.target.value)} />
              </div>
              <div>
                <label htmlFor="register-password" className="mb-1 block text-sm font-medium text-gray-900">Password</label>
                <input id="register-password" className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 text-sm sm:text-base" placeholder="••••••••" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
              </div>
              <div>
                <label htmlFor="register-role" className="mb-1 block text-sm font-medium text-gray-900">Ruolo</label>
                <select id="register-role" className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 text-sm sm:text-base" value={role} onChange={(e)=>setRole(e.target.value as any)}>
                  <option value="student">Studente</option>
                  <option value="tutor">Tutor</option>
                </select>
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
            <button disabled={loading} className="w-full h-11 sm:h-12 rounded-full bg-primary text-white hover:bg-primary-600 disabled:opacity-50">{loading ? 'Attendere…' : 'Crea account'}</button>
            </form>
            <p className="mt-4 text-center text-sm text-gray-700">Hai già un account? <a className="text-primary hover:underline" href="/login">Accedi</a></p>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
