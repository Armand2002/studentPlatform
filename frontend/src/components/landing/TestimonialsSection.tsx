'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import Spotlight from '@/components/ui/Spotlight';
import { ChevronLeftIcon, ChevronRightIcon, StarIcon } from '@heroicons/react/24/solid';
import { AcademicCapIcon, BookOpenIcon, UserGroupIcon } from '@heroicons/react/24/outline';

const testimonials = [
  {
    id: 1,
    name: 'Marco Rossi',
    role: 'Studente Universitario',
    subject: 'Matematica',
    rating: 5,
    content: 'Grazie alle ripetizioni personalizzate sono riuscito a superare l\'esame di Analisi Matematica con 28/30. Il tutor era molto preparato e paziente.',
    avatar: 'MR',
    category: 'ripetizioni'
  },
  {
    id: 2,
    name: 'Sofia Bianchi',
    role: 'Studentessa Liceo',
    subject: 'Fisica e Chimica',
    rating: 5,
    content: 'Il doposcuola mi ha aiutato moltissimo a organizzare lo studio. Ora riesco a gestire meglio i compiti e ho migliorato i voti in tutte le materie scientifiche.',
    avatar: 'SB',
    category: 'doposcuola'
  },
  {
    id: 3,
    name: 'Alessandro Verde',
    role: 'Diplomando',
    subject: 'Preparazione Test Medicina',
    rating: 5,
    content: 'La preparazione per il test di medicina è stata eccellente. Simulazioni continue, materiali aggiornati e un supporto costante. Sono entrato alla Sapienza!',
    avatar: 'AV',
    category: 'test'
  },
  {
    id: 4,
    name: 'Giulia Neri',
    role: 'Studentessa Università',
    subject: 'Inglese e Letteratura',
    rating: 5,
    content: 'Le lezioni online sono comodissime e molto efficaci. Ho migliorato il mio inglese da B1 a C1 in soli 6 mesi di corso intensivo.',
    avatar: 'GN',
    category: 'ripetizioni'
  },
  {
    id: 5,
    name: 'Matteo Blu',
    role: 'Studente Liceo',
    subject: 'Latino e Greco',
    rating: 5,
    content: 'Pensavo che latino e greco fossero impossibili per me. Con il giusto metodo di studio e un tutor esperto, ora sono le mie materie preferite!',
    avatar: 'MB',
    category: 'doposcuola'
  },
  {
    id: 6,
    name: 'Elena Gialli',
    role: 'Diplomanda',
    subject: 'Preparazione Test Ingegneria',
    rating: 5,
    content: 'Ottima preparazione per il test di ingegneria. Esercizi mirati, teoria chiara e tanta pratica. Ho ottenuto un punteggio che mi ha permesso di entrare al Politecnico.',
    avatar: 'EG',
    category: 'test'
  }
];

const categories = [
  { id: 'all', label: 'Tutti', icon: UserGroupIcon },
  { id: 'ripetizioni', label: 'Ripetizioni', icon: BookOpenIcon },
  { id: 'doposcuola', label: 'Doposcuola', icon: UserGroupIcon },
  { id: 'test', label: 'Preparazione Test', icon: AcademicCapIcon }
];

