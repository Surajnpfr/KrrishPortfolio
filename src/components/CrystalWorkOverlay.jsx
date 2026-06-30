import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { X, ArrowUpRight } from 'lucide-react';
import { projects } from '../data/projects';

const CrystalWorkOverlay = ({ isOpen, onClose }) => {
    const [activeProject, setActiveProject] = useState(projects[0]);
    const overlayRef = useRef(null);
    const leftColRef = useRef(null);
    const rightColRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            const tl = gsap.timeline();

            // Entrance
            tl.fromTo(overlayRef.current,
                { clipPath: "circle(0% at 90% 90%)" },
                { clipPath: "circle(150% at 90% 90%)", duration: 1.2, ease: "power4.inOut" }
            );

            // Left Col (Crystal)
            tl.fromTo(leftColRef.current,
                { scale: 0.8, opacity: 0, rotateY: 15 },
                { scale: 1, opacity: 1, rotateY: 0, duration: 1, ease: "power3.out" },
                "-=0.6"
            );

            // Right Col (List)
            tl.fromTo(rightColRef.current.children,
                { y: 50, opacity: 0 },
                { y: 0, opacity: 1, stagger: 0.1, duration: 0.8, ease: "power3.out" },
                "-=0.8"
            );

        }
    }, [isOpen]);

    const handleHover = (project) => {
        if (project.id === activeProject.id) return;

        // Morph Effect (Simple fade/scale for now, can be upgraded to WebGL later)
        gsap.to(".crystal-image", {
            opacity: 0,
            scale: 1.1,
            duration: 0.3,
            onComplete: () => {
                setActiveProject(project);
                gsap.to(".crystal-image", { opacity: 1, scale: 1, duration: 0.5 });
            }
        });
    };

    if (!isOpen) return null;

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-[90] bg-zinc-950 text-white flex flex-col md:flex-row overflow-hidden"
            style={{ clipPath: "circle(0% at 100% 100%)" }} // Initial state
        >
            <button onClick={onClose} aria-label="Close project gallery" className="absolute top-8 right-8 z-[100] p-4 bg-white/10 rounded-full hover:bg-white hover:text-black transition-all">
                <X size={24} aria-hidden="true" />
            </button>

            {/* Left Column: Crystal Display */}
            <div className="w-full md:w-1/2 h-[40vh] md:h-full relative flex items-center justify-center p-8 md:p-16 bg-zinc-900/50">
                <div ref={leftColRef} className="relative w-full max-w-lg aspect-[4/5] rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl perspective-1000 group">
                    {/* "Crystal" Overlay Effects */}
                    <div className="absolute inset-0 z-20 bg-gradient-to-tr from-white/10 to-transparent opacity-50 mix-blend-overlay pointer-events-none"></div>
                    <div className="absolute inset-0 z-20 noise-texture opacity-20 mix-blend-overlay pointer-events-none" aria-hidden="true"></div>

                    <img
                        src={activeProject.image}
                        alt={activeProject.title}
                        width={640}
                        height={800}
                        decoding="async"
                        className="crystal-image w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />

                    <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-black/80 to-transparent z-30">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-zinc-400 text-sm uppercase tracking-widest mb-2">{activeProject.category}</p>
                                <h2 className="text-3xl font-display font-bold">{activeProject.title}</h2>
                            </div>
                            <div className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center">
                                <ArrowUpRight size={20} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Project List */}
            <div className="w-full md:w-1/2 h-full flex flex-col justify-center px-6 md:px-20 py-12">
                <div className="mb-8">
                    <h3 className="text-zinc-500 uppercase tracking-widest text-xs mb-2">Select Project</h3>
                    <div className="w-full h-px bg-zinc-800"></div>
                </div>

                <ul ref={rightColRef} className="flex flex-col gap-2">
                    {projects.map((project) => (
                        <li
                            key={project.id}
                            onMouseEnter={() => handleHover(project)}
                            onClick={() => project.link && window.open(project.link, '_blank')}
                            className="group cursor-pointer"
                        >
                            <div className={`flex items-baseline gap-4 transition-all duration-300 ${activeProject.id === project.id ? 'translate-x-4 opacity-100' : 'opacity-40 hover:opacity-80'}`}>
                                <span className="font-mono text-zinc-500 text-sm">0{project.id}</span>
                                <span className="font-display text-4xl md:text-6xl font-bold uppercase group-hover:text-white transition-colors">
                                    {project.title}
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default CrystalWorkOverlay;
