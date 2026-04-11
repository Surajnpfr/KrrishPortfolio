import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const Hero = () => {
    const containerRef = useRef(null);
    const titleRef = useRef(null);
    const subRef = useRef(null);
    const spotlightRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ delay: 2.2 }); // Wait for loader

            // Animate lines of text
            tl.fromTo(".hero-line",
                { y: 150, rotate: 5, opacity: 0 },
                {
                    y: 0,
                    rotate: 0,
                    opacity: 1,
                    duration: 1.8,
                    stagger: 0.15,
                    ease: "power4.out"
                }
            )
                .fromTo(subRef.current,
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: 1.2, ease: "power2.out" },
                    "-=1"
                );
        }, containerRef);

        // Spotlight Interactions
        const handleMouseMove = (e) => {
            if (spotlightRef.current) {
                gsap.to(spotlightRef.current, {
                    x: e.clientX,
                    y: e.clientY,
                    duration: 0.8,
                    ease: "power2.out"
                });
            }
        };

        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            ctx.revert();
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return (
        <section ref={containerRef} className="min-h-screen flex flex-col justify-center px-4 md:px-8 lg:px-16 pt-24 pb-12 overflow-hidden relative z-10 cursor-none">
            {/* Hero Spotlight - Interactive Cursor */}
            <div
                ref={spotlightRef}
                className="fixed top-0 left-0 w-[400px] h-[400px] bg-white rounded-full blur-[80px] pointer-events-none mix-blend-difference z-20 opacity-0 md:opacity-100 -translate-x-1/2 -translate-y-1/2"
            ></div>

            <h1 ref={titleRef} className="font-display font-bold text-5xl sm:text-7xl md:text-[13.5vw] leading-[0.75] tracking-tighter uppercase text-white mix-blend-difference z-10 flex flex-col">
                <div className="overflow-hidden flex"><div className="hero-line origin-top-left">UI/UX</div></div>
                <div className="overflow-hidden flex"><div className="hero-line origin-top-left">Designer</div></div>
                <div className="overflow-hidden flex items-baseline gap-4">
                    <div className="hero-line origin-top-left text-zinc-600">&</div>
                    <div className="hero-line origin-top-left">Game</div>
                </div>
                <div className="overflow-hidden flex"><div className="hero-line origin-top-left">Developer</div></div>
            </h1>

            <div ref={subRef} className="mt-16 md:mt-24 flex flex-col md:flex-row justify-between items-start w-full border-t border-white/10 pt-8 mix-blend-difference">
                <div className="max-w-xl">
                    <p className="text-sm md:text-lg text-zinc-400 font-light leading-relaxed font-sans">
                        Designing intuitive and engaging digital products with a focus on clarity, usability, and delightful interactions.
                    </p>
                </div>
                <div className="hidden md:block text-right">

                </div>
            </div>
        </section>
    );
};

export default Hero;
