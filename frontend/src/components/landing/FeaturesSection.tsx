'use client';

import { Card, CardContent } from '@/components/ui/Card';
import Spotlight from '@/components/ui/Spotlight';
import { 
  BookOpenIcon, 
  CalendarDaysIcon, 
  ChartBarIcon,
  ClockIcon,
  UserGroupIcon,
  AcademicCapIcon,
  CheckBadgeIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const features = [
  {
    icon: BookOpenIcon,
    title: 'Ripetizioni Personalizzate',
    description: 'Lezioni individuali su misura per ogni studente, con tutor qualificati e materiali didattici dedicati per ogni materia.',
    color: 'text-primary-400'
  },
  {
    icon: UserGroupIcon,
    title: 'Doposcuola Specializzato',
    description: 'Supporto completo per i compiti quotidiani con gruppi di studio organizzati e supervisione costante.',
    color: 'text-secondary'
  },
  {
    icon: AcademicCapIcon,
    title: 'Preparazione Test',
    description: 'Preparazione mirata per esami universitari, test di ammissione e certificazioni con simulazioni reali.',
    color: 'text-primary-300'
  },
  {
    icon: CalendarDaysIcon,
    title: 'Calendario Flessibile',
    description: 'Prenota lezioni quando vuoi, con un sistema di calendario integrato e possibilità di riprogrammare facilmente.',
    color: 'text-accent'
  },
  {
    icon: ChartBarIcon,
    title: 'Monitoraggio Progressi',
    description: 'Traccia i tuoi miglioramenti con analytics dettagliati, report personalizzati e feedback continuo.',
    color: 'text-primary-400'
  },
  {
    icon: ClockIcon,
    title: 'Disponibilità 24/7',
    description: 'Accesso ai materiali di studio e supporto online sempre disponibile, anche fuori dagli orari delle lezioni.',
    color: 'text-secondary'
  },
  {
    icon: CheckBadgeIcon,
    title: 'Tutor Certificati',
    description: 'Tutti i nostri tutor sono qualificati, verificati e specializzati nelle loro materie di competenza.',
    color: 'text-primary-300'
  },
  {
    icon: DocumentTextIcon,
    title: 'Materiali Inclusi',
    description: 'Accesso completo a risorse didattiche, esercizi, video-lezioni e materiali di approfondimento.',
    color: 'text-accent'
  }
];

export default function FeaturesSection() {
  return (
    <section className="relative py-16 sm:py-20 lg:py-24">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-primary-500/10 to-secondary/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-tl from-secondary/10 to-primary-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Spotlight className="text-center">
          {/* Section header */}
          <div className="mx-auto max-w-3xl mb-16">
            {/* Badge */}
            <div className="mb-8 inline-flex items-center rounded-full bg-primary-500/10 px-4 py-2 text-sm font-medium text-primary-300 ring-1 ring-primary-500/20 backdrop-blur-sm">
              <span>🎯 Servizi Completi</span>
            </div>

            {/* Title */}
            <h2 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              <span className="bg-gradient-to-r from-primary-300 via-primary-200 to-secondary bg-clip-text text-transparent">
                Tutto quello che serve
              </span>
              <br />
              per il tuo successo
            </h2>

            {/* Subtitle */}
            <p className="text-xl text-foreground-secondary leading-relaxed">
              Dalla ripetizione individuale alla preparazione test, offriamo un ecosistema completo 
              di servizi educativi per accompagnarti verso i tuoi obiettivi accademici.
            </p>
          </div>

          {/* Features grid */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <Card 
                key={index}
                variant="glass"
                spotlight
                className="group hover:scale-105 transition-all duration-300"
              >
                <CardContent className="p-6 text-center">
                  {/* Icon */}
                  <div className="mb-4 flex justify-center">
                    <div className="rounded-xl bg-gradient-to-br from-primary-500/20 to-secondary/20 p-3 backdrop-blur-sm">
                      <feature.icon 
                        className={`h-8 w-8 ${feature.color} transition-colors group-hover:scale-110 duration-300`} 
                      />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="mb-3 text-lg font-semibold text-foreground group-hover:text-primary-300 transition-colors">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-foreground-muted leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA Section */}
          <div className="mt-16 text-center">
            <div className="inline-flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
              <div className="text-sm text-foreground-muted">
                Più di <span className="font-semibold text-primary-300">500+ studenti</span> hanno già raggiunto i loro obiettivi
              </div>
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div 
                    key={i}
                    className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-400 to-secondary ring-2 ring-background flex items-center justify-center text-xs font-bold text-white"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
                <div className="h-8 w-8 rounded-full bg-background-secondary ring-2 ring-background flex items-center justify-center text-xs font-medium text-foreground-muted">
                  +495
                </div>
              </div>
            </div>
          </div>
        </Spotlight>
      </div>
    </section>
  );
}