export default function TestimonialsSection() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [currentIndex, setCurrentIndex] = useState(0);

  const filteredTestimonials = activeCategory === 'all' 
    ? testimonials 
    : testimonials.filter(t => t.category === activeCategory);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredTestimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + filteredTestimonials.length) % filteredTestimonials.length);
  };

  const currentTestimonial = filteredTestimonials[currentIndex];

  return (
    <section className="relative py-16 sm:py-20 lg:py-24 bg-background">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-secondary/10 to-primary-400/10 blur-3xl" />
        <div className="absolute top-1/2 -right-40 h-80 w-80 rounded-full bg-gradient-to-bl from-primary-500/10 to-secondary/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Spotlight className="text-center">
          {/* Section header */}
          <div className="mx-auto max-w-3xl mb-16">
            {/* Badge */}
            <div className="mb-8 inline-flex items-center rounded-full bg-secondary/10 px-4 py-2 text-sm font-medium text-secondary ring-1 ring-secondary/20 backdrop-blur-sm">
              <span>⭐ Testimonianze</span>
            </div>

            {/* Title */}
            <h2 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              <span className="bg-gradient-to-r from-secondary via-primary-300 to-primary-200 bg-clip-text text-transparent">
                Storie di successo
              </span>
              <br />
              dei nostri studenti
            </h2>

            {/* Subtitle */}
            <p className="text-xl text-foreground-secondary leading-relaxed">
              Scopri come centinaia di studenti hanno raggiunto i loro obiettivi accademici 
              grazie ai nostri servizi personalizzati di tutoring.
            </p>
          </div>

          {/* Category filters */}
          <div className="mb-12 flex justify-center">
            <div className="inline-flex rounded-xl bg-background-secondary/80 p-1 backdrop-blur-sm">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setActiveCategory(category.id);
                    setCurrentIndex(0);
                  }}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    activeCategory === category.id
                      ? 'bg-primary-500 text-white shadow-lg'
                      : 'text-foreground-muted hover:text-foreground hover:bg-background-tertiary/50'
                  }`}
                >
                  <category.icon className="h-4 w-4" />
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {/* Testimonial carousel */}
          {currentTestimonial && (
            <div className="mx-auto max-w-4xl">
              <Card variant="glass" spotlight className="p-8 sm:p-12">
                <CardContent className="text-center space-y-6">
                  {/* Stars rating */}
                  <div className="flex justify-center gap-1">
                    {[...Array(currentTestimonial.rating)].map((_, i) => (
                      <StarIcon key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>

                  {/* Quote */}
                  <blockquote className="text-xl sm:text-2xl text-foreground leading-relaxed">
                    "{currentTestimonial.content}"
                  </blockquote>

                  {/* Author info */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    {/* Avatar */}
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary-500 to-secondary flex items-center justify-center text-white font-bold text-lg">
                      {currentTestimonial.avatar}
                    </div>

                    {/* Details */}
                    <div className="text-center sm:text-left">
                      <div className="font-semibold text-foreground text-lg">
                        {currentTestimonial.name}
                      </div>
                      <div className="text-foreground-muted">
                        {currentTestimonial.role}
                      </div>
                      <div className="text-sm text-primary-300 font-medium">
                        {currentTestimonial.subject}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Navigation */}
              <div className="flex justify-center items-center gap-4 mt-8">
                <button
                  onClick={prevTestimonial}
                  className="p-2 rounded-full bg-background-secondary hover:bg-background-tertiary transition-colors"
                  disabled={filteredTestimonials.length <= 1}
                >
                  <ChevronLeftIcon className="h-6 w-6 text-foreground" />
                </button>

                {/* Dots indicator */}
                <div className="flex gap-2">
                  {filteredTestimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`h-2 w-2 rounded-full transition-all duration-200 ${
                        index === currentIndex
                          ? 'bg-primary-500 w-6'
                          : 'bg-background-tertiary hover:bg-foreground-muted'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={nextTestimonial}
                  className="p-2 rounded-full bg-background-secondary hover:bg-background-tertiary transition-colors"
                  disabled={filteredTestimonials.length <= 1}
                >
                  <ChevronRightIcon className="h-6 w-6 text-foreground" />
                </button>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-300 mb-2">98%</div>
              <div className="text-foreground-muted">Tasso di soddisfazione</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-300 mb-2">500+</div>
              <div className="text-foreground-muted">Studenti seguiti</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-300 mb-2">95%</div>
              <div className="text-foreground-muted">Obiettivi raggiunti</div>
            </div>
          </div>
        </Spotlight>
      </div>
    </section>
  );
}
