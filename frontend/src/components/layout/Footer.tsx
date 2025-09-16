import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon 
} from '@heroicons/react/24/outline';

const footerLinks = {
  servizi: [
    { name: 'Ripetizioni Individuali', href: '/servizi/ripetizioni' },
    { name: 'Doposcuola di Gruppo', href: '/servizi/doposcuola' },
    { name: 'Preparazione Test', href: '/servizi/test' },
    { name: 'Lezioni Online', href: '/servizi/online' }
  ],
  materie: [
    { name: 'Matematica', href: '/materie/matematica' },
    { name: 'Fisica e Chimica', href: '/materie/scienze' },
    { name: 'Lingue Straniere', href: '/materie/lingue' },
    { name: 'Materie Umanistiche', href: '/materie/umanistiche' }
  ],
  supporto: [
    { name: 'Come Funziona', href: '/come-funziona' },
    { name: 'Domande Frequenti', href: '/faq' },
    { name: 'Contatti', href: '/contact' },
    { name: 'Supporto Tecnico', href: '/supporto' }
  ],
  legale: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Termini di Servizio', href: '/termini' },
    { name: 'Cookie Policy', href: '/cookie' },
    { name: 'Disclaimer', href: '/disclaimer' }
  ]
};

const socialLinks = [
  {
    name: 'Facebook',
    href: 'https://facebook.com/tutoringpro',
    icon: (
      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    )
  },
  {
    name: 'Instagram',
    href: 'https://instagram.com/tutoringpro',
    icon: (
      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.621 5.367 11.988 11.988 11.988s11.987-5.367 11.987-11.988C24.004 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.596-3.205-1.534l1.464-1.464c.51.51 1.207.825 1.98.825 1.551 0 2.809-1.258 2.809-2.809s-1.258-2.809-2.809-2.809c-.773 0-1.47.315-1.98.825L4.244 8.558c.757-.938 1.908-1.534 3.205-1.534 2.344 0 4.244 1.9 4.244 4.244s-1.9 4.244-4.244 4.244z"/>
      </svg>
    )
  },
  {
    name: 'LinkedIn',
    href: 'https://linkedin.com/company/tutoringpro',
    icon: (
      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    )
  },
  {
    name: 'YouTube',
    href: 'https://youtube.com/@tutoringpro',
    icon: (
      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    )
  }
];

export default function Footer() {
  return (
    <footer className="bg-background-tertiary border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="py-16">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
            {/* Brand section */}
            <div className="lg:col-span-2">
              <Logo size="md" />
              <p className="mt-4 text-foreground-muted leading-relaxed max-w-md">
                La piattaforma leader in Italia per ripetizioni, doposcuola e preparazione test. 
                Connetti con tutor qualificati e raggiungi i tuoi obiettivi accademici.
              </p>
              
              {/* Contact info */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-sm text-foreground-muted">
                  <EnvelopeIcon className="h-4 w-4 text-primary-400" />
                  <a href="mailto:info@tutoringpro.com" className="hover:text-foreground transition-colors">
                    info@tutoringpro.com
                  </a>
                </div>
                <div className="flex items-center gap-3 text-sm text-foreground-muted">
                  <PhoneIcon className="h-4 w-4 text-primary-400" />
                  <a href="tel:+390212345678" className="hover:text-foreground transition-colors">
                    +39 02 1234 5678
                  </a>
                </div>
                <div className="flex items-center gap-3 text-sm text-foreground-muted">
                  <MapPinIcon className="h-4 w-4 text-primary-400" />
                  <span>Milano, Roma, Napoli</span>
                </div>
              </div>

              {/* Social links */}
              <div className="mt-6">
                <p className="text-sm font-medium text-foreground mb-3">Seguici sui social</p>
                <div className="flex gap-4">
                  {socialLinks.map((social) => (
                    <a
                      key={social.name}
                      href={social.href}
                      className="text-foreground-muted hover:text-primary-400 transition-colors"
                      aria-label={social.name}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Links sections */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">Servizi</h3>
              <ul className="space-y-3">
                {footerLinks.servizi.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href as any}
                      className="text-sm text-foreground-muted hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">Materie</h3>
              <ul className="space-y-3">
                {footerLinks.materie.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href as any}
                      className="text-sm text-foreground-muted hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">Supporto</h3>
              <ul className="space-y-3">
                {footerLinks.supporto.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href as any}
                      className="text-sm text-foreground-muted hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-border py-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex flex-wrap items-center gap-4 text-xs text-foreground-muted">
              {footerLinks.legale.map((link, index) => (
                <span key={link.name} className="flex items-center">
                  <Link 
                    href={link.href as any}
                    className="hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                  {index < footerLinks.legale.length - 1 && (
                    <span className="ml-4 text-border">•</span>
                  )}
                </span>
              ))}
            </div>
            
            <p className="text-xs text-foreground-muted text-center sm:text-right">
              © {new Date().getFullYear()} TutoringPro. Tutti i diritti riservati.
              <br className="sm:hidden" />
              <span className="hidden sm:inline"> • </span>
              Sviluppato con ❤️ in Italia
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
