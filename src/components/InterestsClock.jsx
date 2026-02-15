import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import handImg from '../assets/skeletal_hand_pointer.svg';

gsap.registerPlugin(ScrollTrigger);

const interests = [
    { title: "Art", angle: 0, position: "top-0 left-1/2 -translate-x-1/2 -translate-y-8 md:-translate-y-4" },       // 12:00
    { title: "Basketball", angle: 90, position: "top-1/2 right-0 translate-x-10 md:translate-x-48 -translate-y-1/2" }, // 3:00
    { title: "Coding", angle: 180, position: "bottom-0 left-1/2 -translate-x-1/2 translate-y-8 md:translate-y-4" },  // 6:00
    { title: "Robotics", angle: 270, position: "top-1/2 left-0 -translate-x-10 md:-translate-x-32 -translate-y-1/2" },  // 9:00
];

const SpiderSwarm = ({ containerRef }) => {
    const spidersRef = useRef([]);

    useEffect(() => {
        if (!containerRef.current) return;

        const onMouseMove = (e) => {
            const rect = containerRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            spidersRef.current.forEach((spider, i) => {
                const delay = i * 0.02;     // Stagger movement
                const duration = 0.5 + Math.random() * 0.5; // Random speed
                const offset = 40; // Random offset swarm radius

                const targetX = x + (Math.random() - 0.5) * offset;
                const targetY = y + (Math.random() - 0.5) * offset;

                gsap.to(spider, {
                    x: targetX,
                    y: targetY,
                    rotation: Math.random() * 360,
                    duration: duration,
                    delay: delay,
                    ease: "power2.out"
                });
            });
        };

        const section = containerRef.current;
        section.addEventListener('mousemove', onMouseMove);
        return () => section.removeEventListener('mousemove', onMouseMove);
    }, [containerRef]);

    return (
        <div className="absolute inset-0 pointer-events-none z-0">
            {[...Array(20)].map((_, i) => (
                <div
                    key={i}
                    ref={el => spidersRef.current[i] = el}
                    className="absolute w-3 h-3 md:w-4 md:h-4 text-zinc-500 opacity-60"
                    style={{ left: 0, top: 0 }} // Start top-left
                >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C13.1 2 14 2.9 14 4C14 4.5 13.8 5 13.5 5.4C15.6 6.3 17 8.2 17 10.5C17 13 15.6 15.2 13.5 16.1C13.8 16.5 14 17 14 17.5C14 18.6 13.1 19.5 12 19.5C10.9 19.5 10 18.6 10 17.5C10 17 10.2 16.5 10.5 16.1C8.4 15.2 7 13 7 10.5C7 8.2 8.4 6.3 10.5 5.4C10.2 5 10 4.5 10 4C10 2.9 10.9 2 12 2M21 11H18V10H21V11M3 11H6V10H3V11M19.8 16.2L17.7 14.1L18.4 13.4L20.5 15.5L19.8 16.2M4.2 16.2L3.5 15.5L5.6 13.4L6.3 14.1L4.2 16.2M19.8 5.8L20.5 6.5L18.4 8.6L17.7 7.9L19.8 5.8M4.2 5.8L6.3 7.9L5.6 8.6L3.5 6.5L4.2 5.8Z" />
                    </svg>
                </div>
            ))}
        </div>
    );
};

const InterestsClock = () => {
    const handRef = useRef(null);
    const containerRef = useRef(null);
    const sectionRef = useRef(null);

    useEffect(() => {
        // Initial Scroll Animation
        gsap.from(containerRef.current, {
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top 80%",
            },
            scale: 0.8,
            duration: 1,
            ease: "power3.out"
        });
    }, []);

    const handleHover = (angle) => {
        gsap.to(handRef.current, {
            rotation: angle,
            duration: 0.8,
            ease: "back.out(1.7)", // Over-shoot for realistic mechanical feel
            overwrite: true
        });
    };

    const SpiderWeb = () => {
        const rings = [50, 100, 150, 200, 250, 300, 350];
        const spokes = 12;

        return (
            <div className="absolute inset-0 z-0 flex items-center justify-center opacity-30 pointer-events-none scale-100 md:scale-100">
                <svg
                    width="800"
                    height="800"
                    viewBox="0 0 800 800"
                    className="animate-spin-slow"
                    style={{ filter: "drop-shadow(0 0 5px rgba(255, 255, 255, 0.3))" }}
                >
                    {/* Radial Lines */}
                    {[...Array(spokes)].map((_, i) => {
                        const angle = (i * 2 * Math.PI) / spokes;
                        return (
                            <line
                                key={`radial-${i}`}
                                x1="400" y1="400"
                                x2={400 + 400 * Math.cos(angle)}
                                y2={400 + 400 * Math.sin(angle)}
                                stroke="#52525b"
                                strokeWidth="0.5"
                            />
                        );
                    })}

                    {/* Curved Concentric Webs */}
                    {rings.map((r, i) => (
                        <path
                            key={`ring-${i}`}
                            d={[...Array(spokes)].map((_, j) => {
                                const angleStart = (j * 2 * Math.PI) / spokes;
                                const angleEnd = ((j + 1) * 2 * Math.PI) / spokes;

                                const x1 = 400 + r * Math.cos(angleStart);
                                const y1 = 400 + r * Math.sin(angleStart);

                                const x2 = 400 + r * Math.cos(angleEnd);
                                const y2 = 400 + r * Math.sin(angleEnd);

                                // Control point for the curve (sag inwards)
                                const sagFactor = 0.85;
                                const angleMid = (angleStart + angleEnd) / 2;
                                const cx = 400 + (r * sagFactor) * Math.cos(angleMid);
                                const cy = 400 + (r * sagFactor) * Math.sin(angleMid);

                                return j === 0 ? `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}` : `Q ${cx} ${cy} ${x2} ${y2}`;
                            }).join(' ') + 'Z'}
                            fill="none"
                            stroke="#52525b"
                            strokeWidth="0.8"
                            className="opacity-60"
                        />
                    ))}
                </svg>
            </div>
        );
    };

    return (
        <section ref={sectionRef} className="py-32 bg-loris-bg flex flex-col items-center justify-center relative z-10 w-full overflow-hidden min-h-screen">
            <SpiderWeb />
            <SpiderSwarm containerRef={sectionRef} />

            <div className="mb-20 text-center relative z-10">
                <h2 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-widest text-white mb-4">
                    Obsessions
                </h2>
                <div className="w-12 h-1 bg-white mx-auto"></div>
            </div>

            <div ref={containerRef} className="relative w-[300px] h-[300px] md:w-[500px] md:h-[500px] flex items-center justify-center">

                {/* The Hand */}
                <div
                    ref={handRef}
                    className="absolute w-full h-full flex items-center justify-center transition-transform will-change-transform"
                >
                    {/* Placeholder for the hand image - rotating from center */}
                    <img
                        src={handImg}
                        alt="Pointer"
                        className="h-[35%] md:h-1/2 origin-bottom -translate-y-1/4 filter invert grayscale drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                    />
                </div>

                {/* Interest Items */}
                {interests.map((item, index) => (
                    <div
                        key={item.title}
                        onMouseEnter={() => handleHover(item.angle)}
                        className={`absolute ${item.position} cursor-pointer group`}
                    >
                        <h3 className="text-xl md:text-4xl font-display font-bold uppercase text-zinc-600 group-hover:text-white transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                            {item.title}
                        </h3>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default InterestsClock;
