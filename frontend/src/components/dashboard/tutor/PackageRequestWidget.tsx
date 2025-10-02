"use client"
import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  PlusCircleIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { useForm } from '@/hooks/useForm'
import { api } from '@/lib/api'

interface PackageRequestData {
  name: string
  subject: string
  description: string
  total_hours: number
}

export default function PackageRequestWidget() {
  const [showForm, setShowForm] = useState(false)
  
  const { formState: { data, loading, success, error }, updateField, handleSubmit, resetForm } = useForm<PackageRequestData>({
    name: '',
    subject: '',
    description: '',
    total_hours: 10
  }, {
    resetOnSuccess: true,
    successMessage: 'Richiesta inviata con successo!'
  })

  const submitRequest = async (formData: PackageRequestData) => {
    try {
      await api.post('/api/packages/request', {
        name: formData.name,
        subject: formData.subject,
        description: formData.description,
        total_hours: formData.total_hours,
        price: 0 // Will be set by admin based on pricing rules
      })
      setShowForm(false)
    } catch (err) {
      throw err // Let useForm handle the error
    }
  }

  if (showForm) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Richiedi Nuovo Pacchetto</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setShowForm(false)
              resetForm()
            }}
          >
            Annulla
          </Button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <ExclamationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Creazione Pacchetti Centralizzata</p>
              <p>I pacchetti vengono ora creati esclusivamente dagli amministratori per garantire qualità e coerenza dei prezzi. La tua richiesta sarà valutata e processata dal team admin.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(submitRequest)} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
              Nome Pacchetto
            </label>
            <input
              type="text"
              id="name"
              value={data.name}
              onChange={(e) => updateField('name', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="es. Matematica Avanzata - Liceo"
              required
            />
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-1">
              Materia
            </label>
            <select
              id="subject"
              value={data.subject}
              onChange={(e) => updateField('subject', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            >
              <option value="">Seleziona materia</option>
              <option value="matematica">Matematica</option>
              <option value="fisica">Fisica</option>
              <option value="chimica">Chimica</option>
              <option value="italiano">Italiano</option>
              <option value="inglese">Inglese</option>
              <option value="storia">Storia</option>
              <option value="filosofia">Filosofia</option>
              <option value="biologia">Biologia</option>
              <option value="informatica">Informatica</option>
              <option value="altro">Altro</option>
            </select>
          </div>

          <div>
            <label htmlFor="total_hours" className="block text-sm font-medium text-foreground mb-1">
              Ore Totali
            </label>
            <select
              id="total_hours"
              value={data.total_hours}
              onChange={(e) => updateField('total_hours', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            >
              <option value={5}>5 ore</option>
              <option value={10}>10 ore</option>
              <option value={15}>15 ore</option>
              <option value={20}>20 ore</option>
              <option value={30}>30 ore</option>
              <option value={40}>40 ore</option>
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1">
              Descrizione
            </label>
            <textarea
              id="description"
              value={data.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Descrivi il contenuto del pacchetto, livello, obiettivi..."
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
                <p className="text-sm text-green-800">Richiesta inviata con successo! Riceverai una notifica quando il pacchetto sarà creato.</p>
              </div>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary hover:bg-primary/80"
            >
              {loading ? 'Invio...' : 'Invia Richiesta'}
            </Button>
          </div>
        </form>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="text-center">
        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
          <PlusCircleIcon className="w-6 h-6 text-primary" />
        </div>
        
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Richiedi Nuovo Pacchetto
        </h3>
        
        <p className="text-foreground-muted text-sm mb-4">
          I pacchetti vengono creati dal team amministrativo per garantire qualità e prezzi coerenti.
        </p>

        <Button
          onClick={() => setShowForm(true)}
          className="bg-primary hover:bg-primary/80"
        >
          <PlusCircleIcon className="w-4 h-4 mr-2" />
          Nuova Richiesta
        </Button>

        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-center space-x-2 text-xs text-foreground-muted">
            <ClockIcon className="w-4 h-4" />
            <span>Tempo di elaborazione: 1-2 giorni lavorativi</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
