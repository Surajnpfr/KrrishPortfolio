import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import profileImg from '../profile.png';

const Loader = ({ onComplete }) => {
    const containerRef = useRef(null);
    const textRef = useRef(null);
    const imgRef = useRef(null);
    const flashRef = useRef(null);
    const [isExiting, setIsExiting] = useState(false);

    // Initial Entry Animation
    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(imgRef.current, {
                x: -100,
                opacity: 0,
                duration: 1.5,
                ease: "power3.out",
                delay: 0.2
            });

            gsap.from(textRef.current, {
                x: 100,
                opacity: 0,
                duration: 1.5,
                ease: "power3.out",
                delay: 0.2
            });
        }, containerRef);
        return () => ctx.revert();
    }, []);

    const handleEnter = () => {
        if (isExiting) return;
        setIsExiting(true);

        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                onComplete: onComplete
            });

            // 1. Flash
            tl.to(flashRef.current, {
                opacity: 1,
                duration: 0.1,
                ease: "power1.inOut"
            })
                .to(flashRef.current, {
                    opacity: 0,
                    duration: 0.1,
                    ease: "power1.inOut"
                })

                // 2. Shake (Concurrent with flash end)
                .to(containerRef.current, {
                    x: () => gsap.utils.random(-20, 20),
                    y: () => gsap.utils.random(-20, 20),
                    duration: 0.1,
                    repeat: 5,
                    yoyo: true,
                    ease: "none"
                }, "-=0.2")

                // 3. Loophole / Warp
                .to([textRef.current, imgRef.current], {
                    scale: 50,
                    opacity: 0,
                    duration: 1.5,
                    ease: "expo.in",
                    stagger: 0.1
                })
                .to(containerRef.current, {
                    opacity: 0,
                    duration: 0.5
                }, "-=1.0");

        }, containerRef);
    };

    return (
        <div ref={containerRef} className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden cursor-pointer" onClick={handleEnter}>
            {/* Flash Overlay */}
            <div ref={flashRef} className="absolute inset-0 bg-white opacity-0 pointer-events-none z-[110]"></div>

            <div className="container mx-auto px-6 h-full flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24">

                {/* Visual Side */}
                <div ref={imgRef} className="relative w-64 h-64 md:w-96 md:h-96 shrink-0 aspect-square">
                    <div className="absolute inset-0 border border-white/20 rounded-full animate-[spin_10s_linear_infinite]"></div>
                    <div className="absolute inset-4 border border-white/10 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
                    <img
                        src={profileImg}
                        alt="Profile"
                        className="w-full h-full object-cover rounded-full grayscale hover:grayscale-0 transition-all duration-500 shadow-[0_0_50px_rgba(255,255,255,0.1)]"
                    />
                </div>

                {/* Text Side */}
                <div ref={textRef} className="text-center md:text-left flex flex-col items-center md:items-start">
                    <h1 className="text-4xl md:text-7xl font-display font-bold uppercase tracking-tighter mb-4 text-white mix-blend-difference">
                        Krrish <br /> Nyoupane
                    </h1>
                    <div className="w-20 h-1 bg-white mb-6"></div>
                    <p className="text-zinc-400 text-lg md:text-xl max-w-md font-light leading-relaxed">
                        <span className="text-white font-medium">UI/UX Designer</span>, <span className="text-white font-medium">Game Developer</span>, and <span className="text-white font-medium">Basketball Player</span>. <br />
                        Building thoughtful design solutions for the real world.
                    </p>

                    <div className="mt-12 group flex items-center gap-3 text-sm tracking-[0.3em] uppercase text-zinc-500 animate-pulse">
                        <span>Click to Enter</span>
                        <div className="w-8 h-px bg-zinc-700 group-hover:w-16 transition-all"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Loader;
