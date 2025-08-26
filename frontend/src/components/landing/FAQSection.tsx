'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import Spotlight from '@/components/ui/Spotlight';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

const faqs = [
  {
    id: 1,
    question: 'Come funziona il sistema di prenotazioni?',
    answer: 'Il sistema è molto semplice: dopo la registrazione, puoi accedere al calendario interattivo, selezionare il tutor e l\'orario che preferisci. Riceverai una conferma immediata via email e potrai gestire le tue prenotazioni dal dashboard personale.'
  },
  {
    id: 2,
    question: 'Quali materie sono disponibili?',
    answer: 'Offriamo supporto per tutte le materie scolastiche e universitarie: matematica, fisica, chimica, inglese, italiano, latino, greco, storia, filosofia, economia, informatica e molte altre. I nostri tutor sono specializzati e qualificati in ogni area di studio.'
  },
  {
    id: 3,
    question: 'Come vengono selezionati i tutor?',
    answer: 'Tutti i nostri tutor passano attraverso un rigoroso processo di selezione che include: verifica del curriculum, test di competenza nella materia, colloquio motivazionale e prova pratica di insegnamento. Solo i migliori vengono accettati nella nostra piattaforma.'
  },
  {
    id: 4,
    question: 'Posso cambiare tutor se non sono soddisfatto?',
    answer: 'Assolutamente sì! La soddisfazione dello studente è la nostra priorità. Se non ti trovi bene con un tutor, puoi richiedere il cambio in qualsiasi momento. Ti aiuteremo a trovare il tutor più adatto alle tue esigenze e al tuo stile di apprendimento.'
  },
  {
    id: 5,
    question: 'Le lezioni sono solo online o anche in presenza?',
    answer: 'Offriamo entrambe le modalità! Puoi scegliere lezioni online tramite la nostra piattaforma integrata con video-chiamata, oppure lezioni in presenza nelle principali città italiane. La modalità online è disponibile 24/7, mentre per le lezioni in presenza dipende dalla disponibilità del tutor nella tua zona.'
  },
  {
    id: 6,
    question: 'Quanto costano le lezioni?',
    answer: 'I prezzi variano in base al tipo di servizio: le ripetizioni individuali partono da €15/ora, il doposcuola di gruppo da €8/ora, mentre la preparazione per test specifici ha tariffe personalizzate. Offriamo anche pacchetti scontati per chi prenota più ore. Contattaci per un preventivo personalizzato!'
  },
  {
    id: 7,
    question: 'Come posso monitorare i progressi?',
    answer: 'Ogni studente ha accesso a un dashboard personale dove può visualizzare: ore di studio completate, voti e feedback dei tutor, materiali di studio scaricati, prossimi appuntamenti e un grafico dei progressi nel tempo. I tutor forniscono anche report periodici dettagliati.'
  },
  {
    id: 8,
    question: 'Cosa succede se devo cancellare una lezione?',
    answer: 'Puoi cancellare o riprogrammare una lezione fino a 24 ore prima dell\'orario previsto senza alcun costo aggiuntivo. Per cancellazioni con meno di 24 ore di preavviso, potrebbe essere applicata una penale del 50%. Le cancellazioni per motivi di salute sono sempre gratuite con certificato medico.'
  }
];

export default function FAQSection() {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (id: number) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <section className="relative py-16 sm:py-20 lg:py-24 bg-background-secondary">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-40 h-96 w-96 rounded-full bg-gradient-to-br from-primary-500/10 to-secondary/10 blur-3xl" />
        <div className="absolute bottom-1/4 -right-40 h-96 w-96 rounded-full bg-gradient-to-tl from-secondary/10 to-primary-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Spotlight className="text-center">
          {/* Section header */}
          <div className="mx-auto max-w-3xl mb-16">
            {/* Badge */}
            <div className="mb-8 inline-flex items-center rounded-full bg-primary-500/10 px-4 py-2 text-sm font-medium text-primary-300 ring-1 ring-primary-500/20 backdrop-blur-sm">
              <span>❓ Domande Frequenti</span>
            </div>

            {/* Title */}
            <h2 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              <span className="bg-gradient-to-r from-primary-300 via-primary-200 to-secondary bg-clip-text text-transparent">
                Hai delle domande?
              </span>
              <br />
              Abbiamo le risposte
            </h2>

            {/* Subtitle */}
            <p className="text-xl text-foreground-secondary leading-relaxed">
              Trova rapidamente le risposte alle domande più comuni sui nostri servizi, 
              prezzi e modalità di funzionamento della piattaforma.
            </p>
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-4">
            {faqs.map((faq) => {
              const isOpen = openItems.includes(faq.id);
              
              return (
                <Card 
                  key={faq.id}
                  variant="glass"
                  className="text-left overflow-hidden"
                >
                  <button
                    onClick={() => toggleItem(faq.id)}
                    className="w-full p-6 flex items-center justify-between text-left hover:bg-primary-500/5 transition-colors"
                  >
                    <h3 className="text-lg font-semibold text-foreground pr-4">
                      {faq.question}
                    </h3>
                    <ChevronDownIcon 
                      className={cn(
                        'h-6 w-6 text-primary-400 transition-transform duration-300 flex-shrink-0',
                        isOpen && 'rotate-180'
                      )}
                    />
                  </button>
                  
                  <div className={cn(
                    'overflow-hidden transition-all duration-300 ease-in-out',
                    isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  )}>
                    <div className="px-6 pb-6">
                      <div className="h-px bg-border mb-4" />
                      <p className="text-foreground-muted leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* CTA Bottom */}
          <div className="mt-16 text-center">
            <div className="inline-flex flex-col items-center gap-4 p-6 rounded-xl bg-gradient-to-br from-primary-500/10 to-secondary/10 backdrop-blur-sm border border-primary-500/20">
              <h3 className="text-xl font-semibold text-foreground">
                Non hai trovato la risposta che cercavi?
              </h3>
              <p className="text-foreground-muted">
                Il nostro team di supporto è sempre disponibile per aiutarti
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href="mailto:support@tutoringpro.com"
                  className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors"
                >
                  Contatta il Supporto
                </a>
                <a 
                  href="#contact"
                  className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-foreground border border-border hover:bg-background-tertiary rounded-lg transition-colors"
                >
                  Invia un Messaggio
                </a>
              </div>
            </div>
          </div>
        </Spotlight>
      </div>
    </section>
  );
}
