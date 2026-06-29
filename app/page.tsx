import { AuroraBackground } from '@/components/site/aurora-background'
import { Cta } from '@/components/site/cta'
import { Evaluation } from '@/components/site/evaluation'
import { Faq } from '@/components/site/faq'
import { Features } from '@/components/site/features'
import { Footer } from '@/components/site/footer'
import { Hero } from '@/components/site/hero'
import { HowItWorks } from '@/components/site/how-it-works'
import { Navbar } from '@/components/site/navbar'
import { Stats } from '@/components/site/stats'

export default function Page() {
  return (
    <>
      <AuroraBackground />
      <Navbar />
      <main className="relative">
        <Hero />
        <Stats />
        <Features />
        <HowItWorks />
        <Evaluation />
        <Faq />
        <Cta />
      </main>
      <Footer />
    </>
  )
}
