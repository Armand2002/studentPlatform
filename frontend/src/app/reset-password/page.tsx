'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { KeyIcon, EyeIcon, EyeSlashIcon, CheckCircleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useForm } from '@/hooks/useForm'
import { api } from '@/lib/api'

interface ResetPasswordData {
  password: string
  confirmPassword: string
}

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)
  const [tokenValid, setTokenValid] = useState(true)
  
  const { formState: { data, loading, error }, updateField, handleSubmit } = useForm<ResetPasswordData>({
    password: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (!token) {
      setTokenValid(false)
    }
  }, [token])

  const submitResetPassword = async (formData: ResetPasswordData) => {
    if (formData.password !== formData.confirmPassword) {
      throw new Error('Le password non corrispondono')
    }

    if (formData.password.length < 8) {
      throw new Error('La password deve essere di almeno 8 caratteri')
    }

    try {
      await api.post('/api/auth/password-reset', {
        token: token,
        new_password: formData.password
      })
      setResetSuccess(true)
    } catch (err: any) {
      if (err.response?.status === 400) {
        throw new Error('Token non valido o scaduto. Richiedi un nuovo link.')
      }
      throw err
    }
  }

  const getPasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength += 1
    if (/[A-Z]/.test(password)) strength += 1
    if (/[a-z]/.test(password)) strength += 1
    if (/[0-9]/.test(password)) strength += 1
    if (/[^A-Za-z0-9]/.test(password)) strength += 1
    return strength
  }

  const getStrengthColor = (strength: number) => {
    if (strength < 2) return 'bg-red-500'
    if (strength < 4) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getStrengthText = (strength: number) => {
    if (strength < 2) return 'Debole'
    if (strength < 4) return 'Media'
    return 'Forte'
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card className="p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <KeyIcon className="w-8 h-8 text-red-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Link Non Valido
              </h2>
              
              <p className="text-foreground-muted mb-6">
                Il link per il reset della password non è valido o è mancante.
              </p>
              
              <div className="space-y-3">
                <Link href="/forgot-password" className="block">
                  <Button className="w-full bg-primary hover:bg-primary/80">
                    Richiedi Nuovo Link
                  </Button>
                </Link>
                
                <Link href="/login" className="block">
                  <Button variant="outline" className="w-full">
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    Torna al Login
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  if (resetSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card className="p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircleIcon className="w-8 h-8 text-green-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Password Reimpostata!
              </h2>
              
              <p className="text-foreground-muted mb-6">
                La tua password è stata reimpostata con successo. Ora puoi accedere con la nuova password.
              </p>
              
              <Button
                onClick={() => router.push('/login')}
                className="w-full bg-primary hover:bg-primary/80"
              >
                Vai al Login
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  const passwordStrength = getPasswordStrength(data.password)

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <KeyIcon className="w-8 h-8 text-primary" />
            </div>
            
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Reimposta Password
            </h2>
            
            <p className="text-foreground-muted">
              Inserisci la tua nuova password sicura.
            </p>
          </div>

          <form onSubmit={handleSubmit(submitResetPassword)} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Nuova Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={data.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  className="block w-full pr-10 py-2 px-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground bg-background"
                  placeholder="Inserisci nuova password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-foreground-muted" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-foreground-muted" />
                  )}
                </button>
              </div>
              
              {data.password && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="flex-1 bg-gray-200 rounded-full h-1">
                      <div 
                        className={`h-1 rounded-full transition-all duration-300 ${getStrengthColor(passwordStrength)}`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-foreground-muted">
                      {getStrengthText(passwordStrength)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                Conferma Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={data.confirmPassword}
                  onChange={(e) => updateField('confirmPassword', e.target.value)}
                  className="block w-full pr-10 py-2 px-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground bg-background"
                  placeholder="Conferma nuova password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-foreground-muted" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-foreground-muted" />
                  )}
                </button>
              </div>
              
              {data.confirmPassword && data.password !== data.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">Le password non corrispondono</p>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Requisiti password:</p>
                <ul className="text-xs space-y-1">
                  <li className={data.password.length >= 8 ? 'text-green-600' : ''}>
                    ✓ Almeno 8 caratteri
                  </li>
                  <li className={/[A-Z]/.test(data.password) ? 'text-green-600' : ''}>
                    ✓ Una lettera maiuscola
                  </li>
                  <li className={/[a-z]/.test(data.password) ? 'text-green-600' : ''}>
                    ✓ Una lettera minuscola
                  </li>
                  <li className={/[0-9]/.test(data.password) ? 'text-green-600' : ''}>
                    ✓ Un numero
                  </li>
                </ul>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || data.password !== data.confirmPassword || passwordStrength < 2}
              className="w-full bg-primary hover:bg-primary/80"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Reimpostazione...
                </div>
              ) : (
                'Reimposta Password'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm text-primary hover:text-primary/80">
              <ArrowLeftIcon className="w-4 h-4 inline mr-1" />
              Torna al Login
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
