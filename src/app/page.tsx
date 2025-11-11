import CinematicScroll from '@/components/CinematicScroll';
import CosmicBackground from '@/components/CosmicBackground';
import SectionThree from '@/components/SectionThree';
import HypeSection from '@/components/HypeSection';
import PricingSection from '@/components/PricingSection';

export default function Home() {
  return (
    <main className="bg-black">
      <CinematicScroll />
      {/* Fondo cósmico fullscreen: inicia al entrar la sección Wspace */}
      <CosmicBackground />
      <SectionThree />
      <HypeSection />
      <PricingSection />
    </main>
  );
}
