"use client"
import { BookOpenIcon, ClockIcon, UserGroupIcon, AcademicCapIcon } from '@heroicons/react/24/outline'
import { CheckIcon } from '@heroicons/react/20/solid'
import Button from '@/components/ui/Button'
import Link from 'next/link'

export default function DoposcuolaPage() {
  const features = [
    {
      name: 'Supporto Compiti',
      description: 'Aiuto quotidiano nello svolgimento dei compiti di tutte le materie scolastiche.',
      icon: BookOpenIcon,
    },
    {
      name: 'Orari Flessibili',
      description: 'Attività pomeridiane dalle 14:00 alle 18:00, dal lunedì al venerdì.',
      icon: ClockIcon,
    },
    {
      name: 'Piccoli Gruppi',
      description: 'Massimo 6 studenti per gruppo per garantire attenzione personalizzata.',
      icon: UserGroupIcon,
    },
    {
      name: 'Tutor Qualificati',
      description: 'Educatori specializzati e laureati nelle diverse discipline.',
      icon: AcademicCapIcon,
    },
  ]

  const benefits = [
    'Sviluppo del metodo di studio',
    "Miglioramento dell'autonomia",
    'Supporto nelle difficoltà scolastiche',
    'Ambiente sereno e stimolante',
    'Comunicazione costante con le famiglie',
    'Attività ricreative ed educative'
  ]

  const schedule = [
    { time: '14:00 - 15:00', activity: 'Accoglienza e merenda' },
    { time: '15:00 - 16:30', activity: 'Svolgimento compiti - Prima sessione' },
    { time: '16:30 - 16:45', activity: 'Pausa ricreativa' },
    { time: '16:45 - 18:00', activity: 'Svolgimento compiti - Seconda sessione' },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
              Servizio Doposcuola
            </h1>
            <p className="mt-6 text-lg leading-8 text-foreground-secondary max-w-3xl mx-auto">
              Un ambiente educativo sicuro e stimolante dove i bambini possono svolgere i compiti, 
              studiare e crescere con il supporto di tutor qualificati.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/register">
                <Button size="lg">
                  Iscriviti Ora
                </Button>
              </Link>
              <a href="#dettagli" className="text-sm font-semibold leading-6 text-foreground">
                Scopri di più <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="dettagli" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-primary">Il nostro metodo</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Tutto quello che serve per il successo scolastico
            </p>
            <p className="mt-6 text-lg leading-8 text-foreground-secondary">
              Il nostro servizio doposcuola offre molto più del semplice aiuto compiti. 
              Creiamo un ambiente educativo completo per lo sviluppo dei bambini.
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

      {/* Benefits Section */}
      <div className="bg-background-secondary py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              I vantaggi del nostro doposcuola
            </h2>
            <p className="mt-6 text-lg leading-8 text-foreground-secondary">
              Un servizio completo che va oltre l&apos;aiuto compiti per supportare la crescita 
              educativa e personale di ogni bambino.
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

      {/* Schedule Section */}
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              La giornata tipo
            </h2>
            <p className="mt-6 text-lg leading-8 text-foreground-secondary">
              Una routine strutturata che alterna momenti di studio e pausa per garantire 
              il massimo dell&apos;apprendimento.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl">
            <div className="space-y-8">
              {schedule.map((item) => (
                <div key={item.time} className="flex items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white text-sm font-medium">
                    {schedule.indexOf(item) + 1}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-base font-semibold text-foreground">{item.time}</h3>
                    <p className="text-sm text-foreground-secondary">{item.activity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary">
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Inizia oggi il percorso di crescita
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-primary-foreground/90">
              Contattaci per una consulenza gratuita e scopri come il nostro doposcuola 
              può supportare il successo scolastico di tuo figlio.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/register">
                <Button variant="secondary" size="lg">
                  Iscriviti Ora
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
