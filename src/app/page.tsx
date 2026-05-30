import dynamic from 'next/dynamic';

const RubiksCubeSequence = dynamic(
  () => import('../components/RubiksCubeSequence'),
  { ssr: false }
);

export default function Home() {
  return (
    <main className="relative" style={{ backgroundColor: '#050505' }}>
      {/* Hero intro */}
      <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden" style={{ backgroundColor: '#050505' }}>
        <div className="relative z-10 flex flex-col items-center gap-6 px-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-[1px] bg-white/20" />
            <span className="text-white/30 text-[10px] sm:text-xs tracking-[0.5em] uppercase font-light">
              Premium Experience
            </span>
            <div className="w-8 h-[1px] bg-white/20" />
          </div>
          <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tighter text-white/95 text-center leading-[0.9]">
            THE CUBE
          </h1>
          <p className="text-white/40 text-sm sm:text-base md:text-lg font-light tracking-wide text-center max-w-md">
            Where mechanical precision meets cinematic artistry.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3">
            <span className="text-white/20 text-[10px] tracking-[0.4em] uppercase">
              Scroll to begin
            </span>
            <div className="w-[1px] h-12 bg-gradient-to-b from-white/20 to-transparent animate-pulse" />
          </div>
        </div>

        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </section>

      {/* Rubik's Cube Scroll Experience */}
      <RubiksCubeSequence />

      {/* Outro section */}
      <section className="relative h-screen flex flex-col items-center justify-center" style={{ backgroundColor: '#050505' }}>
        <div className="flex flex-col items-center gap-6 px-4">
          <div className="w-12 h-[1px] bg-white/10 mb-4" />
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-white/90 text-center">
            PRECISION IS ART
          </h2>
          <p className="text-white/40 text-sm sm:text-base font-light tracking-wide text-center max-w-lg">
            Every algorithm. Every rotation. Every sticker placement.
            Mechanically perfect. Cinematically beautiful.
          </p>
          <div className="mt-8 flex items-center gap-6">
            <button className="px-8 py-3 border border-white/20 text-white/70 text-sm tracking-[0.2em] uppercase hover:bg-white/5 transition-all duration-500 font-light">
              Explore
            </button>
            <button className="px-8 py-3 bg-white/90 text-black text-sm tracking-[0.2em] uppercase hover:bg-white transition-all duration-500 font-light">
              Experience
            </button>
          </div>
          <div className="w-12 h-[1px] bg-white/10 mt-8" />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5" style={{ backgroundColor: '#050505' }}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-white/20 text-xs tracking-[0.3em] uppercase font-light">
            The Cube Experience
          </span>
          <span className="text-white/15 text-xs font-light">
            Crafted with mechanical precision
          </span>
        </div>
      </footer>
    </main>
  );
}
