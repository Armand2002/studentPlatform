'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Spotlight from '@/components/ui/Spotlight';
import { 
  RocketLaunchIcon,
  AcademicCapIcon,
  TrophyIcon,
  SparklesIcon,
  ArrowRightIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const benefits = [
  { icon: RocketLaunchIcon, text: 'Inizia in 2 minuti' },
  { icon: AcademicCapIcon, text: 'Tutor qualificati' },
  { icon: TrophyIcon, text: 'Risultati garantiti' },
  { icon: SparklesIcon, text: 'Supporto 24/7' }
];

const stats = [
  { value: '500+', label: 'Studenti attivi' },
  { value: '50+', label: 'Tutor esperti' },
  { value: '95%', label: 'Tasso successo' },
  { value: '4.9/5', label: 'Rating medio' }
];

export default function CTASection() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleGetStarted = () => {
    // Simulate quick action
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background-secondary to-background-tertiary py-16 sm:py-20 lg:py-24">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-br from-primary-500/20 to-secondary/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-tl from-secondary/20 to-primary-400/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-gradient-to-r from-primary-500/10 to-secondary/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Spotlight className="text-center">
          {/* Main CTA Content */}
          <div className="mx-auto max-w-4xl">
            {/* Badge */}
            <div className="mb-8 inline-flex items-center rounded-full bg-primary-500/10 px-6 py-3 text-sm font-medium text-primary-300 ring-1 ring-primary-500/20 backdrop-blur-sm">
              <SparklesIcon className="mr-2 h-4 w-4" />
              <span>Offerta Lancio - Registrazione Gratuita</span>
            </div>

            {/* Main headline */}
            <h2 className="mb-8 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              <span className="bg-gradient-to-r from-primary-300 via-secondary to-primary-200 bg-clip-text text-transparent">
                Trasforma il tuo futuro
              </span>
              <br />
              <span className="text-foreground">
                accademico oggi stesso
              </span>
            </h2>

            {/* Compelling subtitle */}
            <p className="mx-auto mb-12 max-w-3xl text-xl text-foreground-secondary leading-relaxed">
              Unisciti a <strong className="text-primary-300">500+ studenti</strong> che hanno già migliorato 
              i loro voti e raggiunto i loro obiettivi con la nostra piattaforma di tutoring professionale.
            </p>

            {/* Benefits grid */}
            <div className="mb-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex flex-col items-center gap-2 p-4 rounded-lg bg-background-secondary/50 backdrop-blur-sm border border-border/50">
                  <benefit.icon className="h-6 w-6 text-primary-400" />
                  <span className="text-sm font-medium text-foreground text-center">{benefit.text}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
              {!isSubmitted ? (
                <>
                  <Button
                    variant="gradient"
                    size="lg"
                    spotlight
                    onClick={handleGetStarted}
                    className="group min-w-[200px]"
                  >
                    <span className="inline-flex items-center">
                      Inizia Gratuitamente
                      <ArrowRightIcon className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Button>
                  <a href="#contact">
                    <Button
                      variant="outline"
                      size="lg"
                      spotlight
                      className="min-w-[200px]"
                    >
                      Richiedi Demo
                    </Button>
                  </a>
                </>
              ) : (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <CheckCircleIcon className="h-6 w-6 text-green-400" />
                  <span className="text-green-400 font-medium">Perfetto! Ti stiamo reindirizzando...</span>
                </div>
              )}
            </div>

            {/* Trust indicators */}
            <div className="mb-12">
              <p className="mb-6 text-sm text-foreground-muted">
                Trusted by students from top universities
              </p>
              <div className="flex flex-wrap justify-center gap-8 opacity-60">
                <div className="text-xs font-medium text-foreground-muted">Università Bocconi</div>
                <div className="text-xs font-medium text-foreground-muted">La Sapienza</div>
                <div className="text-xs font-medium text-foreground-muted">Politecnico Milano</div>
                <div className="text-xs font-medium text-foreground-muted">Università Bologna</div>
              </div>
            </div>

            {/* Stats section */}
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 p-8 rounded-2xl bg-gradient-to-br from-primary-500/10 to-secondary/10 backdrop-blur-sm border border-primary-500/20">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-primary-300 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-foreground-muted">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Final urgency message */}
            <div className="mt-8 text-center">
              <p className="text-sm text-foreground-muted">
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></span>
                  <strong className="text-primary-300">23 studenti</strong> si sono registrati oggi
                </span>
              </p>
            </div>
          </div>
        </Spotlight>
      </div>
    </section>
  );
}


