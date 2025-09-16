"use client"

import { useState } from 'react'
import { api } from '@/lib/api'
import { isAxiosError } from 'axios'
import { Card, CardContent } from '@/components/ui/Card'
import { 
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    // Basic validation
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setError('Tutti i campi sono obbligatori')
      setLoading(false)
      return
    }

    try {
      const response = await api.post('/api/contact/', {
        ...formData,
        timestamp: new Date().toISOString()
      })

      setSuccess(`Messaggio inviato con successo! Codice di riferimento: ${response.data.reference_id}`)
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      })
    } catch (err) {
      console.error('Contact form error:', err)
      
      if (isAxiosError(err) && err.response?.data?.detail) {
        setError(err.response.data.detail)
      } else {
        setError('Errore nell\'invio del messaggio. Riprova più tardi.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="relative w-full min-h-screen overflow-hidden bg-primary-gradient">
      {/* Background Elements */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -top-40 -left-40 h-[32rem] w-[32rem] rounded-full bg-gradient-to-br from-primary-900 to-primary-700 opacity-40 blur-3xl" />
        <div className="absolute top-1/3 -right-40 h-[36rem] w-[36rem] rounded-full bg-gradient-to-br from-primary-800 to-primary-600 opacity-45 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[40rem] w-[40rem] rounded-full bg-gradient-to-br from-primary-700 to-primary-500 opacity-50 blur-3xl" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Contattaci
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Hai domande sui nostri servizi di tutoring? Vuoi richiedere un pacchetto personalizzato? 
              Contatta la nostra amministrazione e ti risponderemo al più presto.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="bg-card/95 backdrop-blur-sm shadow-xl border border-border">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    Informazioni di Contatto
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <EnvelopeIcon className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium text-foreground">Email</div>
                        <div className="text-sm text-foreground-secondary">admin@platform20.com</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <PhoneIcon className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium text-foreground">Telefono</div>
                        <div className="text-sm text-foreground-secondary">+39 123 456 7890</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <MapPinIcon className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium text-foreground">Ufficio</div>
                        <div className="text-sm text-foreground-secondary">
                          Via Roma 123<br />
                          20100 Milano, Italia
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/95 backdrop-blur-sm shadow-xl border border-border">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    Orari di Contatto
                  </h3>
                  
                  <div className="space-y-2 text-sm text-foreground-secondary">
                    <div className="flex justify-between">
                      <span>Lunedì - Venerdì</span>
                      <span>9:00 - 18:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sabato</span>
                      <span>9:00 - 13:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Domenica</span>
                      <span>Chiuso</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="bg-card/95 backdrop-blur-sm shadow-xl border border-border">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-foreground mb-6">
                    Invia un Messaggio
                  </h3>

                  {success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md flex items-start gap-3">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5" />
                      <div className="text-sm text-green-800">{success}</div>
                    </div>
                  )}

                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-start gap-3">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mt-0.5" />
                      <div className="text-sm text-red-800">{error}</div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                          Nome *
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                          className="block w-full rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                          placeholder="Il tuo nome"
                        />
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          className="block w-full rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                          placeholder="la-tua-email@esempio.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                        Oggetto *
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        required
                        value={formData.subject}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      >
                        <option value="">Seleziona un oggetto</option>
                        <option value="Richiesta Pacchetto Personalizzato">Richiesta Pacchetto Personalizzato</option>
                        <option value="Informazioni sui Servizi">Informazioni sui Servizi</option>
                        <option value="Supporto Tecnico">Supporto Tecnico</option>
                        <option value="Collaborazione come Tutor">Collaborazione come Tutor</option>
                        <option value="Feedback sulla Piattaforma">Feedback sulla Piattaforma</option>
                        <option value="Altro">Altro</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                        Messaggio *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        rows={6}
                        value={formData.message}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        placeholder="Descrivi la tua richiesta nel dettaglio..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full h-12 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Invio in corso...
                        </>
                      ) : (
                        <>
                          <EnvelopeIcon className="h-4 w-4" />
                          Invia Messaggio
                        </>
                      )}
                    </button>
                  </form>

                  <div className="mt-6 pt-6 border-t border-border">
                    <p className="text-xs text-foreground-muted">
                      * Campi obbligatori. I tuoi dati verranno utilizzati esclusivamente per rispondere alla tua richiesta 
                      e non verranno condivisi con terze parti.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
