"use client"
import { AcademicCapIcon, BeakerIcon, CalculatorIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import { CheckIcon } from '@heroicons/react/20/solid'
import Button from '@/components/ui/Button'
import Link from 'next/link'

export default function TestUniversitariPage() {
  const facolta = [
    {
      name: 'Medicina e Chirurgia',
      description: 'TOLC-MED, test di ammissione nazionale',
      icon: BeakerIcon,
      materie: ['Biologia', 'Chimica', 'Fisica', 'Matematica', 'Logica', 'Cultura generale'],
      posti: '15.000 posti disponibili',
      difficolta: 'Alta'
    },
    {
      name: 'Ingegneria',
      description: 'TOLC-I per tutte le specializzazioni',
      icon: CalculatorIcon,
      materie: ['Matematica', 'Fisica', 'Logica', 'Comprensione verbale', 'Inglese'],
      posti: '50.000+ posti disponibili',
      difficolta: 'Media-Alta'
    },
    {
      name: 'Economia',
      description: 'TOLC-E e test specifici di ateneo',
      icon: DocumentTextIcon,
      materie: ['Matematica', 'Logica', 'Comprensione verbale', 'Inglese'],
      posti: '30.000+ posti disponibili',
      difficolta: 'Media'
    },
    {
      name: 'Psicologia',
      description: 'Test di ammissione specifici',
      icon: AcademicCapIcon,
      materie: ['Logica', 'Cultura generale', 'Comprensione verbale', 'Biologia'],
      posti: '8.000 posti disponibili',
      difficolta: 'Alta'
    }
  ]

  const metodologie = [
    {
      name: 'Analisi del Test',
      description: 'Studio approfondito della struttura e tipologie di domande del test specifico',
      steps: [
        'Analisi bandi e programmi',
        'Studio delle prove degli anni precedenti',
        'Identificazione pattern e tipologie',
        'Strategie di approccio'
      ]
    },
    {
      name: 'Preparazione Teorica',
      description: 'Ripasso mirato delle materie oggetto del test con focus sui topics più frequenti',
      steps: [
        'Ripasso teoria essenziale',
        'Esercitazioni mirate',
        'Approfondimenti specifici',
        'Consolidamento concetti'
      ]
    },
    {
      name: 'Simulazioni',
      description: 'Prove pratiche identiche al test ufficiale per abituarsi ai tempi e alla pressione',
      steps: [
        'Simulazioni cronometrate',
        'Analisi errori e miglioramenti',
        'Strategie di time management',
        'Gestione dello stress'
      ]
    },
    {
      name: 'Coaching Finale',
      description: 'Supporto negli ultimi giorni prima del test per ottimizzare la performance',
      steps: [
        'Ripasso flash dei concetti chiave',
        'Strategie per il giorno del test',
        "Gestione dell'ansia",
        'Tecniche di concentrazione'
      ]
    }
  ]

  const successData = [
    { metric: 'Studenti ammessi', value: '78%' },
    { metric: 'Miglioramento score', value: '+35%' },
    { metric: 'Simulazioni svolte', value: '50+' },
    { metric: 'Ore di preparazione', value: '200+' }
  ]

  const benefits = [
    'Materiale di studio specifico per ogni test',
    'Docenti specializzati nelle singole materie',
    'Piattaforma online con migliaia di quiz',
    'Simulazioni con correzione automatica',
    'Gruppi di studio e confronto',
    'Aggiornamenti in tempo reale sui bandi',
    "Supporto psicologico per gestire l'ansia",
    'Strategie avanzate di risposta'
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600/10 via-purple-600/5 to-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <AcademicCapIcon className="h-16 w-16 text-purple-600 mx-auto mb-6" />
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
              Test Universitari
            </h1>
            <p className="mt-6 text-lg leading-8 text-foreground-secondary max-w-3xl mx-auto">
              Preparazione mirata per i test di ammissione a Medicina, Ingegneria, Economia 
              e tutte le facoltà a numero programmato.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/register">
                <Button size="lg">
                  Inizia la Preparazione
                </Button>
              </Link>
              <a href="#facolta" className="text-sm font-semibold leading-6 text-foreground">
                Vedi le facoltà <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Success Stats */}
      <div className="bg-background-secondary py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <dl className="grid grid-cols-1 gap-x-8 gap-y-8 text-center lg:grid-cols-4">
            {successData.map((stat) => (
              <div key={stat.metric} className="mx-auto flex max-w-xs flex-col gap-y-2">
                <dt className="text-base leading-7 text-foreground-secondary">{stat.metric}</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Facoltà Section */}
      <div id="facolta" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-primary">Facoltà coperte</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Preparazione per ogni facoltà a numero programmato
            </p>
            <p className="mt-6 text-lg leading-8 text-foreground-secondary">
              Percorsi di studio specifici per ogni tipo di test universitario, 
              dalle materie scientifiche a quelle umanistiche.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl lg:max-w-none">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {facolta.map((facolta) => (
                <div key={facolta.name} className="bg-background border border-border rounded-lg p-8 shadow-sm">
                  <div className="flex items-center gap-x-3 mb-4">
                    <facolta.icon className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="text-xl font-semibold text-foreground">{facolta.name}</h3>
                      <p className="text-sm text-foreground-secondary">{facolta.description}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-sm font-medium text-foreground">Posti disponibili</p>
                      <p className="text-sm text-foreground-secondary">{facolta.posti}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Difficoltà</p>
                      <p className="text-sm text-foreground-secondary">{facolta.difficolta}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <p className="text-sm font-medium text-foreground mb-3">Materie del test:</p>
                    <div className="flex flex-wrap gap-2">
                      {facolta.materie.map((materia) => (
                        <span key={materia} className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-md">
                          {materia}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Methodology Section */}
      <div className="bg-background-secondary py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Il nostro metodo in 4 fasi
            </h2>
            <p className="mt-6 text-lg leading-8 text-foreground-secondary">
              Un approccio strutturato e progressivo che ti accompagna 
              dalla preparazione iniziale fino al giorno del test.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl lg:max-w-none">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {metodologie.map((metodo, index) => (
                <div key={metodo.name} className="bg-background rounded-lg p-8 shadow-sm border border-border">
                  <div className="flex items-center gap-x-3 mb-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white text-sm font-medium">
                      {index + 1}
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">{metodo.name}</h3>
                  </div>
                  <p className="text-foreground-secondary mb-6">{metodo.description}</p>
                  <ul className="space-y-2">
                    {metodo.steps.map((step) => (
                      <li key={step} className="flex items-center">
                        <CheckIcon className="h-4 w-4 text-primary mr-2" />
                        <span className="text-sm text-foreground-secondary">{step}</span>
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
              Vantaggi della nostra preparazione
            </h2>
            <p className="mt-6 text-lg leading-8 text-foreground-secondary">
              Tutto quello che ti serve per massimizzare le tue possibilità 
              di successo nei test universitari.
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
      <div className="bg-purple-600">
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Il tuo futuro universitario inizia qui
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-purple-100">
              Non lasciare al caso la tua ammissione all'università. 
              Inizia oggi la preparazione con i nostri esperti.
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
