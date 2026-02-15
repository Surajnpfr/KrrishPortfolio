import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { X } from 'lucide-react';

const MenuOverlay = ({ isOpen, onClose }) => {
    const overlayRef = useRef(null);
    const linksRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            const tl = gsap.timeline();

            tl.to(overlayRef.current, {
                y: 0,
                duration: 1,
                ease: "power4.inOut"
            });

            tl.fromTo(linksRef.current.children,
                { y: 100, opacity: 0 },
                { y: 0, opacity: 1, duration: 1, stagger: 0.1, ease: "power3.out" },
                "-=0.5"
            );

        } else {
            const tl = gsap.timeline({
                onComplete: () => {
                    // Optional cleanup or state reset if needed
                }
            });

            tl.to(overlayRef.current, {
                y: "-100%",
                duration: 0.8,
                ease: "power4.inOut"
            });
        }
    }, [isOpen]);

    return (
        <div ref={overlayRef} className="fixed inset-0 z-[60] bg-zinc-900 text-white transform -translate-y-full flex flex-col justify-between p-6 md:p-16">
            <div className="flex justify-between items-start">
                <div className="text-xs md:text-sm font-mono text-zinc-500 uppercase tracking-widest">Navigation</div>
                <button onClick={onClose} className="p-2 hover:rotate-90 transition-transform duration-500">
                    <X size={32} />
                </button>
            </div>

            <div ref={linksRef} className="flex flex-col gap-2 md:gap-8 justify-center h-full">
                {['Home', 'Work', 'About', 'Contact'].map((item) => (
                    <div key={item} className="overflow-hidden">
                        <a href={`#${item.toLowerCase()}`} onClick={onClose} className="block font-display text-[15vw] md:text-8xl lg:text-9xl font-bold uppercase hover:text-zinc-500 transition-colors duration-300 leading-[0.85]">
                            {item}
                        </a>
                    </div>
                ))}
            </div>

            {/* Socials & Copyright removed as per request */}
        </div>
    );
};

export default MenuOverlay;
