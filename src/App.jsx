import React, { useState, useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { Instagram, Facebook, Linkedin, Github, Sun, Moon } from 'lucide-react';
import { playWhoosh } from './utils/sound';
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

import Interactive3DWork from './components/Interactive3DWork';
import ContactSnake from './components/ContactSnake';


function App() {
  const [loading, setLoading] = useState(true);
  const [isCrystalOpen, setIsCrystalOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  // Theme: persisted to localStorage
  const [isLight, setIsLight] = useState(() => localStorage.getItem('theme') === 'light');
  // Sound: off by default
  const [isSoundOn, setIsSoundOn] = useState(() => localStorage.getItem('sound') === 'on');
  const contentRef = useRef(null);
  const lenisRef = useRef(null);

  // Apply / remove html.light class
  useEffect(() => {
    document.documentElement.classList.toggle('light', isLight);
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
  }, [isLight]);

  // Persist sound preference
  useEffect(() => {
    localStorage.setItem('sound', isSoundOn ? 'on' : 'off');
  }, [isSoundOn]);

  // Initialize Lenis for smooth scrolling (desktop only)
  useEffect(() => {
    // Skip Lenis on mobile — native scroll is far faster on phones
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

  // Nav toggle — plays whoosh if sound is on
  const handleNavToggle = () => {
    if (isSoundOn) playWhoosh();
    setIsNavOpen(p => !p);
  };

  // Dimension Shift Animation
  useEffect(() => {
    if (isNavOpen) {
      gsap.to(contentRef.current, {
        scale: window.innerWidth < 768 ? 0.85 : 0.6, // Less drastic scale on mobile
        borderRadius: "40px",
        y: window.innerWidth < 768 ? 60 : 100, // Move down less on mobile
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
        onToggle={handleNavToggle}
      />

      {/* 
        DIMENSION NAV (The Dashboard)
      */}
      <DimensionNav
        isOpen={isNavOpen}
        onClose={() => setIsNavOpen(false)}
        onNavigate={handleNavigation}
        isLight={isLight}
        onToggleTheme={() => setIsLight(p => !p)}
        isSoundOn={isSoundOn}
        onToggleSound={() => setIsSoundOn(p => !p)}
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


          {/* Work Section (3D Interactive Gallery) */}
          <section id="work" className="relative">
             <Interactive3DWork />
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
