'use client'

import { useState } from 'react'
import Link from 'next/link'
import { EnvelopeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useForm } from '@/hooks/useForm'
import { api } from '@/lib/api'

interface ForgotPasswordData {
  email: string
}

export default function ForgotPasswordPage() {
  const [emailSent, setEmailSent] = useState(false)
  
  const { formState: { data, loading, error }, updateField, handleSubmit } = useForm<ForgotPasswordData>({
    email: ''
  })

  const submitForgotPassword = async (formData: ForgotPasswordData) => {
    try {
      await api.post('/api/auth/password-reset-request', {
        email: formData.email
      })
      setEmailSent(true)
    } catch (err) {
      throw err // Let useForm handle the error
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card className="p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <EnvelopeIcon className="w-8 h-8 text-green-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Email Inviata!
              </h2>
              
              <p className="text-foreground-muted mb-6">
                Se l'email esiste nel nostro sistema, riceverai un link per reimpostare la password entro pochi minuti.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Controlla anche la cartella spam!</p>
                  <p>Il link scadrà tra 1 ora per sicurezza.</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <Button
                  onClick={() => setEmailSent(false)}
                  variant="outline"
                  className="w-full"
                >
                  Invia di nuovo
                </Button>
                
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <EnvelopeIcon className="w-8 h-8 text-primary" />
            </div>
            
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Password Dimenticata?
            </h2>
            
            <p className="text-foreground-muted">
              Inserisci la tua email e ti invieremo un link per reimpostare la password.
            </p>
          </div>

          <form onSubmit={handleSubmit(submitForgotPassword)} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Indirizzo Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-foreground-muted" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={data.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent placeholder-foreground-muted text-foreground bg-background"
                  placeholder="inserisci@tuaemail.com"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/80"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Invio in corso...
                </div>
              ) : (
                'Invia Link Reset'
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
