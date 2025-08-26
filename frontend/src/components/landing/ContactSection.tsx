'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Spotlight from '@/components/ui/Spotlight';
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
  service: string;
}

const contactInfo = [
  {
    icon: EnvelopeIcon,
    title: 'Email',
    details: 'info@tutoringpro.com',
    description: 'Rispondiamo entro 24 ore'
  },
  {
    icon: PhoneIcon,
    title: 'Telefono',
    details: '+39 02 1234 5678',
    description: 'Lun-Ven 9:00-18:00'
  },
  {
    icon: MapPinIcon,
    title: 'Sede',
    details: 'Milano, Roma, Napoli',
    description: 'Lezioni anche in presenza'
  },
  {
    icon: ClockIcon,
    title: 'Supporto',
    details: '24/7 Online',
    description: 'Chat e email sempre attivi'
  }
];

export default function ContactSection() {
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    subject: '',
    message: '',
    service: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        service: ''
      });
    }, 3000);
  };

  return (
    <section className="relative py-16 sm:py-20 lg:py-24 bg-background">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-gradient-to-br from-primary-500/10 to-secondary/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-gradient-to-tr from-secondary/10 to-primary-400/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-gradient-to-tl from-primary-500/10 to-secondary/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Spotlight>
          {/* Section header */}
          <div className="mx-auto max-w-3xl mb-16 text-center">
            {/* Badge */}
            <div className="mb-8 inline-flex items-center rounded-full bg-secondary/10 px-4 py-2 text-sm font-medium text-secondary ring-1 ring-secondary/20 backdrop-blur-sm">
              <span>📞 Contattaci</span>
            </div>

            {/* Title */}
            <h2 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              <span className="bg-gradient-to-r from-secondary via-primary-300 to-primary-200 bg-clip-text text-transparent">
                Inizia il tuo percorso
              </span>
              <br />
              di successo oggi
            </h2>

            {/* Subtitle */}
            <p className="text-xl text-foreground-secondary leading-relaxed">
              Hai domande sui nostri servizi? Vuoi un preventivo personalizzato? 
              Il nostro team è qui per aiutarti a trovare la soluzione perfetta.
            </p>
          </div>

          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-6">
                  Come puoi raggiungerci
                </h3>
                <p className="text-foreground-muted leading-relaxed mb-8">
                  Scegli il metodo che preferisci per entrare in contatto con noi. 
                  Siamo sempre pronti ad aiutarti a trovare il tutor perfetto per le tue esigenze.
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                {contactInfo.map((info, index) => (
                  <Card key={index} variant="glass" className="p-6">
                    <CardContent className="p-0">
                      <div className="flex items-start gap-4">
                        <div className="rounded-lg bg-gradient-to-br from-primary-500/20 to-secondary/20 p-2">
                          <info.icon className="h-6 w-6 text-primary-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground mb-1">
                            {info.title}
                          </h4>
                          <p className="text-primary-300 font-medium mb-1">
                            {info.details}
                          </p>
                          <p className="text-sm text-foreground-muted">
                            {info.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Quick stats */}
              <Card variant="gradient" className="p-6">
                <CardContent className="p-0">
                  <div className="text-center">
                    <h4 className="font-semibold text-foreground mb-4">
                      Perché scegliere TutoringPro?
                    </h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-2xl font-bold text-primary-300">24h</div>
                        <div className="text-xs text-foreground-muted">Tempo di risposta</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-primary-300">98%</div>
                        <div className="text-xs text-foreground-muted">Soddisfazione</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-primary-300">500+</div>
                        <div className="text-xs text-foreground-muted">Studenti felici</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <Card variant="glass" spotlight className="p-8">
              <CardContent className="p-0">
                {!isSubmitted ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold text-foreground mb-6">
                        Invia un messaggio
                      </h3>
                    </div>

                    {/* Name */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                        Nome completo *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-foreground-muted focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                        placeholder="Il tuo nome e cognome"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-foreground-muted focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                        placeholder="la-tua-email@esempio.com"
                      />
                    </div>

                    {/* Service */}
                    <div>
                      <label htmlFor="service" className="block text-sm font-medium text-foreground mb-2">
                        Servizio di interesse
                      </label>
                      <select
                        id="service"
                        name="service"
                        value={formData.service}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                      >
                        <option value="">Seleziona un servizio</option>
                        <option value="ripetizioni">Ripetizioni Individuali</option>
                        <option value="doposcuola">Doposcuola di Gruppo</option>
                        <option value="test">Preparazione Test</option>
                        <option value="altro">Altro</option>
                      </select>
                    </div>

                    {/* Subject */}
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                        Oggetto *
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        required
                        value={formData.subject}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-foreground-muted focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                        placeholder="Di cosa vorresti parlare?"
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                        Messaggio *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        rows={5}
                        value={formData.message}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-foreground-muted focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none"
                        placeholder="Raccontaci le tue esigenze e come possiamo aiutarti..."
                      />
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      variant="gradient"
                      size="lg"
                      loading={isSubmitting}
                      className="w-full"
                      spotlight
                    >
                      {isSubmitting ? 'Invio in corso...' : 'Invia Messaggio'}
                    </Button>

                    <p className="text-xs text-foreground-muted text-center">
                      Rispondiamo solitamente entro 24 ore. I tuoi dati sono protetti e non verranno condivisi.
                    </p>
                  </form>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-foreground mb-2">
                      Messaggio inviato!
                    </h3>
                    <p className="text-foreground-muted">
                      Grazie per averci contattato. Ti risponderemo al più presto.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </Spotlight>
      </div>
    </section>
  );
}
