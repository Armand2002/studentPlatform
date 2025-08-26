'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Spotlight from '@/components/ui/Spotlight';
import { ArrowRightIcon, PlayIcon } from '@heroicons/react/24/outline';

export default function HeroSection() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background-secondary to-background-tertiary">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-br from-primary-500/20 to-secondary/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-tr from-secondary/20 to-primary-400/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-20 sm:py-24 lg:py-32">
          <Spotlight className="text-center">
            {/* Hero content */}
            <div className="mx-auto max-w-4xl">
              {/* Badge */}
              <div className="mb-8 inline-flex items-center rounded-full bg-primary-500/10 px-4 py-2 text-sm font-medium text-primary-300 ring-1 ring-primary-500/20 backdrop-blur-sm">
                <span>🎓 Piattaforma di Tutoring Professionale</span>
              </div>

              {/* Main heading */}
              <h1 className="title-hero mb-8 bg-gradient-to-r from-primary-300 via-primary-200 to-secondary bg-clip-text text-transparent">
                Trasforma il tuo{' '}
                <span className="relative">
                  apprendimento
                  <div className="absolute -bottom-2 left-0 h-3 w-full bg-gradient-to-r from-primary-400/30 to-secondary/30 rounded-full transform rotate-1" />
                </span>{' '}
                con tutor esperti
              </h1>

              {/* Subtitle */}
              <p className="mx-auto mb-10 max-w-2xl text-xl text-foreground-secondary leading-relaxed">
                Connettiti con tutor qualificati per lezioni personalizzate, 
                doposcuola specializzato e preparazione test. 
                La tua strada verso il successo inizia qui.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
                <Button
                  variant="gradient"
                  size="lg"
                  spotlight
                  className="group"
                >
                  Inizia Subito
                  <ArrowRightIcon className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setIsVideoOpen(true)}
                  className="group"
                >
                  <PlayIcon className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                  Guarda il Video
                </Button>
              </div>

              {/* Stats */}
              <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-300">500+</div>
                  <div className="text-sm text-foreground-muted">Studenti Soddisfatti</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-300">50+</div>
                  <div className="text-sm text-foreground-muted">Tutor Esperti</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-300">95%</div>
                  <div className="text-sm text-foreground-muted">Tasso di Successo</div>
                </div>
              </div>
            </div>
          </Spotlight>
        </div>
      </div>

      {/* Video Modal - placeholder */}
      {isVideoOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setIsVideoOpen(false)}
        >
          <div className="relative max-w-4xl mx-4 bg-background-secondary rounded-xl overflow-hidden shadow-2xl border border-border">
            <button
              onClick={() => setIsVideoOpen(false)}
              className="absolute top-4 right-4 z-10 rounded-full bg-background/80 p-2 text-foreground hover:bg-background transition-colors backdrop-blur-sm"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="aspect-video bg-background flex items-center justify-center">
              <div className="text-foreground text-center">
                <PlayIcon className="mx-auto h-16 w-16 mb-4 opacity-50" />
                <p className="text-lg">Video Demo Coming Soon</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
