import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { playWhoosh } from './utils/sound';
import Navigation from './components/Navigation';
import Loader from './components/Loader';
import Hero from './components/Hero';
import MouseSpotlight from './components/MouseSpotlight';

const DimensionNav = lazy(() => import('./components/DimensionNav'));
const WorkFolderButton = lazy(() => import('./components/WorkFolderButton'));
const CrystalWorkOverlay = lazy(() => import('./components/CrystalWorkOverlay'));
const Interactive3DWork = lazy(() => import('./components/Interactive3DWork'));
const InterestsClock = lazy(() => import('./components/InterestsClock'));
const ContactSnake = lazy(() => import('./components/ContactSnake'));

function App() {
  const [loading, setLoading] = useState(true);
  const [isCrystalOpen, setIsCrystalOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isLight, setIsLight] = useState(() => localStorage.getItem('theme') === 'light');
  const [isSoundOn, setIsSoundOn] = useState(() => localStorage.getItem('sound') === 'on');
  const contentRef = useRef(null);
  const lenisRef = useRef(null);

  useEffect(() => {
    document.documentElement.classList.toggle('light', isLight);
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
  }, [isLight]);

  useEffect(() => {
    localStorage.setItem('sound', isSoundOn ? 'on' : 'off');
  }, [isSoundOn]);

  useEffect(() => {
    if (window.innerWidth < 768) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
    });

    lenisRef.current = lenis;

    function raf(time) {
      if (!isNavOpen && !isCrystalOpen) {
        lenis.raf(time);
      }
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [isNavOpen, isCrystalOpen]);

  const handleNavigation = (targetId) => {
    setIsNavOpen(false);
    setTimeout(() => {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(targetId, { offset: 0, duration: 2 });
      } else {
        const el = document.querySelector(targetId);
        el?.scrollIntoView({ behavior: 'smooth' });
      }
    }, 1000);
  };

  const handleNavToggle = () => {
    if (isSoundOn) playWhoosh();
    setIsNavOpen(p => !p);
  };

  useEffect(() => {
    if (isNavOpen) {
      gsap.to(contentRef.current, {
        scale: window.innerWidth < 768 ? 0.85 : 0.6,
        borderRadius: "40px",
        y: window.innerWidth < 768 ? 60 : 100,
        opacity: 0.8,
        filter: "blur(0px)",
        duration: 0.8,
        ease: "power3.inOut",
        transformOrigin: "center top"
      });
    } else {
      gsap.to(contentRef.current, {
        scale: 1,
        borderRadius: "0px",
        y: 0,
        opacity: 1,
        filter: "blur(0px)",
        duration: 0.8,
        ease: "power3.inOut"
      });
    }
  }, [isNavOpen]);

  useEffect(() => {
    if (loading || isCrystalOpen || isNavOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [loading, isCrystalOpen, isNavOpen]);

  return (
    <div className="bg-zinc-950 min-h-screen text-loris-text font-sans antialiased selection:bg-white selection:text-black overflow-hidden perspective-2000">

      {loading && <Loader onComplete={() => setLoading(false)} />}

      <Navigation
        isOpen={isNavOpen}
        onToggle={handleNavToggle}
      />

      <Suspense fallback={null}>
        <DimensionNav
          isOpen={isNavOpen}
          onClose={() => setIsNavOpen(false)}
          onNavigate={handleNavigation}
          isLight={isLight}
          onToggleTheme={() => setIsLight(p => !p)}
          isSoundOn={isSoundOn}
          onToggleSound={() => setIsSoundOn(p => !p)}
        />
        <WorkFolderButton onClick={() => setIsCrystalOpen(true)} />
        <CrystalWorkOverlay isOpen={isCrystalOpen} onClose={() => setIsCrystalOpen(false)} />
      </Suspense>

      <div
        ref={contentRef}
        id="page-content"
        className={`relative z-10 bg-loris-bg min-h-screen shadow-2xl origin-top transition-all will-change-transform ${isNavOpen ? 'pointer-events-none' : ''}`}
      >
        <MouseSpotlight />
        <div className="bg-noise" aria-hidden="true"></div>

        <main className="relative z-10 w-full">
          <div id="home">
            <Hero />
          </div>

          <section id="work" className="relative">
            <Suspense fallback={<div className="w-full h-screen min-h-[700px] bg-zinc-950 rounded-[40px] mt-20" aria-hidden="true" />}>
              <Interactive3DWork />
            </Suspense>
          </section>

          <div id="about">
            <Suspense fallback={null}>
              <InterestsClock />
            </Suspense>
          </div>

          <Suspense fallback={null}>
            <ContactSnake />
          </Suspense>
        </main>
      </div>

    </div>
  );
}

export default App;
