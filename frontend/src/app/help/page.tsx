"use client"
import { useRouter } from 'next/navigation'
import RequireAuth from '@/components/auth/RequireAuth'
import { Card } from '@/components/ui/Card'
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline'

export default function HelpPage() {
  const router = useRouter()

  return (
    <RequireAuth>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 rounded-xl p-6 border border-primary/20">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
            <QuestionMarkCircleIcon className="h-8 w-8 text-primary" />
            Centro Aiuto
          </h1>
          <p className="text-foreground-secondary text-lg">
            Trova risposte alle tue domande e risolvi i problemi.
          </p>
        </div>

        {/* FAQ */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground mb-6">
            Domande Frequenti
          </h2>
          
          <div className="space-y-4">
            <div className="border border-border rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">
                Come posso prenotare una lezione?
              </h3>
              <p className="text-foreground-muted text-sm">
                Vai alla sezione "Prenota Lezione" dalla dashboard, scegli il tutor e l'orario che preferisci, poi clicca su "Prenota".
              </p>
            </div>
            
            <div className="border border-border rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">
                Come posso vedere i miei pacchetti attivi?
              </h3>
              <p className="text-foreground-muted text-sm">
                I tuoi pacchetti sono visibili nella dashboard principale nel widget "I Miei Pacchetti".
              </p>
            </div>
            
            <div className="border border-border rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">
                Posso cancellare una lezione prenotata?
              </h3>
              <p className="text-foreground-muted text-sm">
                Sì, puoi cancellare una lezione fino a 24 ore prima dell'orario previsto dal tuo calendario.
              </p>
            </div>
            
            <div className="border border-border rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2">
                Come posso contattare il supporto?
              </h3>
              <p className="text-foreground-muted text-sm">
                Puoi usare il modulo di contatto nella sezione "Contatti" o scrivere a support@platform.com.
              </p>
            </div>
          </div>
        </Card>

        {/* Contact Support */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Hai ancora bisogno di aiuto?
          </h2>
          <p className="text-foreground-muted mb-4">
            Se non hai trovato la risposta che cercavi, contatta il nostro team di supporto.
          </p>
          <button 
            onClick={() => router.push('/contact' as any)}
            className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-600 transition-colors"
          >
            Contatta il Supporto
          </button>
        </Card>
      </div>
    </RequireAuth>
  )
}
