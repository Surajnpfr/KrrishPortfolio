import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { Home, Briefcase, User, Mail, ArrowUpRight } from 'lucide-react';

const navItems = [
    { title: "Home", icon: Home, link: "#home" },
    { title: "Work", icon: Briefcase, link: "#work" },
    { title: "About", icon: User, link: "#about" },
    { title: "Contact", icon: Mail, link: "#contact" },
];

const DimensionNav = ({ isOpen, onClose, onNavigate }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            gsap.fromTo(".nav-card",
                { y: 100, opacity: 0, rotateX: -20 },
                { y: 0, opacity: 1, rotateX: 0, stagger: 0.1, duration: 0.8, ease: "back.out(1.2)" }
            );
        }
    }, [isOpen]);

    const handleNavClick = (e, link) => {
        e.preventDefault();
        onNavigate(link); // Delegate navigation to Parent
    };

    return (
        <div className={`fixed inset-0 z-40 flex items-center justify-center p-4 md:p-8 transition-all duration-500 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
            {/* Background Atmosphere - Semi-transparent to see the 'receding' page behind */}
            <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm transition-opacity duration-500"></div>
            <div className="absolute inset-0 bg-[url('http://assets.iceable.com/img/noise-transparent.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>

            {/* Container: Added max-height and overflow-y-auto for mobile scrolling if needed */}
            <div ref={containerRef} className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 relative z-10 perspective-1000 max-h-[85vh] overflow-y-auto md:overflow-visible no-scrollbar">
                {navItems.map((item, index) => (
                    <a
                        key={item.title}
                        href={item.link}
                        onClick={(e) => handleNavClick(e, item.link)}
                        className="nav-card group relative h-[100px] md:h-[280px] bg-zinc-900/80 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-md hover:bg-zinc-800 transition-all duration-500 hover:-translate-y-1 md:hover:-translate-y-2 hover:border-white/20 hover:shadow-xl flex md:block items-center px-6 md:px-0"
                    >
                        {/* Subtle Gradient Hover */}
                        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                        {/* Icon: Flex-row on mobile, Absolute Top-Left on Desktop */}
                        <div className="relative md:absolute md:top-6 md:left-6 p-2 bg-zinc-950 border border-white/10 rounded-lg text-zinc-500 group-hover:text-white transition-all duration-300 shrink-0 mr-4 md:mr-0">
                            <item.icon size={20} />
                        </div>

                        {/* Text: Flex-row on mobile, Absolute Bottom on Desktop */}
                        <div className="relative md:absolute md:bottom-6 md:left-6 md:right-6">
                            <h3 className="text-xl md:text-2xl font-display font-medium text-zinc-400 group-hover:text-white transition-colors tracking-wide">{item.title}</h3>
                            <div className="hidden md:block w-8 h-px bg-white/20 mt-4 group-hover:w-full transition-all duration-500 ease-out"></div>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
};

export default DimensionNav;
