import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { Home, Briefcase, User, Mail, Sun, Moon, Volume2, VolumeX } from 'lucide-react';
import { playTick, playClick } from '../utils/sound';

const navItems = [
    { title: "Home", icon: Home, link: "#home" },
    { title: "Work", icon: Briefcase, link: "#work" },
    { title: "About", icon: User, link: "#about" },
    { title: "Contact", icon: Mail, link: "#contact" },
];

const DimensionNav = ({ isOpen, onClose, onNavigate, isLight, onToggleTheme, isSoundOn, onToggleSound }) => {
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
        if (isSoundOn) playClick();
        onNavigate(link);
    };

    const handleHover = () => {
        if (isSoundOn) playTick();
    };

    return (
        <div className={`fixed inset-0 z-40 flex items-center justify-center p-4 md:p-8 transition-all duration-500 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
            {/* Background Atmosphere */}
            <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm transition-opacity duration-500"></div>
            <div className="absolute inset-0 noise-texture opacity-10 mix-blend-overlay pointer-events-none" aria-hidden="true"></div>

            <div id="dimension-nav" ref={containerRef} className="w-full max-w-5xl flex flex-col gap-6 md:gap-8 relative z-10 perspective-1000 max-h-[85vh] overflow-y-auto md:overflow-visible no-scrollbar">

                {/* Main Nav Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    {navItems.map((item) => (
                        <a
                            key={item.title}
                            href={item.link}
                            onMouseEnter={handleHover}
                            onClick={(e) => handleNavClick(e, item.link)}
                            className="nav-card group relative h-[100px] md:h-[280px] bg-zinc-900/80 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-md hover:bg-zinc-800 transition-all duration-500 hover:-translate-y-1 md:hover:-translate-y-2 hover:border-white/20 hover:shadow-xl flex md:block items-center px-6 md:px-0"
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                            <div className="relative md:absolute md:top-6 md:left-6 p-2 bg-zinc-950 border border-white/10 rounded-lg text-zinc-500 group-hover:text-white transition-all duration-300 shrink-0 mr-4 md:mr-0">
                                <item.icon size={20} />
                            </div>
                            <div className="relative md:absolute md:bottom-6 md:left-6 md:right-6">
                                <h3 className="text-xl md:text-2xl font-display font-medium text-zinc-400 group-hover:text-white transition-colors tracking-wide">{item.title}</h3>
                                <div className="hidden md:block w-8 h-px bg-white/20 mt-4 group-hover:w-full transition-all duration-500 ease-out"></div>
                            </div>
                        </a>
                    ))}
                </div>

                {/* Bottom row: Theme + Sound toggles side by side */}
                <div className="nav-card flex flex-col md:flex-row justify-center md:justify-end gap-3">

                    {/* Light / Dark Mode */}
                    <button
                        onMouseEnter={handleHover}
                        onClick={() => { if (isSoundOn) playClick(); onToggleTheme(); }}
                        aria-pressed={isLight}
                        aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
                        className="group flex justify-between md:justify-start items-center gap-4 md:gap-3 w-full md:w-auto px-6 py-4 md:py-3 bg-zinc-900/80 border border-white/5 rounded-2xl md:rounded-full backdrop-blur-md hover:bg-zinc-800 transition-all duration-500 hover:border-white/20 hover:shadow-xl hover:-translate-y-1"
                    >
                        <div className="flex items-center gap-4 md:gap-3">
                            <div className="p-2 bg-zinc-950 border border-white/10 rounded-lg text-zinc-500 group-hover:text-white transition-all duration-300">
                                {isLight ? <Moon size={18} /> : <Sun size={18} />}
                            </div>
                            <span className="text-lg md:text-sm font-display font-medium text-zinc-400 group-hover:text-white transition-colors tracking-wide uppercase">
                                {isLight ? 'Dark Mode' : 'Light Mode'}
                            </span>
                        </div>
                        {/* Toggle switch — mobile only */}
                        <div className="md:hidden">
                            <div className="w-12 h-7 bg-zinc-950/80 rounded-full p-1 border border-white/10 shadow-inner">
                                <div className={`w-5 h-5 rounded-full shadow-md transition-all duration-300 ease-out ${isLight ? 'translate-x-5 bg-white' : 'translate-x-0 bg-zinc-600'}`}></div>
                            </div>
                        </div>
                    </button>

                    {/* Sound On / Off */}
                    <button
                        onMouseEnter={handleHover}
                        onClick={() => { onToggleSound(); }}
                        aria-pressed={isSoundOn}
                        aria-label={isSoundOn ? 'Turn sound off' : 'Turn sound on'}
                        className="group flex justify-between md:justify-start items-center gap-4 md:gap-3 w-full md:w-auto px-6 py-4 md:py-3 bg-zinc-900/80 border border-white/5 rounded-2xl md:rounded-full backdrop-blur-md hover:bg-zinc-800 transition-all duration-500 hover:border-white/20 hover:shadow-xl hover:-translate-y-1"
                    >
                        <div className="flex items-center gap-4 md:gap-3">
                            <div className={`p-2 bg-zinc-950 border border-white/10 rounded-lg transition-all duration-300 ${isSoundOn ? 'text-[#38bdf8] group-hover:text-[#38bdf8]' : 'text-zinc-500 group-hover:text-white'}`}>
                                {isSoundOn ? (
                                    /* Animated speaker waves */
                                    <div className="relative">
                                        <Volume2 size={18} />
                                        <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-[#38bdf8] animate-ping opacity-75" />
                                    </div>
                                ) : (
                                    <VolumeX size={18} />
                                )}
                            </div>
                            <span className={`text-lg md:text-sm font-display font-medium transition-colors tracking-wide uppercase ${isSoundOn ? 'text-[#38bdf8]' : 'text-zinc-400 group-hover:text-white'}`}>
                                Sound {isSoundOn ? 'On' : 'Off'}
                            </span>
                        </div>
                        {/* Toggle switch — mobile only */}
                        <div className="md:hidden">
                            <div className="w-12 h-7 bg-zinc-950/80 rounded-full p-1 border border-white/10 shadow-inner">
                                <div className={`w-5 h-5 rounded-full shadow-md transition-all duration-300 ease-out ${isSoundOn ? 'translate-x-5 bg-[#38bdf8]' : 'translate-x-0 bg-zinc-600'}`}></div>
                            </div>
                        </div>
                    </button>

                </div>
            </div>
        </div>
    );
};

export default DimensionNav;
