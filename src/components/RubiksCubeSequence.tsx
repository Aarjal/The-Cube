'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { getCubeStateAtProgress } from '../lib/cubeEngine';
import { renderCube, createParticles, updateAndDrawParticles, Particle } from '../lib/cubeRenderer';

// --- SCROLL BEAT TEXT OVERLAYS ---
interface Beat {
  title: string;
  subtitle: string;
  startScroll: number;
  endScroll: number;
}

const BEATS: Beat[] = [
  {
    title: 'FIRST MOVE',
    subtitle: 'The right face turns with intention.',
    startScroll: 0.02,
    endScroll: 0.05,
  },
  {
    title: 'SECOND LAYER',
    subtitle: 'Upper face responds to precision.',
    startScroll: 0.06,
    endScroll: 0.09,
  },
  {
    title: 'REVERSE FLOW',
    subtitle: 'Counter-clockwise motion begins.',
    startScroll: 0.10,
    endScroll: 0.13,
  },
  {
    title: 'RHYTHMIC SEQUENCE',
    subtitle: 'Alternating patterns emerge.',
    startScroll: 0.14,
    endScroll: 0.17,
  },
  {
    title: 'FRONT FACE',
    subtitle: 'Forward motion completes the combo.',
    startScroll: 0.18,
    endScroll: 0.20,
  },
  {
    title: 'ACCELERATION BEGINS',
    subtitle: 'Speed increases, precision maintained.',
    startScroll: 0.25,
    endScroll: 0.27,
  },
  {
    title: 'UPWARD MOMENTUM',
    subtitle: 'Top layer rotates with energy.',
    startScroll: 0.28,
    endScroll: 0.30,
  },
  {
    title: 'ALGORITHM UNFOLDS',
    subtitle: 'Right and up coordinate perfectly.',
    startScroll: 0.31,
    endScroll: 0.33,
  },
  {
    title: 'COUNTER-MOVES',
    subtitle: 'Inverse sequence reverses the flow.',
    startScroll: 0.34,
    endScroll: 0.36,
  },
  {
    title: 'LAYER CHANGE',
    subtitle: 'Front face executes with speed.',
    startScroll: 0.37,
    endScroll: 0.39,
  },
  {
    title: 'LEFT ROTATION',
    subtitle: 'New dimension enters the pattern.',
    startScroll: 0.39,
    endScroll: 0.41,
  },
  {
    title: 'SYNCHRONIZED SPIN',
    subtitle: 'Upper reverse completes the sequence.',
    startScroll: 0.41,
    endScroll: 0.43,
  },
  {
    title: 'FINAL TWIST',
    subtitle: 'Left counter-rotation closes the beat.',
    startScroll: 0.43,
    endScroll: 0.45,
  },
  {
    title: 'RAPID MOMENTUM',
    subtitle: 'Right face accelerates further.',
    startScroll: 0.50,
    endScroll: 0.52,
  },
  {
    title: 'SYNCHRONIZED FLOW',
    subtitle: 'Upper and right move as one.',
    startScroll: 0.52,
    endScroll: 0.54,
  },
  {
    title: 'PRECISION REVERSAL',
    subtitle: 'Counter-clockwise defines the path.',
    startScroll: 0.54,
    endScroll: 0.56,
  },
  {
    title: 'DOUBLE RHYTHM',
    subtitle: 'Upper face spins with intensity.',
    startScroll: 0.56,
    endScroll: 0.58,
  },
  {
    title: 'ASCENDING POWER',
    subtitle: 'Right face commands the moment.',
    startScroll: 0.58,
    endScroll: 0.60,
  },
  {
    title: 'DOUBLE ROTATION',
    subtitle: 'Upper face completes 180 degrees.',
    startScroll: 0.60,
    endScroll: 0.63,
  },
  {
    title: 'MIRROR IMAGE',
    subtitle: 'Right face rotates in reverse.',
    startScroll: 0.63,
    endScroll: 0.65,
  },
  {
    title: 'LEFT PHASE',
    subtitle: 'Left face counter-rotates.',
    startScroll: 0.65,
    endScroll: 0.67,
  },
  {
    title: 'UPPER REVERSE',
    subtitle: 'Final upper counter-rotation.',
    startScroll: 0.67,
    endScroll: 0.69,
  },
  {
    title: 'FINAL SURGE',
    subtitle: 'Front face leads the climax.',
    startScroll: 0.76,
    endScroll: 0.78,
  },
  {
    title: 'RIGHT CULMINATION',
    subtitle: 'Right face drives forward.',
    startScroll: 0.79,
    endScroll: 0.81,
  },
  {
    title: 'UPPER CRESCENDO',
    subtitle: 'Upper face spins to completion.',
    startScroll: 0.82,
    endScroll: 0.84,
  },
  {
    title: 'REVERSE POWER',
    subtitle: 'Counter-rotation intensifies.',
    startScroll: 0.85,
    endScroll: 0.87,
  },
  {
    title: 'FINAL UPPER MOVE',
    subtitle: 'Upper face executes the finale.',
    startScroll: 0.88,
    endScroll: 0.90,
  },
  {
    title: 'COMPLETION',
    subtitle: 'Front face brings resolution.',
    startScroll: 0.91,
    endScroll: 0.93,
  },
];

