import React from 'react';

const Navigation = ({ isOpen, onToggle }) => {
    return (
        <>
            <nav className="fixed top-0 left-0 w-full z-50 px-6 py-8 md:px-12 flex justify-between items-center mix-blend-difference text-white pointer-events-none">
                {/* Logo area - simple text as per target */}
                <a href="/" className="pointer-events-auto text-sm md:text-base font-medium tracking-wide uppercase hover:opacity-70 transition-opacity">
                    Krrish Nyoupane
                </a>

                {/* Menu Button - Apple Crystal Style */}
                <button
                    onClick={onToggle}
                    className="pointer-events-auto group relative px-8 py-3 rounded-full transition-all duration-300 hover:scale-105 active:scale-95"
                    style={{
                        zIndex: 60,
                        background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)', // Safari support
                        boxShadow: '0 4px 24px -1px rgba(0,0,0,0.2), inset 0 1px 0 0 rgba(255,255,255,0.2), inset 0 0 0 1px rgba(255,255,255,0.1)'
                    }}
                >
                    {/* Gloss Highlight */}
                    <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-50"></div>

                    {/* Text content */}
                    <div className="relative z-10 flex items-center gap-2.5">
                        <span className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${isOpen ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'bg-white/80 shadow-[0_0_8px_rgba(255,255,255,0.6)]'}`}></span>
                        <span className="uppercase text-[11px] md:text-xs tracking-[0.2em] font-medium text-white/90 group-hover:text-white transition-colors">
                            {isOpen ? 'Close' : 'Menu'}
                        </span>
                    </div>
                </button>
            </nav>
        </>
    );
};

export default Navigation;
