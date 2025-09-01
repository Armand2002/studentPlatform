"use client"
import { ShieldCheckIcon, DocumentTextIcon, UserGroupIcon, ClockIcon } from '@heroicons/react/24/outline'
import { CheckIcon } from '@heroicons/react/20/solid'
import Button from '@/components/ui/Button'
import Link from 'next/link'

export default function TestForzeOrdinePage() {
  const concorsi = [
    {
      name: 'Polizia di Stato',
      description: 'Agenti, Commissari, Ispettori',
      materie: ['Cultura generale', 'Logica', 'Diritto costituzionale', 'Diritto penale']
    },
    {
      name: 'Arma dei Carabinieri',
      description: 'Carabinieri, Marescialli, Ufficiali',
      materie: ['Storia', 'Geografia', 'Educazione civica', 'Matematica']
    },
    {
      name: 'Guardia di Finanza',
      description: 'Finanzieri, Brigadieri, Ufficiali',
      materie: ['Economia', 'Diritto tributario', 'Matematica', 'Geografia economica']
    },
    {
      name: 'Vigili del Fuoco',
      description: 'Vigili, Capi squadra, Funzionari',
      materie: ['Fisica', 'Chimica', 'Meccanica', 'Primo soccorso']
    },
    {
      name: 'Polizia Penitenziaria',
      description: 'Agenti, Sovrintendenti, Commissari',
      materie: ['Diritto penitenziario', 'Psicologia', 'Criminologia', 'Diritto costituzionale']
    },
    {
      name: 'Polizia Municipale',
      description: 'Vigili urbani, Comandanti',
      materie: ['Codice della strada', 'Diritto amministrativo', 'Urbanistica', 'Edilizia']
    }
  ]

  const programDetails = [
    {
      name: 'Preparazione Scritta',
      description: 'Test attitudinali, logica, cultura generale e materie specifiche',
      icon: DocumentTextIcon,
      content: [
        'Quiz a risposta multipla',
        'Logica matematica e verbale',
        'Cultura generale italiana ed europea',
        'Diritto costituzionale e amministrativo',
        'Storia e geografia',
        'Educazione civica'
      ]
    },
    {
      name: 'Prova Fisica',
      description: 'Preparazione atletica e test di efficienza fisica',
      icon: UserGroupIcon,
      content: [
        'Corsa di resistenza',
        'Salto in lungo',
        'Piegamenti sulle braccia',
        'Addominali',
        'Trazioni alla sbarra',
        'Nuoto (quando previsto)'
      ]
    },
    {
      name: 'Colloquio Orale',
      description: 'Preparazione per il colloquio e valutazione attitudinale',
      icon: ClockIcon,
      content: [
        'Tecniche di comunicazione',
        'Gestione dello stress',
        'Argomenti specifici del concorso',
        'Simulazioni di colloquio',
        'Valutazione psico-attitudinale',
        'Motivazione e obiettivi'
      ]
    }
  ]

  const benefits = [
    'Materiale di studio aggiornato',
    'Simulazioni dei test ufficiali',
    'Tutor specializzati nei concorsi',
    'Gruppo di studio e motivazione',
    'Preparazione fisica personalizzata',
    "Supporto psicologico per l'ansia da esame",
    'Aggiornamenti su bandi e scadenze',
    'Strategie di time management'
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600/10 via-blue-600/5 to-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <ShieldCheckIcon className="h-16 w-16 text-blue-600 mx-auto mb-6" />
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
              Concorsi Forze dell'Ordine
            </h1>
            <p className="mt-6 text-lg leading-8 text-foreground-secondary max-w-3xl mx-auto">
              Preparazione completa e specializzata per concorsi in Polizia, Carabinieri, 
              Guardia di Finanza e tutti i corpi delle Forze dell'Ordine.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/register">
                <Button size="lg">
                  Inizia la Preparazione
                </Button>
              </Link>
              <a href="#concorsi" className="text-sm font-semibold leading-6 text-foreground">
                Vedi i concorsi <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Concorsi Section */}
      <div id="concorsi" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-primary">Concorsi disponibili</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Tutti i principali concorsi delle Forze dell'Ordine
            </p>
            <p className="mt-6 text-lg leading-8 text-foreground-secondary">
              Preparazione mirata per ogni tipo di concorso, dalle prove scritte 
              ai test fisici e colloqui orali.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl lg:max-w-none">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {concorsi.map((concorso) => (
                <div key={concorso.name} className="bg-background border border-border rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-foreground mb-2">{concorso.name}</h3>
                  <p className="text-sm text-foreground-secondary mb-4">{concorso.description}</p>
                  <div className="space-y-1">
                    {concorso.materie.map((materia) => (
                      <div key={materia} className="flex items-center">
                        <CheckIcon className="h-3 w-3 text-primary mr-2" />
                        <span className="text-xs text-foreground-muted">{materia}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Program Details */}
      <div className="bg-background-secondary py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Programma di preparazione completo
            </h2>
            <p className="mt-6 text-lg leading-8 text-foreground-secondary">
              Un percorso strutturato che copre tutti gli aspetti dei concorsi: 
              preparazione teorica, fisica e psicologica.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl lg:max-w-none">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {programDetails.map((program) => (
                <div key={program.name} className="bg-background rounded-lg p-8 shadow-sm border border-border">
                  <div className="flex items-center gap-x-3 mb-4">
                    <program.icon className="h-8 w-8 text-primary" />
                    <h3 className="text-xl font-semibold text-foreground">{program.name}</h3>
                  </div>
                  <p className="text-foreground-secondary mb-6">{program.description}</p>
                  <ul className="space-y-3">
                    {program.content.map((item) => (
                      <li key={item} className="flex items-start">
                        <CheckIcon className="h-4 w-4 text-primary mr-2 mt-0.5" />
                        <span className="text-sm text-foreground-secondary">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Perché scegliere la nostra preparazione
            </h2>
            <p className="mt-6 text-lg leading-8 text-foreground-secondary">
              Esperienza consolidata nella preparazione ai concorsi pubblici 
              con un alto tasso di successo dei nostri candidati.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl lg:mx-0 lg:max-w-none">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-start">
                  <div className="flex-shrink-0">
                    <CheckIcon className="h-6 w-6 text-primary" aria-hidden="true" />
                  </div>
                  <p className="ml-3 text-sm leading-6 text-foreground">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600">
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Realizza il tuo sogno di servire lo Stato
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-blue-100">
              Inizia oggi la tua preparazione per il concorso delle Forze dell'Ordine 
              con il supporto dei nostri esperti.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/register">
                <Button variant="secondary" size="lg">
                  Consulenza Gratuita
                </Button>
              </Link>
              <Link href="/packages" className="text-sm font-semibold leading-6 text-white">
                Vedi i pacchetti <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