function BeatOverlay({ beat, scrollProgress }: { beat: Beat; scrollProgress: number }) {
  const { startScroll: s, endScroll: e } = beat;
  const fadeInStart = s;
  const fadeInEnd = s + 0.015;
  const fadeOutStart = e - 0.015;
  const fadeOutEnd = e;

  let opacity = 0;
  let yOffset = 20;

  if (scrollProgress >= fadeInStart && scrollProgress <= fadeInEnd) {
    const t = (scrollProgress - fadeInStart) / (fadeInEnd - fadeInStart);
    opacity = t;
    yOffset = 20 * (1 - t);
  } else if (scrollProgress > fadeInEnd && scrollProgress < fadeOutStart) {
    opacity = 1;
    yOffset = 0;
  } else if (scrollProgress >= fadeOutStart && scrollProgress <= fadeOutEnd) {
    const t = (scrollProgress - fadeOutStart) / (fadeOutEnd - fadeOutStart);
    opacity = 1 - t;
    yOffset = -20 * t;
  }

  if (opacity <= 0.01) return null;

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10"
      style={{ opacity, transform: `translateY(${yOffset}px)` }}
    >
      <h2 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tighter text-white/90 text-center leading-none">
        {beat.title}
      </h2>
      <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-white/50 tracking-wide text-center max-w-xl px-4 font-light">
        {beat.subtitle}
      </p>
    </div>
  );
}

// --- LOADING SCREEN ---
function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const totalFrames = 60;
    const animate = () => {
      frame++;
      const t = frame / totalFrames;
      // Ease out
      const eased = 1 - Math.pow(1 - t, 3);
      setProgress(Math.min(eased * 100, 100));
      if (frame < totalFrames) {
        requestAnimationFrame(animate);
      } else {
        setTimeout(onComplete, 400);
      }
    };
    requestAnimationFrame(animate);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ backgroundColor: '#050505' }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
    >
      <div className="flex flex-col items-center gap-8">
        {/* Spinner */}
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border border-white/10" />
          <div
            className="absolute inset-0 rounded-full border border-t-white/60"
            style={{ animation: 'spin 1s linear infinite' }}
          />
        </div>

        {/* Progress bar */}
        <div className="w-48 h-[1px] bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-white/40 rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Percentage */}
        <span className="text-white/40 text-sm font-light tracking-[0.3em] tabular-nums">
          {Math.round(progress)}%
        </span>
      </div>
    </motion.div>
  );
}

// --- MAIN COMPONENT ---
export default function RubiksCubeSequence() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const currentProgressRef = useRef(0);
  const [loading, setLoading] = useState(true);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.0001,
  });

  const handleLoadComplete = useCallback(() => {
    setLoading(false);
  }, []);

  // Subscribe to smooth progress
  useEffect(() => {
    const unsub = smoothProgress.on('change', (v: number) => {
      currentProgressRef.current = v;
    });
    return unsub;
  }, [smoothProgress]);

  // Canvas rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Re-create particles on resize
      particlesRef.current = createParticles(120, rect.width, rect.height);
    };

    resize();
    window.addEventListener('resize', resize);

    if (particlesRef.current.length === 0) {
      const rect = canvas.getBoundingClientRect();
      particlesRef.current = createParticles(120, rect.width, rect.height);
    }

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const progress = currentProgressRef.current;

      // Clear
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, w, h);

      // Get cube state
      const { cubies, animatingMove, animationProgress } = getCubeStateAtProgress(progress);

      // Render cube
      renderCube(ctx, w, h, cubies, animatingMove, animationProgress);

      // Particle intensity based on scroll progress
      let particleIntensity = 0;
      if (progress < 0.3) {
        particleIntensity = progress / 0.3 * 0.1;
      } else if (progress < 0.6) {
        particleIntensity = 0.1 + ((progress - 0.3) / 0.3) * 0.3;
      } else {
        particleIntensity = 0.4 + ((progress - 0.6) / 0.4) * 0.6;
      }

      // Draw particles
      updateAndDrawParticles(ctx, particlesRef.current, w, h, particleIntensity);

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [loading]);

  return (
    <>
      {loading && <LoadingScreen onComplete={handleLoadComplete} />}

      <div ref={containerRef} className="relative" style={{ height: '500vh' }}>
        <div className="sticky top-0 h-screen w-full overflow-hidden" style={{ backgroundColor: '#050505' }}>
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            style={{ backgroundColor: '#050505' }}
          />

          {/* Beat text overlays */}
          <SmoothBeats smoothProgress={smoothProgress} />

          {/* Scroll indicator at very top */}
          <ScrollIndicator smoothProgress={smoothProgress} />
        </div>
      </div>
    </>
  );
}

function SmoothBeats({ smoothProgress }: { smoothProgress: ReturnType<typeof useSpring> }) {
  const progress = useTransform(smoothProgress, (v: number) => v);
  const [currentProgress, setCurrentProgress] = useState(0);

  useEffect(() => {
    const unsub = progress.on('change', (v: number) => setCurrentProgress(v));
    return unsub;
  }, [progress]);

  return (
    <>
      {BEATS.map((beat, i) => (
        <BeatOverlay key={i} beat={beat} scrollProgress={currentProgress} />
      ))}
    </>
  );
}

function ScrollIndicator({ smoothProgress }: { smoothProgress: ReturnType<typeof useSpring> }) {
  const opacity = useTransform(smoothProgress, [0, 0.03, 0.05], [1, 1, 0]);
  const y = useTransform(smoothProgress, [0, 0.05], [0, -20]);

  return (
    <motion.div
      className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-10"
      style={{ opacity, y }}
    >
      <span className="text-white/30 text-xs tracking-[0.4em] uppercase font-light">
        Scroll to explore
      </span>
      <div className="w-[1px] h-8 bg-gradient-to-b from-white/30 to-transparent" />
    </motion.div>
  );
}
