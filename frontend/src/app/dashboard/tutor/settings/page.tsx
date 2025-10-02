"use client"

import RequireAuth from '@/components/auth/RequireAuth'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useState } from 'react'
import { 
  UserIcon,
  AcademicCapIcon,
  ClockIcon,
  BellIcon,
  ShieldCheckIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline'

export default function TutorSettingsPage() {
  const { user } = useAuth()
  const [activeSection, setActiveSection] = useState('profile')

  const sections = [
    { id: 'profile', name: 'Profilo', icon: UserIcon },
    { id: 'subjects', name: 'Materie', icon: AcademicCapIcon },
    { id: 'availability', name: 'Disponibilità', icon: ClockIcon },
    { id: 'notifications', name: 'Notifiche', icon: BellIcon },
    { id: 'security', name: 'Sicurezza', icon: ShieldCheckIcon },
    { id: 'billing', name: 'Fatturazione', icon: CreditCardIcon }
  ]

  if (!user || user.role !== 'tutor') {
    return (
      <RequireAuth>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Accesso Negato
            </h2>
            <p className="text-foreground-secondary">
              Solo i tutor possono accedere a questa pagina.
            </p>
          </div>
        </div>
      </RequireAuth>
    )
  }

  return (
    <RequireAuth>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-secondary/10 via-secondary/5 to-primary/10 rounded-xl p-6 border border-secondary/20">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Impostazioni Tutor
          </h1>
          <p className="text-foreground-secondary text-lg">
            Gestisci il tuo profilo, le tue preferenze e le impostazioni dell'account.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-4">
              <nav className="space-y-1">
                {sections.map(section => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors ${
                      activeSection === section.id
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground-secondary hover:text-foreground hover:bg-background-secondary'
                    }`}
                  >
                    <section.icon className="w-5 h-5" />
                    <span>{section.name}</span>
                  </button>
                ))}
              </nav>
            </Card>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <Card className="p-6">
              {activeSection === 'profile' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-foreground">Informazioni Profilo</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Nome</label>
                      <input
                        type="text"
                        defaultValue={user.first_name || ''}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Cognome</label>
                      <input
                        type="text"
                        defaultValue={user.last_name || ''}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                    <input
                      type="email"
                      defaultValue={user.email || ''}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Bio</label>
                    <textarea
                      rows={4}
                      placeholder="Descrivi la tua esperienza e le tue competenze..."
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <Button className="bg-primary hover:bg-primary/80">
                    Salva Modifiche
                  </Button>
                </div>
              )}

              {activeSection === 'subjects' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-foreground">Materie Insegnate</h2>
                  <p className="text-foreground-secondary">
                    Gestisci le materie che insegni e i tuoi livelli di competenza.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div>
                        <h3 className="font-medium text-foreground">Matematica</h3>
                        <p className="text-sm text-foreground-secondary">Livello: Avanzato</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Modifica
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div>
                        <h3 className="font-medium text-foreground">Fisica</h3>
                        <p className="text-sm text-foreground-secondary">Livello: Intermedio</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Modifica
                      </Button>
                    </div>
                  </div>

                  <Button className="bg-primary hover:bg-primary/80">
                    + Aggiungi Materia
                  </Button>
                </div>
              )}

              {activeSection === 'availability' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-foreground">Disponibilità</h2>
                  <p className="text-foreground-secondary">
                    Imposta i tuoi orari di disponibilità per le lezioni.
                  </p>
                  
                  <div className="text-center py-8">
                    <ClockIcon className="w-12 h-12 text-foreground-muted mx-auto mb-4" />
                    <p className="text-foreground-muted">
                      Funzionalità in sviluppo - Calendario disponibilità
                    </p>
                  </div>
                </div>
              )}

              {activeSection === 'notifications' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-foreground">Notifiche</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-foreground">Nuove prenotazioni</h3>
                        <p className="text-sm text-foreground-secondary">Ricevi notifiche per nuove prenotazioni</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-foreground">Promemoria lezioni</h3>
                        <p className="text-sm text-foreground-secondary">Promemoria 24h prima della lezione</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-foreground">Messaggi studenti</h3>
                        <p className="text-sm text-foreground-secondary">Notifiche per messaggi dagli studenti</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                  </div>

                  <Button className="bg-primary hover:bg-primary/80">
                    Salva Preferenze
                  </Button>
                </div>
              )}

              {activeSection === 'security' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-foreground">Sicurezza</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-foreground mb-2">Cambia Password</h3>
                      <div className="space-y-3">
                        <input
                          type="password"
                          placeholder="Password attuale"
                          className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                        <input
                          type="password"
                          placeholder="Nuova password"
                          className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                        <input
                          type="password"
                          placeholder="Conferma nuova password"
                          className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      <Button className="mt-3 bg-primary hover:bg-primary/80">
                        Aggiorna Password
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'billing' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-foreground">Fatturazione</h2>
                  <p className="text-foreground-secondary">
                    Gestisci le informazioni di fatturazione e i metodi di pagamento.
                  </p>
                  
                  <div className="text-center py-8">
                    <CreditCardIcon className="w-12 h-12 text-foreground-muted mx-auto mb-4" />
                    <p className="text-foreground-muted">
                      Funzionalità in sviluppo - Gestione pagamenti
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </RequireAuth>
  )
}
