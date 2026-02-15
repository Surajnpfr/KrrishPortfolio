import React from 'react';
import { Layers } from 'lucide-react';

const LiquidWorkButton = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="fixed bottom-8 right-8 z-[70] w-16 h-16 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full flex items-center justify-center text-white hover:scale-110 hover:bg-white hover:text-black transition-all duration-300 group shadow-lg"
        >
            <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md"></div>
            <Layers className="relative z-10 w-6 h-6 animate-pulse group-hover:animate-none" />
            <span className="absolute -top-10 right-0 bg-white text-black text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Liquid View
            </span>
        </button>
    );
};

export default LiquidWorkButton;
