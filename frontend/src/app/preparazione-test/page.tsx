"use client"
import { ShieldCheckIcon, BookOpenIcon, ChartBarIcon, AcademicCapIcon } from '@heroicons/react/24/outline'
import { CheckIcon } from '@heroicons/react/20/solid'
import Button from '@/components/ui/Button'
import Link from 'next/link'

export default function PreparazioneTestPage() {
  const testTypes = [
    {
      title: "Concorsi Forze dell'Ordine",
      description: 'Preparazione completa per concorsi di Polizia, Carabinieri, Guardia di Finanza e altri corpi.',
      href: '/test-forze-ordine' as const,
      icon: ShieldCheckIcon,
      features: ['Test attitudinali', 'Cultura generale', 'Prova fisica', 'Colloquio orale']
    },
    {
      title: 'Test Universitari',
      description: 'Preparazione per test di ammissione a Medicina, Ingegneria, Economia e altre facoltà.',
      href: '/test-universitari' as const,
      icon: AcademicCapIcon,
      features: ['Logica e matematica', 'Materie specifiche', 'Simulazioni complete', 'Strategie di risposta']
    }
  ] as const

  const methodology = [
    {
      name: 'Analisi Iniziale',
      description: 'Valutazione del livello di partenza e definizione degli obiettivi.',
      icon: ChartBarIcon,
    },
    {
      name: 'Piano Personalizzato',
      description: 'Creazione di un percorso di studio su misura per ogni candidato.',
      icon: BookOpenIcon,
    },
    {
      name: 'Simulazioni Reali',
      description: 'Prove pratiche identiche a quelle dei concorsi ufficiali.',
      icon: AcademicCapIcon,
    },
    {
      name: 'Monitoraggio Continuo',
      description: 'Verifica costante dei progressi e aggiustamenti del programma.',
      icon: ChartBarIcon,
    },
  ]

  const successStats = [
    { name: 'Tasso di successo', value: '87%' },
    { name: 'Studenti preparati', value: '500+' },
    { name: 'Anni di esperienza', value: '10+' },
    { name: 'Concorsi coperti', value: '25+' },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
              Preparazione per i Test
            </h1>
            <p className="mt-6 text-lg leading-8 text-foreground-secondary max-w-3xl mx-auto">
              Preparati al meglio per concorsi pubblici e test universitari con i nostri 
              programmi specializzati e tutor esperti.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/register">
                <Button size="lg">
                  Inizia la Preparazione
                </Button>
              </Link>
              <a href="#servizi" className="text-sm font-semibold leading-6 text-foreground">
                Scopri i servizi <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-background-secondary py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <dl className="grid grid-cols-1 gap-x-8 gap-y-16 text-center lg:grid-cols-4">
            {successStats.map((stat) => (
              <div key={stat.name} className="mx-auto flex max-w-xs flex-col gap-y-4">
                <dt className="text-base leading-7 text-foreground-secondary">{stat.name}</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Services Section */}
      <div id="servizi" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-primary">I nostri servizi</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Preparazione specializzata per ogni tipo di test
            </p>
            <p className="mt-6 text-lg leading-8 text-foreground-secondary">
              Offriamo percorsi di preparazione mirati per diversi tipi di concorsi e test, 
              con metodologie specifiche per ogni settore.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {testTypes.map((testType) => (
                <div key={testType.title} className="bg-background border border-border rounded-lg p-8 shadow-sm">
                  <div className="flex items-center gap-x-3 mb-4">
                    <testType.icon className="h-8 w-8 text-primary" />
                    <h3 className="text-xl font-semibold text-foreground">{testType.title}</h3>
                  </div>
                  <p className="text-foreground-secondary mb-6">{testType.description}</p>
                  <ul className="space-y-2 mb-8">
                    {testType.features.map((feature) => (
                      <li key={feature} className="flex items-center">
                        <CheckIcon className="h-4 w-4 text-primary mr-2" />
                        <span className="text-sm text-foreground-secondary">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href={testType.href}>
                    <Button variant="outline" className="w-full">
                      Scopri di più
                    </Button>
                  </Link>
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
              La nostra metodologia
            </h2>
            <p className="mt-6 text-lg leading-8 text-foreground-secondary">
              Un approccio sistematico e personalizzato che garantisce risultati 
              concreti nella preparazione ai concorsi.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2">
              {methodology.map((step) => (
                <div key={step.name} className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-foreground">
                    <step.icon className="h-5 w-5 flex-none text-primary" aria-hidden="true" />
                    {step.name}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-foreground-secondary">
                    <p className="flex-auto">{step.description}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary">
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Inizia la tua preparazione oggi
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-primary-foreground/90">
              Contattaci per una consulenza gratuita e scopri il percorso di preparazione 
              più adatto ai tuoi obiettivi.
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
