"use client"
import { UserIcon, CalendarDaysIcon, ChartBarIcon, BookOpenIcon } from '@heroicons/react/24/outline'
import { CheckIcon } from '@heroicons/react/20/solid'
import Button from '@/components/ui/Button'
import Link from 'next/link'

export default function RipetizioniPage() {
  const features = [
    {
      name: 'Lezioni Personalizzate',
      description: 'Programmi di studio su misura basati sulle esigenze specifiche di ogni studente.',
      icon: UserIcon,
    },
    {
      name: 'Orari Flessibili',
      description: 'Scegli gli orari che si adattano meglio ai tuoi impegni scolastici e extrascolastici.',
      icon: CalendarDaysIcon,
    },
    {
      name: 'Monitoraggio Progressi',
      description: 'Verifica costante dei miglioramenti con report dettagliati sui progressi.',
      icon: ChartBarIcon,
    },
    {
      name: 'Tutte le Materie',
      description: 'Supporto in matematica, fisica, chimica, italiano, inglese e molte altre materie.',
      icon: BookOpenIcon,
    },
  ]

  const subjects = [
    { name: 'Matematica', description: 'Algebra, geometria, analisi matematica' },
    { name: 'Fisica', description: 'Meccanica, termodinamica, elettromagnetismo' },
    { name: 'Chimica', description: 'Chimica generale, organica, inorganica' },
    { name: 'Italiano', description: 'Letteratura, grammatica, analisi del testo' },
    { name: 'Inglese', description: 'Grammar, conversation, preparazione certificazioni' },
    { name: 'Storia', description: 'Storia antica, moderna, contemporanea' },
    { name: 'Filosofia', description: 'Storia della filosofia, logica, etica' },
    { name: 'Biologia', description: 'Biologia molecolare, genetica, anatomia' },
  ]

  const benefits = [
    'Apprendimento accelerato',
    'Metodo di studio efficace',
    'Maggiore sicurezza nelle materie',
    'Miglioramento dei voti',
    'Preparazione esami e verifiche',
    'Supporto psicologico motivazionale'
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-secondary/10 via-secondary/5 to-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
              Ripetizioni Private
            </h1>
            <p className="mt-6 text-lg leading-8 text-foreground-secondary max-w-3xl mx-auto">
              Lezioni individuali con tutor esperti per superare le difficoltà scolastiche 
              e raggiungere i tuoi obiettivi accademici.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/register">
                <Button size="lg">
                  Prenota una Lezione
                </Button>
              </Link>
              <a href="#materie" className="text-sm font-semibold leading-6 text-foreground">
                Vedi le materie <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-primary">Il nostro approccio</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Ripetizioni efficaci e personalizzate
            </p>
            <p className="mt-6 text-lg leading-8 text-foreground-secondary">
              Ogni studente è unico. Per questo creiamo percorsi di apprendimento 
              personalizzati che si adattano al tuo stile di studio e ritmo.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2">
              {features.map((feature) => (
                <div key={feature.name} className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-foreground">
                    <feature.icon className="h-5 w-5 flex-none text-primary" aria-hidden="true" />
                    {feature.name}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-foreground-secondary">
                    <p className="flex-auto">{feature.description}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* Subjects Section */}
      <div id="materie" className="bg-background-secondary py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Materie disponibili
            </h2>
            <p className="mt-6 text-lg leading-8 text-foreground-secondary">
              Offriamo ripetizioni in tutte le principali materie scolastiche e universitarie, 
              dalla scuola media fino all&apos;università.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl lg:max-w-none">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {subjects.map((subject) => (
                <div key={subject.name} className="bg-background rounded-lg p-6 shadow-sm border border-border">
                  <h3 className="text-lg font-semibold text-foreground mb-2">{subject.name}</h3>
                  <p className="text-sm text-foreground-secondary">{subject.description}</p>
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
              Perché scegliere le nostre ripetizioni
            </h2>
            <p className="mt-6 text-lg leading-8 text-foreground-secondary">
              Risultati concreti e misurabili grazie a un metodo consolidato 
              e tutor altamente qualificati.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl lg:mx-0 lg:max-w-none">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-start">
                  <div className="flex-shrink-0">
                    <CheckIcon className="h-6 w-6 text-primary" aria-hidden="true" />
                  </div>
                  <p className="ml-3 text-base leading-7 text-foreground">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Preview */}
      <div className="bg-background-secondary py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Pacchetti flessibili per ogni esigenza
            </h2>
            <p className="mt-6 text-lg leading-8 text-foreground-secondary">
              Scegli il pacchetto più adatto alle tue esigenze di studio e budget.
            </p>
            <div className="mt-8">
              <Link href="/packages">
                <Button size="lg">
                  Vedi i Pacchetti
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary">
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Inizia il tuo percorso di successo
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-primary-foreground/90">
              Prenota una lezione di prova gratuita e scopri come possiamo aiutarti 
              a raggiungere i tuoi obiettivi scolastici.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/register">
                <Button variant="secondary" size="lg">
                  Lezione di Prova Gratuita
                </Button>
              </Link>
              <a href="#materie" className="text-sm font-semibold leading-6 text-white">
                Contattaci <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
