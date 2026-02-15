import React, { useRef, useEffect } from 'react';
import { Folder } from 'lucide-react';
import gsap from 'gsap';
import { projects } from '../data/projects';

const WorkFolderButton = ({ onClick }) => {
    const containerRef = useRef(null);
    const marqueeRef = useRef(null);
    const folderRef = useRef(null);

    // Marquee Animation
    useEffect(() => {
        const ctx = gsap.context(() => {
            // Infinite scroll for marquee
            gsap.to(marqueeRef.current, {
                xPercent: -50,
                repeat: -1,
                duration: 20,
                ease: "linear"
            });
        }, containerRef);
        return () => ctx.revert();
    }, []);

    const handleMouseEnter = () => {
        gsap.to(containerRef.current, { width: 300, duration: 0.5, ease: "power3.out" });
        gsap.to(folderRef.current, { rotate: -10, scale: 1.1, duration: 0.3 });
    };

    const handleMouseLeave = () => {
        gsap.to(containerRef.current, { width: 64, duration: 0.5, ease: "power3.out" });
        gsap.to(folderRef.current, { rotate: 0, scale: 1, duration: 0.3 });
    };

    return (
        <div
            ref={containerRef}
            onClick={onClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="fixed bottom-8 right-8 z-[70] h-16 w-16 bg-zinc-900 border border-white/20 rounded-full flex items-center justify-end overflow-hidden cursor-pointer shadow-2xl transition-colors hover:border-white/50"
        >
            {/* Marquee Background (Absolute, behind icon) */}
            <div className="absolute inset-y-0 right-16 left-0 overflow-hidden opacity-50 mask-gradient" style={{ maskImage: 'linear-gradient(to right, transparent, black 20%)' }}>
                <div ref={marqueeRef} className="flex h-full items-center gap-2 whitespace-nowrap pl-4">
                    {[...projects, ...projects].map((p, i) => (
                        <img key={i} src={p.image} alt="" className="h-10 w-16 object-cover rounded-md opacity-70 grayscale hover:grayscale-0 transition-all" />
                    ))}
                </div>
            </div>

            {/* Folder Icon using Lucide (Centering hacks) */}
            <div ref={folderRef} className="relative z-10 w-16 h-16 flex items-center justify-center bg-zinc-900 rounded-full shrink-0">
                <Folder className="w-6 h-6 text-white fill-white/20" />
            </div>
        </div>
    );
};

export default WorkFolderButton;
