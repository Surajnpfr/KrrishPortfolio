import React, { useState, useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { Instagram, Facebook, Linkedin, Github } from 'lucide-react';
import Navigation from './components/Navigation';
import Loader from './components/Loader';
import Hero from './components/Hero';
import WorkGallery from './components/WorkGallery';
import MouseSpotlight from './components/MouseSpotlight';
import CrystalWorkOverlay from './components/CrystalWorkOverlay';
import WorkFolderButton from './components/WorkFolderButton';
import DimensionNav from './components/DimensionNav';
import InterestsClock from './components/InterestsClock';

const TypewriterText = ({ text, delay = 30 }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let i = 0;
    setDisplayedText(''); // Reset on text change

    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(prev => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, delay);

    return () => clearInterval(timer);
  }, [text, delay]);

  return (
    <span>
      {displayedText}
      <span className="animate-pulse border-l-2 border-zinc-500 ml-1 h-4 inline-block align-middle"></span>
    </span>
  );
};

import ElectronicsHub from './components/ElectronicsHub';
import ContactSnake from './components/ContactSnake';


function App() {
  const [loading, setLoading] = useState(true);
  const [isCrystalOpen, setIsCrystalOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false); // New Nav State
  const [isWorkUnlocked, setIsWorkUnlocked] = useState(false); // Electronics Hub State
  const [isConnected, setIsConnected] = useState(false); // Track connection phase
  const contentRef = useRef(null);
  const lenisRef = useRef(null); // Store lenis instance

  // Initialize Lenis for smooth scrolling
  useEffect(() => {
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
      if (!isNavOpen && !isCrystalOpen) { // Stop scroll when interactions are open
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

  // Handle Navigation Click (Close Menu -> Wait -> Scroll)
  const handleNavigation = (targetId) => {
    setIsNavOpen(false);
    setTimeout(() => {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(targetId, { offset: 0, duration: 2 });
      } else {
        // Fallback if lenis is not ready
        const el = document.querySelector(targetId);
        el?.scrollIntoView({ behavior: 'smooth' });
      }
    }, 1000); // Wait slightly longer than animation (800ms) to ensure layout is stable
  };

  // Dimension Shift Animation
  useEffect(() => {
    if (isNavOpen) {
      gsap.to(contentRef.current, {
        scale: 0.6, // Drastic scale to reveal the menu behind
        borderRadius: "40px",
        y: 100, // Move down to clear top area
        opacity: 0.8,
        filter: "blur(0px)", // Removed blur to keep "dashboard" feel clean
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

  // Prevent browser scroll when loading
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

      {/* 
        NAVIGATION LAYER (Fixed Top)
        Moved outside #page-content so it stays fixed and clickable 
      */}
      <Navigation
        isOpen={isNavOpen}
        onToggle={() => setIsNavOpen(!isNavOpen)}
      />

      {/* 
        DIMENSION NAV (The Dashboard)
      */}
      <DimensionNav
        isOpen={isNavOpen}
        onClose={() => setIsNavOpen(false)}
        onNavigate={handleNavigation}
      />

      {/* 
        FLOATING WIDGETS (Fixed Top/Bottom)
        Must be outside #page-content to avoid 'fixed-inside-transform' bug.
      */}
      <WorkFolderButton onClick={() => setIsCrystalOpen(true)} />
      <CrystalWorkOverlay isOpen={isCrystalOpen} onClose={() => setIsCrystalOpen(false)} />

      {/* 
        MAIN CONTENT LAYER (Transforms) 
        This is what moves away.
      */}
      <div
        ref={contentRef}
        id="page-content"
        className={`relative z-10 bg-loris-bg min-h-screen shadow-2xl origin-top transition-all will-change-transform ${isNavOpen ? 'pointer-events-none' : ''}`}
      >
        {/* Global Effects attached to the page surface */}
        <MouseSpotlight />
        <div className="bg-noise"></div>

        <main className="relative z-10 w-full"> {/* Removed pb-20 to fix footer scroll gap */}
          <div id="home">
            <Hero />
          </div>


          {/* Work Section (Gated) */}
          <section id="work" className="py-20 min-h-screen flex flex-col items-center justify-center">
            {!isWorkUnlocked ? (
              <div className="w-full max-w-5xl mx-auto px-4">
                <div className="mb-12 text-center">
                  <h2 className={`font-display text-4xl md:text-5xl font-bold uppercase tracking-widest mb-4 transition-colors duration-500 ${isConnected ? 'text-green-500 text-shadow-[0_0_20px_#22c55e]' : 'text-white'}`}>
                    {isConnected ? 'System Online' : 'System Offline'}
                  </h2>
                  <p className="text-zinc-500 font-mono text-sm max-w-md mx-auto flex flex-col gap-2">
                    <span><TypewriterText text={isConnected ? "// CORE_SYSTEMS_ACTIVE" : "// WORK_GALLERY_MODULE_DISCONNECTED"} delay={30} /></span>
                    <span className={isConnected ? "text-green-500/80" : "text-red-500/80"}><TypewriterText text={isConnected ? "> ACCESS GRANTED. WELCOME." : "> JOIN ALL RED DOTS TO INITIALIZE"} delay={50} /></span>
                  </p>
                </div>
                <ElectronicsHub onConnected={() => setIsConnected(true)} onUnlock={() => setIsWorkUnlocked(true)} />
              </div>
            ) : (
              <WorkGallery />
            )}
          </section>

          <div id="about">
            <InterestsClock />
          </div>

          {/* Footer */}
          <ContactSnake />

        </main>
      </div>

    </div>
  );
}

export default App;
