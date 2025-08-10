import HeroSection from '@/components/home/HeroSection'
import FeaturesSection from '@/components/home/FeaturesSection'
import HowItWorksSection from '@/components/home/HowItWorksSection'
import TestimonialsCarousel from '@/components/home/TestimonialsCarousel'
import CTASection from '@/components/home/CTASection'

export default function HomePage() {
  return (
    <>
      <div className="w-full">
        <HeroSection />

        <section className="w-full bg-white">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
            <FeaturesSection />
          </div>
        </section>

        <section className="w-full bg-white">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
            <HowItWorksSection />
          </div>
        </section>

        <TestimonialsCarousel />

        <CTASection />

        <footer className="bg-white py-8 sm:py-10 w-full">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
              <p className="text-xs text-gray-400 text-center sm:text-left">&copy; {new Date().getFullYear()} Student Platform</p>
              <nav className="flex items-center gap-4 text-sm text-gray-700 flex-wrap justify-center">
                <a href="#" className="hover:text-primary-700">Privacy</a>
                <a href="#" className="hover:text-primary-700">Termini</a>
                <a href="#" className="hover:text-primary-700">Contatti</a>
              </nav>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
