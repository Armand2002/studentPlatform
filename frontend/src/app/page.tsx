import { Metadata } from 'next'
import HeroSection from '@/components/landing/HeroSection'
import FeaturesSection from '@/components/landing/FeaturesSection'
import TestimonialsSection from '@/components/landing/TestimonialsSection'
import FAQSection from '@/components/landing/FAQSection'
import ContactSection from '@/components/landing/ContactSection'
import Footer from '@/components/layout/Footer'
import HowItWorksSection from '@/components/home/HowItWorksSection'
import CTASection from '@/components/home/CTASection'

export const metadata: Metadata = {
  title: 'TutoringPro - Ripetizioni, Doposcuola e Preparazione Test | Piattaforma #1 in Italia',
  description: 'Scopri TutoringPro: la piattaforma leader per ripetizioni personalizzate, doposcuola specializzato e preparazione test. Oltre 500 studenti soddisfatti, tutor qualificati e risultati garantiti. Inizia oggi!',
  keywords: [
    'ripetizioni',
    'doposcuola',
    'preparazione test',
    'tutor',
    'lezioni private',
    'matematica',
    'fisica',
    'chimica',
    'inglese',
    'latino',
    'università',
    'liceo',
    'test medicina',
    'test ingegneria'
  ],
  authors: [{ name: 'TutoringPro Team' }],
  creator: 'TutoringPro',
  publisher: 'TutoringPro',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'TutoringPro - La Piattaforma #1 per Ripetizioni e Doposcuola',
    description: 'Connettiti con tutor qualificati per ripetizioni personalizzate, doposcuola specializzato e preparazione test. Oltre 500 studenti hanno già raggiunto i loro obiettivi con noi.',
    url: 'https://tutoringpro.com',
    siteName: 'TutoringPro',
    locale: 'it_IT',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'TutoringPro - Piattaforma di Tutoring Professionale',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TutoringPro - Ripetizioni e Doposcuola con Tutor Qualificati',
    description: 'La piattaforma leader in Italia per ripetizioni, doposcuola e preparazione test. Tutor certificati, risultati garantiti.',
    images: ['/twitter-image.jpg'],
    creator: '@tutoringpro',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function HomePage() {
  return (
    <>
      <div className="w-full">
        <HeroSection />

        <section id="features" className="w-full bg-background-secondary">
          <FeaturesSection />
        </section>

        <section id="testimonials">
          <TestimonialsSection />
        </section>

        <section id="faq">
          <FAQSection />
        </section>

        <section id="contact">
          <ContactSection />
        </section>

        <section className="w-full bg-background-secondary">
          <div className="container-app section-wrap">
            <HowItWorksSection />
          </div>
        </section>

        <CTASection />

        <Footer />
      </div>
    </>
  )
}
