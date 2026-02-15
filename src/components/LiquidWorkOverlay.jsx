import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { X } from 'lucide-react';
import { projects } from '../data/projects';

const LiquidWorkOverlay = ({ isOpen, onClose }) => {
    const overlayRef = useRef(null);
    const containerRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        if (!isOpen) return;

        const ctx = gsap.context(() => {
            // Entrance
            gsap.fromTo(overlayRef.current,
                { opacity: 0 },
                { opacity: 1, duration: 0.8 }
            );

            // Animate cards spiraling in
            const cards = gsap.utils.toArray('.liquid-card');
            const radius = 300; // Radius of interaction

            // Initial spiral in
            gsap.from(cards, {
                opacity: 0,
                scale: 0,
                x: (i) => Math.cos(i * 1) * 800, // Start far out
                y: (i) => Math.sin(i * 1) * 800,
                duration: 1.5,
                stagger: 0.1,
                ease: "elastic.out(1, 0.7)"
            });

        }, containerRef);

        return () => ctx.revert();
    }, [isOpen]);

    // Simple interaction to "rotate" via index
    const handleNext = () => setActiveIndex((prev) => (prev + 1) % projects.length);
    const handlePrev = () => setActiveIndex((prev) => (prev - 1 + projects.length) % projects.length);

    if (!isOpen) return null;

    return (
        <div ref={overlayRef} className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-xl flex items-center justify-center overflow-hidden">
            <button onClick={onClose} className="absolute top-8 right-8 text-white z-50 p-2 hover:rotate-90 transition-all">
                <X size={40} />
            </button>

            {/* Central Stage */}
            <div ref={containerRef} className="relative w-full h-full flex items-center justify-center perspective-1000">
                {projects.map((project, index) => {
                    // Calculate position based on basic circular layout relative to active
                    const offset = (index - activeIndex + projects.length) % projects.length;

                    // Only show 3 cards effectively for this "carousel" simulation
                    let isActive = offset === 0;
                    let isNext = offset === 1;
                    let isPrev = offset === projects.length - 1;

                    // Simple classes for visual state
                    let classes = "absolute transition-all duration-700 ease-custom-ease liquid-card rounded-2xl overflow-hidden shadow-2xl border border-white/10";
                    let style = {};

                    if (isActive) {
                        style = {
                            zIndex: 20,
                            transform: 'translate(-50%, -50%) scale(1)',
                            opacity: 1,
                            width: '40vw',
                            height: '50vh',
                            left: '50%',
                            top: '50%',
                            filter: 'blur(0px)'
                        };
                    } else if (isNext) {
                        style = {
                            zIndex: 10,
                            transform: 'translate(-50%, -50%) scale(0.6) translateX(80%) rotateY(-20deg)',
                            opacity: 0.6,
                            width: '40vw',
                            height: '50vh',
                            left: '50%',
                            top: '50%',
                            filter: 'blur(4px)'
                        };
                    } else if (isPrev) {
                        style = {
                            zIndex: 10,
                            transform: 'translate(-50%, -50%) scale(0.6) translateX(-80%) rotateY(20deg)',
                            opacity: 0.6,
                            width: '40vw',
                            height: '50vh',
                            left: '50%',
                            top: '50%',
                            filter: 'blur(4px)'
                        };
                    } else {
                        // Hidden
                        style = {
                            zIndex: 0,
                            opacity: 0,
                            transform: 'translate(-50%, -50%) scale(0)',
                            left: '50%',
                            top: '50%'
                        };
                    }

                    return (
                        <div
                            key={project.id}
                            className={classes}
                            style={style}
                            onClick={() => {
                                if (isNext) handleNext();
                                if (isPrev) handlePrev();
                            }}
                        >
                            <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-8">
                                <h3 className="font-display text-4xl text-white font-bold">{project.title}</h3>
                                <p className="text-zinc-400 text-sm mt-2">{project.category}</p>
                            </div>
                        </div>
                    );
                })}

                {/* Controls */}
                <div className="absolute bottom-12 flex gap-4 z-50">
                    <button onClick={handlePrev} className="px-6 py-2 border border-white/20 text-white rounded-full hover:bg-white hover:text-black transition-colors uppercase text-sm">Prev</button>
                    <button onClick={handleNext} className="px-6 py-2 border border-white/20 text-white rounded-full hover:bg-white hover:text-black transition-colors uppercase text-sm">Next</button>
                </div>
            </div>
        </div>
    );
};

export default LiquidWorkOverlay;
