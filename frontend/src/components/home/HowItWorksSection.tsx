'use client';

import { Card, CardContent } from '@/components/ui/Card';
import Spotlight from '@/components/ui/Spotlight';
import { 
  UserPlusIcon,
  Cog6ToothIcon,
  CalendarDaysIcon,
  ChartBarSquareIcon
} from '@heroicons/react/24/outline';

const steps = [
  { 
    n: 1, 
    title: 'Crea il tuo Account', 
    desc: 'Registrati come studente o tutor in meno di 2 minuti. Processo semplice e sicuro.',
    icon: UserPlusIcon,
    color: 'text-primary-400'
  },
  { 
    n: 2, 
    title: 'Configura il Profilo', 
    desc: 'Personalizza materie, disponibilità, tariffe e preferenze per un\'esperienza su misura.',
    icon: Cog6ToothIcon,
    color: 'text-secondary'
  },
  { 
    n: 3, 
    title: 'Prenota o Insegna', 
    desc: 'Visualizza calendari in tempo reale e conferma lezioni con un semplice click.',
    icon: CalendarDaysIcon,
    color: 'text-primary-300'
  },
  { 
    n: 4, 
    title: 'Monitora i Progressi', 
    desc: 'Traccia risultati, feedback e statistiche per ottimizzare il tuo percorso di apprendimento.',
    icon: ChartBarSquareIcon,
    color: 'text-accent'
  },
];

export default function HowItWorksSection() {
  return (
    <section className="relative py-16 sm:py-20 lg:py-24">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-secondary/10 to-primary-400/10 blur-3xl" />
        <div className="absolute bottom-1/4 -right-40 h-80 w-80 rounded-full bg-gradient-to-tl from-primary-500/10 to-secondary/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Spotlight className="text-center">
          {/* Section header */}
          <div className="mx-auto max-w-3xl mb-16">
            {/* Badge */}
            <div className="mb-8 inline-flex items-center rounded-full bg-accent/10 px-4 py-2 text-sm font-medium text-accent ring-1 ring-accent/20 backdrop-blur-sm">
              <span>🚀 Processo Semplice</span>
            </div>

            {/* Title */}
            <h2 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              <span className="bg-gradient-to-r from-accent via-primary-300 to-secondary bg-clip-text text-transparent">
                Come funziona
              </span>
              <br />
              la nostra piattaforma
            </h2>

            {/* Subtitle */}
            <p className="text-xl text-foreground-secondary leading-relaxed">
              In soli 4 semplici passaggi, puoi iniziare il tuo percorso verso il successo accademico. 
              Processo intuitivo, veloce e completamente personalizzabile.
            </p>
          </div>

          {/* Steps grid */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <Card 
                key={step.n}
                variant="glass"
                spotlight
                className="group relative hover:scale-105 transition-all duration-300"
              >
                <CardContent className="p-8 text-center">
                  {/* Step number */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary flex items-center justify-center text-white text-sm font-bold shadow-lg">
                      {step.n}
                    </div>
                  </div>

                  {/* Icon */}
                  <div className="mb-6 flex justify-center">
                    <div className="rounded-xl bg-gradient-to-br from-primary-500/20 to-secondary/20 p-4 backdrop-blur-sm">
                      <step.icon 
                        className={`h-8 w-8 ${step.color} transition-all group-hover:scale-110 duration-300`} 
                      />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="mb-4 text-xl font-semibold text-foreground group-hover:text-primary-300 transition-colors">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-foreground-muted leading-relaxed">
                    {step.desc}
                  </p>

                  {/* Connection line (except last item) */}
                  {index < steps.length - 1 && (
                    <div className="absolute top-1/2 -right-4 hidden lg:block">
                      <div className="h-px w-8 bg-gradient-to-r from-primary-400/50 to-transparent" />
                      <div className="absolute -top-1 right-0 h-2 w-2 rounded-full bg-primary-400/50" />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-16 text-center">
            <div className="inline-flex flex-col items-center gap-4 p-6 rounded-xl bg-gradient-to-br from-primary-500/10 to-secondary/10 backdrop-blur-sm border border-primary-500/20">
              <h3 className="text-xl font-semibold text-foreground">
                Pronto a iniziare il tuo percorso?
              </h3>
              <p className="text-foreground-muted max-w-md">
                Migliaia di studenti hanno già trasformato il loro apprendimento con la nostra piattaforma
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href="/register"
                  className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors"
                >
                  Registrati Gratis
                </a>
                <a 
                  href="#contact"
                  className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-foreground border border-border hover:bg-background-tertiary rounded-lg transition-colors"
                >
                  Scopri di Più
                </a>
              </div>
            </div>
          </div>
        </Spotlight>
      </div>
    </section>
  );
}


