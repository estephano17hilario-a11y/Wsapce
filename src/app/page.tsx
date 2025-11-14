import dynamic from 'next/dynamic'
const CinematicScroll = dynamic(() => import('@/components/CinematicScroll'))
const CosmicBackground = dynamic(() => import('@/components/CosmicBackground'))
const SectionThree = dynamic(() => import('@/components/SectionThree'))
const HypeSection = dynamic(() => import('@/components/HypeSection'))
const WarmupHeroSection = dynamic(() => import('@/components/WarmupHeroSection'))
import PricingSection from '@/components/PricingSection'
const Footer = dynamic(() => import('@/components/Footer'))
const RankingsSection = dynamic(() => import('@/components/RankingsSection'))
const PerfPanel = dynamic(() => import('@/components/PerfPanel'))

export default function Home() {
  return (
    <main className="bg-black">
      <CinematicScroll />
      {/* Fondo cósmico fullscreen: inicia al entrar la sección Wspace */}
      <CosmicBackground />
      <SectionThree />
      <HypeSection />
      <WarmupHeroSection />
      <PricingSection />
      <RankingsSection />
      <Footer />
      <PerfPanel />
  </main>
  );
}
