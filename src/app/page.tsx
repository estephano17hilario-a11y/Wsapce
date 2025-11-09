import CinematicScroll from '@/components/CinematicScroll';
import CosmicBackground from '@/components/CosmicBackground';
import SectionTwoOne from '@/components/SectionTwoOne';
import SectionThree from '@/components/SectionThree';

export default function Home() {
  return (
    <main className="bg-black">
      <CinematicScroll />
      {/* Fondo cósmico fullscreen: inicia al entrar la sección Wspace */}
      <CosmicBackground />
      <SectionTwoOne />
      <SectionThree />
    </main>
  );
}
