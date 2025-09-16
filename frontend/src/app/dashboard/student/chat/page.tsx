"use client"
import RequireAuth from '@/components/auth/RequireAuth'
import { Card } from '@/components/ui/Card'
import { 
  Cog6ToothIcon,
  ChatBubbleLeftRightIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline'

export default function ChatPage() {
  return (
    <RequireAuth>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 rounded-xl p-6 border border-primary/20">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
            <ChatBubbleLeftRightIcon className="h-8 w-8 text-primary" />
            Chat con Tutor
          </h1>
          <p className="text-foreground-secondary text-lg">
            Comunica direttamente con i tuoi tutor.
          </p>
        </div>

        {/* Coming Soon */}
        <Card className="p-12">
          <div className="text-center">
            <ChatBubbleLeftRightIcon className="h-16 w-16 text-foreground-muted mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Funzionalità in Arrivo
            </h2>
            <p className="text-foreground-muted text-lg mb-6">
              La chat con i tutor sarà presto disponibile. Potrai comunicare in tempo reale con i tuoi insegnanti.
            </p>
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <p className="text-primary font-medium">
                💡 Nel frattempo, puoi contattare i tutor tramite email o durante le lezioni prenotate.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </RequireAuth>
  )
}
