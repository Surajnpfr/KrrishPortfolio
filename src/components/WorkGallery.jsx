import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { X } from 'lucide-react';
import { projects } from '../data/projects';

gsap.registerPlugin(ScrollTrigger);

const WorkDetailOverlay = ({ project, onClose }) => {
    const overlayRef = useRef(null);
    const contentRef = useRef(null);

    useEffect(() => {
        const tl = gsap.timeline();
        tl.fromTo(overlayRef.current,
            { opacity: 0 },
            { opacity: 1, duration: 0.5 }
        )
            .fromTo(contentRef.current,
                { y: 50, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
                "-=0.3"
            );

        return () => {
            gsap.to(overlayRef.current, { opacity: 0, duration: 0.3 });
        };
    }, []);

    if (!project) return null;

    return (
        <div ref={overlayRef} className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <button onClick={onClose} className="absolute top-8 right-8 text-white hover:text-zinc-400 transition-colors">
                <X size={32} />
            </button>

            <div ref={contentRef} className="max-w-4xl w-full grid md:grid-cols-2 gap-10 items-center">
                <div className="aspect-[4/3] overflow-hidden rounded-sm">
                    <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
                </div>
                <div className="text-white">
                    <span className="text-zinc-500 font-mono text-sm uppercase tracking-widest">{project.category}</span>
                    <h2 className="font-display text-5xl md:text-6xl font-bold mt-2 mb-6 uppercase leading-none">{project.title}</h2>
                    <p className="text-zinc-400 text-lg font-light leading-relaxed">{project.description}</p>

                    <div className="mt-10">
                        {project.link && (
                            <a
                                href={project.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block px-8 py-3 border border-white/20 hover:bg-white hover:text-black transition-all duration-300 uppercase text-sm tracking-widest"
                            >
                                View Live Case
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const WorkGallery = () => {
    const containerRef = useRef(null);
    const [selectedProject, setSelectedProject] = useState(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Animate each project card entering
            gsap.utils.toArray('.project-card').forEach((card, i) => {
                gsap.from(card, {
                    scrollTrigger: {
                        trigger: card,
                        start: "top 85%",
                        toggleActions: "play none none reverse"
                    },
                    y: 100,
                    opacity: 0,
                    duration: 1.2,
                    ease: "power3.out"
                });
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <>
            <section ref={containerRef} className="min-h-screen px-4 md:px-8 lg:px-16 py-32 bg-loris-bg relative z-20">
                <div className="mb-32 flex items-end justify-between border-b border-white/10 pb-8">
                    <h2 className="font-display text-4xl md:text-[5vw] font-medium tracking-tight uppercase leading-none">Selected Work</h2>
                    <span className="hidden md:block text-zinc-500 font-mono text-sm uppercase tracking-widest">(2023 — 2025)</span>
                </div>

                <div className="flex flex-col gap-32">
                    {projects.map((project, index) => (
                        <div
                            key={project.id}
                            onClick={() => setSelectedProject(project)}
                            className="project-card group cursor-pointer w-full flex flex-col md:flex-row gap-8 md:gap-16 items-start border-t border-white/5 pt-12"
                        >
                            {/* Project Info - Sticky on Desktop */}
                            <div className="w-full md:w-1/3 md:sticky md:top-32 self-start transition-all duration-500">
                                <span className="font-mono text-xs text-zinc-500 mb-4 block">0{index + 1} / {projects.length}</span>
                                <h3 className="font-display text-4xl md:text-5xl font-medium uppercase group-hover:text-zinc-600 transition-colors duration-300 leading-none mb-4">
                                    {project.title}
                                </h3>
                                <div className="flex flex-wrap gap-2 mb-6">
                                    <span className="px-3 py-1 border border-white/10 rounded-full text-xs uppercase tracking-wider text-zinc-400">
                                        {project.category}
                                    </span>
                                </div>
                                <p className="text-zinc-500 text-sm max-w-xs leading-relaxed hidden md:block">
                                    {project.description}
                                </p>
                            </div>

                            {/* Image Container */}
                            <div className="w-full md:w-2/3 h-[60vh] md:h-[80vh] overflow-hidden relative grayscale group-hover:grayscale-0 transition-all duration-700 ease-custom-ease">
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
                                <img
                                    src={project.image}
                                    alt={project.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s] ease-custom-ease"
                                />
                                <div className="absolute bottom-6 right-6 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-black font-bold text-xl">
                                        ↗
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {selectedProject && (
                <WorkDetailOverlay project={selectedProject} onClose={() => setSelectedProject(null)} />
            )}
        </>
    );
};

export default WorkGallery;
