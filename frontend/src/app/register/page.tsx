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
  // Student fields
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [institute, setInstitute] = useState('')
  const [classLevel, setClassLevel] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  // Tutor fields
  const [bio, setBio] = useState('')
  const [subjects, setSubjects] = useState('')
  const [hourlyRate, setHourlyRate] = useState('')
  const [isAvailable, setIsAvailable] = useState(true)
  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    
    // Validazione base
    if (!email || !password) {
      setError('Inserisci email e password')
      setLoading(false)
      return
    }
    
    if (!firstName || !lastName) {
      setError('Inserisci nome e cognome')
      setLoading(false)
      return
    }
    
    // Validazione campi specifici per ruolo
    if (role === 'student') {
      if (!dateOfBirth || !institute || !classLevel || !phoneNumber) {
        setError('Completa tutti i campi del profilo studente')
        setLoading(false)
        return
      }
    } else if (role === 'tutor') {
      if (!hourlyRate) {
        setError('Inserisci la tariffa oraria')
        setLoading(false)
        return
      }
    }
    
    try {
      let normalizedPhone = phoneNumber
      // Se l'utente inserisce un numero italiano senza prefisso, aggiungi +39
      if (role === 'student' && phoneNumber && /^3\d{9}$/.test(phoneNumber)) {
        normalizedPhone = `+39${phoneNumber}`
      }
      const registrationData: any = {
        email,
        password,
        role,
        first_name: firstName,
        last_name: lastName,
      }
      if (role === 'student') {
        Object.assign(registrationData, {
          date_of_birth: dateOfBirth,
          institute,
          class_level: classLevel,
          phone_number: normalizedPhone
        })
      } else if (role === 'tutor') {
        Object.assign(registrationData, {
          bio,
          subjects,
          hourly_rate: parseInt(hourlyRate),
          is_available: isAvailable
        })
      }
      await register(registrationData)
      setSuccess(true)
      setTimeout(() => router.push('/dashboard'), 1200)
    } catch (err: unknown) {
      let msg = 'Registrazione fallita'
      if (isAxiosError(err)) {
        const status = err.response?.status
        const data = err.response?.data
        if (status && status >= 500) {
          msg = 'Errore del server, riprova più tardi'
        } else if (typeof data === 'object' && data !== null) {
          if ('detail' in data) {
            if (typeof data.detail === 'string') {
              msg = data.detail
            } else if (Array.isArray(data.detail)) {
              // FastAPI validation error: array of error objects
              msg = data.detail.map((e: any) => e.msg).join(' | ')
            } else if (typeof data.detail === 'object') {
              msg = JSON.stringify(data.detail)
            }
          } else {
            msg = JSON.stringify(data)
          }
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
    <section className="relative w-full min-h-screen overflow-hidden bg-primary-gradient flex items-center justify-center">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -top-40 -left-40 h-[32rem] w-[32rem] rounded-full bg-gradient-to-br from-primary-900 to-primary-700 opacity-40 blur-3xl" />
        <div className="absolute top-1/3 -right-40 h-[36rem] w-[36rem] rounded-full bg-gradient-to-br from-primary-800 to-primary-600 opacity-45 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[40rem] w-[40rem] rounded-full bg-gradient-to-br from-primary-700 to-primary-500 opacity-50 blur-3xl" />
      </div>
      <div className="relative z-10 w-full min-w-0 max-w-md sm:max-w-lg lg:max-w-xl 2xl:max-w-2xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 mx-auto">
        <Card className="bg-card/95 backdrop-blur-sm shadow-xl border border-border">
          <CardContent className="p-5 sm:p-6">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold text-foreground">Crea account</h1>
              <p className="mt-1 text-sm text-foreground-secondary">Scegli il tuo ruolo e completa i campi</p>
            </div>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div>
                <label htmlFor="register-firstname" className="mb-1 block text-sm font-medium text-foreground">Nome</label>
                <input 
                  id="register-firstname" 
                  type="text" 
                  required 
                  className="block w-full rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm sm:text-base" 
                  placeholder="Nome" 
                  value={firstName} 
                  onChange={(e)=>setFirstName(e.target.value)} 
                />
              </div>
              <div>
                <label htmlFor="register-lastname" className="mb-1 block text-sm font-medium text-foreground">Cognome</label>
                <input 
                  id="register-lastname" 
                  type="text" 
                  required 
                  className="block w-full rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm sm:text-base" 
                  placeholder="Cognome" 
                  value={lastName} 
                  onChange={(e)=>setLastName(e.target.value)} 
                />
              </div>
              <div>
                <label htmlFor="register-email" className="mb-1 block text-sm font-medium text-foreground">Email</label>
                <input 
                  id="register-email" 
                  type="email" 
                  required 
                  className="block w-full rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm sm:text-base" 
                  placeholder="email@esempio.com" 
                  value={email} 
                  onChange={(e)=>setEmail(e.target.value)} 
                />
              </div>
              <div>
                <label htmlFor="register-password" className="mb-1 block text-sm font-medium text-foreground">Password</label>
                <input 
                  id="register-password" 
                  type="password" 
                  required 
                  className="block w-full rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm sm:text-base" 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={(e)=>setPassword(e.target.value)} 
                />
              </div>
              <div>
                <label htmlFor="register-role" className="mb-1 block text-sm font-medium text-foreground">Ruolo</label>
                <select 
                  id="register-role" 
                  className="block w-full rounded-md border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm sm:text-base" 
                  value={role} 
                  onChange={(e)=>setRole(e.target.value as any)}
                >
                  <option value="student">Studente</option>
                  <option value="tutor">Tutor</option>
                </select>
              </div>
              
              {/* Student Profile Fields */}
              {role === 'student' && (
                <>
                  <div>
                    <label htmlFor="register-dob" className="mb-1 block text-sm font-medium text-foreground">Data di Nascita</label>
                    <input 
                      id="register-dob" 
                      type="date" 
                      required 
                      className="block w-full rounded-md border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm sm:text-base" 
                      value={dateOfBirth} 
                      onChange={(e)=>setDateOfBirth(e.target.value)} 
                    />
                  </div>
                  <div>
                    <label htmlFor="register-institute" className="mb-1 block text-sm font-medium text-foreground">Istituto</label>
                    <input 
                      id="register-institute" 
                      type="text" 
                      required 
                      className="block w-full rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm sm:text-base" 
                      placeholder="Nome della scuola/università" 
                      value={institute} 
                      onChange={(e)=>setInstitute(e.target.value)} 
                    />
                  </div>
                  <div>
                    <label htmlFor="register-class" className="mb-1 block text-sm font-medium text-foreground">Classe/Anno</label>
                    <input 
                      id="register-class" 
                      type="text" 
                      required 
                      className="block w-full rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm sm:text-base" 
                      placeholder="Es: 3° Liceo, 2° Anno" 
                      value={classLevel} 
                      onChange={(e)=>setClassLevel(e.target.value)} 
                    />
                  </div>
                  <div>
                    <label htmlFor="register-phone" className="mb-1 block text-sm font-medium text-foreground">Telefono</label>
                    <input 
                      id="register-phone" 
                      type="tel" 
                      required 
                      className="block w-full rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm sm:text-base" 
                      placeholder="Il tuo numero di telefono" 
                      value={phoneNumber} 
                      onChange={(e)=>setPhoneNumber(e.target.value)} 
                    />
                  </div>
                </>
              )}
              
              {/* Tutor Profile Fields */}
              {role === 'tutor' && (
                <>
                  <div>
                    <label htmlFor="register-bio" className="mb-1 block text-sm font-medium text-foreground">Biografia</label>
                    <textarea 
                      id="register-bio" 
                      className="block w-full rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm sm:text-base" 
                      placeholder="Breve descrizione di te e delle tue competenze" 
                      value={bio} 
                      onChange={(e)=>setBio(e.target.value)} 
                      rows={3}
                    />
                  </div>
                  <div>
                    <label htmlFor="register-subjects" className="mb-1 block text-sm font-medium text-foreground">Materie</label>
                    <input 
                      id="register-subjects" 
                      type="text" 
                      className="block w-full rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm sm:text-base" 
                      placeholder="Es: Matematica, Fisica, Chimica" 
                      value={subjects} 
                      onChange={(e)=>setSubjects(e.target.value)} 
                    />
                  </div>
                  <div>
                    <label htmlFor="register-rate" className="mb-1 block text-sm font-medium text-foreground">Tariffa Oraria (€)</label>
                    <input 
                      id="register-rate" 
                      type="number" 
                      required 
                      min="0"
                      className="block w-full rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm sm:text-base" 
                      placeholder="25" 
                      value={hourlyRate} 
                      onChange={(e)=>setHourlyRate(e.target.value)} 
                    />
                  </div>
                  <div className="flex items-center">
                    <input 
                      id="register-available" 
                      type="checkbox" 
                      className="rounded border-border text-primary focus:ring-primary focus:ring-2" 
                      checked={isAvailable} 
                      onChange={(e)=>setIsAvailable(e.target.checked)} 
                    />
                    <label htmlFor="register-available" className="ml-2 block text-sm text-foreground">Disponibile per lezioni</label>
                  </div>
                </>
              )}
              
              {error && <p className="text-sm text-red-500">{error}</p>}
              {success && <p className="text-sm text-green-600">Registrazione avvenuta con successo!</p>}
            <button disabled={loading} className="w-full h-11 sm:h-12 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 font-medium transition-colors">{loading ? 'Attendere…' : 'Crea account'}</button>
            </form>
            <p className="mt-4 text-center text-sm text-foreground-secondary">Hai già un account? <a className="text-primary hover:text-primary/80 transition-colors" href="/login">Accedi</a></p>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
