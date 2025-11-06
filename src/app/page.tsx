import CinematicScroll from '@/components/CinematicScroll';
import SectionTwoOne from '@/components/SectionTwoOne';
import SectionThree from '@/components/SectionThree';

export default function Home() {
  return (
    <main className="bg-black">
      <CinematicScroll />
      <SectionTwoOne />
      <SectionThree />
    </main>
  );
}
