import HeroSection from '@/components/home/HeroSection'
import FeaturesSection from '@/components/home/FeaturesSection'
import HowItWorksSection from '@/components/home/HowItWorksSection'
import TestimonialsSection from '@/components/home/TestimonialsSection'
import CTASection from '@/components/home/CTASection'

export default function HomePage() {
  return (
    <>
      <div className="w-full">
        <HeroSection />

        <section className="w-full bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <FeaturesSection />
          </div>
        </section>

        <section className="w-full bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <HowItWorksSection />
          </div>
        </section>

        <section className="w-full bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <TestimonialsSection />
          </div>
        </section>

        <CTASection />

        <footer className="bg-white py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} Student Platform</p>
              <div className="flex items-center gap-4 text-sm text-gray-700">
                <a href="#" className="hover:text-primary-700">Privacy</a>
                <a href="#" className="hover:text-primary-700">Termini</a>
                <a href="#" className="hover:text-primary-700">Contatti</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
