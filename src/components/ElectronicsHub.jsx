import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Premium Physics Engine ---
const NUM_SEGMENTS = 25; // Smoother curves
const GRAVITY = 0.2; // Less sag for a "tighter" high-tech feel
const FRICTION = 0.85;

// Helper to get source position based on container size and direction
const getSourcePos = (dir, width, height) => {
    const margin = 40; // Indent slightly so the plug base is visible
    switch (dir) {
        case 'N': return { x: width / 2, y: 0 + margin };
        case 'S': return { x: width / 2, y: height - margin };
        case 'W': return { x: 0 + margin, y: height / 2 };
        case 'E': return { x: width - margin, y: height / 2 };
        default: return { x: 0, y: 0 };
    }
};

const useCablePhysics = (startPos, endPos, isDragging) => {
    const points = useRef([]);
    const [path, setPath] = useState("");

    // Initialize points
    useEffect(() => {
        const p = [];
        for (let i = 0; i < NUM_SEGMENTS; i++) {
            const t = i / (NUM_SEGMENTS - 1);
            const x = startPos.x + (endPos.x - startPos.x) * t;
            const y = startPos.y + (endPos.y - startPos.y) * t;
            p.push({ x, y, oldX: x, oldY: y, pinned: i === 0 });
        }
        points.current = p;
    }, [startPos]); // Re-init on start change (resize)

    // Animation Loop
    useEffect(() => {
        let animationFrame;
        const update = () => {
            const pts = points.current;
            if (pts.length === 0) return;

            // Verlet Integration
            for (let i = 0; i < pts.length; i++) {
                const p = pts[i];
                if (p.pinned) continue;

                // Lock last point if dragging or connected
                if (i === pts.length - 1 && (isDragging || endPos)) continue;

                const vx = (p.x - p.oldX) * FRICTION;
                const vy = (p.y - p.oldY) * FRICTION;
                p.oldX = p.x;
                p.oldY = p.y;
                p.x += vx;
                p.y += vy;
                p.y += GRAVITY;
            }

            // Override End Point
            const last = pts[pts.length - 1];
            if (endPos) {
                last.x = endPos.x;
                last.y = endPos.y;
            }

            // Override Start Point
            pts[0].x = startPos.x;
            pts[0].y = startPos.y;

            // Constraints (Relaxation) - More iterations for stiffer cables
            const baseDist = 15; // Segment length
            for (let k = 0; k < 10; k++) {
                for (let i = 0; i < pts.length - 1; i++) {
                    const p1 = pts[i];
                    const p2 = pts[i + 1];
                    const dx = p2.x - p1.x;
                    const dy = p2.y - p1.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const diff = baseDist - dist;
                    const percent = diff / dist / 2;
                    const offsetX = dx * percent;
                    const offsetY = dy * percent;

                    if (!p1.pinned) { p1.x -= offsetX; p1.y -= offsetY; }
                    if (!p2.pinned && (i + 1 !== pts.length - 1 || (!isDragging && !endPos))) {
                        p2.x += offsetX; p2.y += offsetY;
                    }
                }
            }

            // Draw Path
            const d = `M ${pts[0].x} ${pts[0].y} ${pts.slice(1).map(p => `L ${p.x} ${p.y} `).join(" ")}`;
            setPath(d);
            animationFrame = requestAnimationFrame(update);
        };
        update();
        return () => cancelAnimationFrame(animationFrame);
    }, [startPos, endPos, isDragging]);

    return path;
};

const Cable = ({ start, end, isDragging, isConnected }) => {
    const path = useCablePhysics(start, end, isDragging);
    return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible">
            {/* Glow / Shadow */}
            <path d={path} stroke={isConnected ? "rgba(34, 211, 238, 0.3)" : "rgba(0,0,0,0.5)"} strokeWidth="8" fill="none" strokeLinecap="round" className="blur-sm transition-colors duration-500" />
            {/* Core Cable */}
            <path d={path} stroke={isConnected ? "#cbd5e1" : "#52525b"} strokeWidth="2" fill="none" strokeLinecap="round" className="transition-colors duration-500" />
            {/* Data Flow */}
            {isConnected && (
                <path d={path} stroke="#06b6d4" strokeWidth="2" fill="none" strokeDasharray="10 10" className="animate-current-flow mix-blend-screen" />
            )}
        </svg>
    );
};

// Circuit Pattern SVG Component
const CircuitPattern = () => (
    <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <pattern id="circuit-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M10 10 h10 v10 h10 v-10 h10" stroke="#06b6d4" strokeWidth="1" fill="none" />
            <circle cx="10" cy="10" r="2" fill="#06b6d4" />
            <circle cx="40" cy="10" r="2" fill="#06b6d4" />

            <path d="M60 60 h-10 v-10 h-10 v10 h-10" stroke="#06b6d4" strokeWidth="1" fill="none" />
            <circle cx="60" cy="60" r="2" fill="#06b6d4" />
            <circle cx="30" cy="60" r="2" fill="#06b6d4" />

            <path d="M80 20 v20 h10" stroke="#06b6d4" strokeWidth="1" fill="none" />
            <circle cx="80" cy="20" r="2" fill="#06b6d4" />
            <circle cx="90" cy="40" r="2" fill="#06b6d4" />

            <path d="M10 80 v-20 h10" stroke="#06b6d4" strokeWidth="1" fill="none" />
            <circle cx="10" cy="80" r="2" fill="#06b6d4" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#circuit-pattern)" />
    </svg>
);

const ElectronicsHub = ({ onUnlock, onConnected }) => {
    const containerRef = useRef(null);
    const [size, setSize] = useState({ w: 800, h: 600 });
    const [cables, setCables] = useState([
        { id: 'N', dir: 'N', connected: false },
        { id: 'S', dir: 'S', connected: false },
        { id: 'W', dir: 'W', connected: false },
        { id: 'E', dir: 'E', connected: false },
    ]);
    const [dragState, setDragState] = useState({ id: null, pos: null });
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [warpEffect, setWarpEffect] = useState(false);

    // Responsive Size
    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                const { width, height } = containerRef.current.getBoundingClientRect();
                setSize({ w: width, h: height });
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const center = { x: size.w / 2, y: size.h / 2 };

    // Core Ports Location (Orbit around center)
    const getPortPos = (dir) => {
        const offset = 70; // Larger core radius
        switch (dir) {
            case 'N': return { x: center.x, y: center.y - offset };
            case 'S': return { x: center.x, y: center.y + offset };
            case 'W': return { x: center.x - offset, y: center.y };
            case 'E': return { x: center.x + offset, y: center.y };
            default: return center;
        }
    };

    const handlePointerDown = (id, e) => {
        const cable = cables.find(c => c.id === id);
        if (cable.connected) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setDragState({ id, pos: { x, y } });
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e) => {
        if (!dragState.id) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setDragState(prev => ({ ...prev, pos: { x, y } }));
    };

    const handlePointerUp = (e) => {
        if (!dragState.id) return;

        const cable = cables.find(c => c.id === dragState.id);
        const portPos = getPortPos(cable.dir);

        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const dist = Math.sqrt(Math.pow(x - portPos.x, 2) + Math.pow(y - portPos.y, 2));

        if (dist < 100) { // Very generous snap range for better UX
            setCables(prev => prev.map(c => c.id === dragState.id ? { ...c, connected: true } : c));
        }

        setDragState({ id: null, pos: null });
        e.currentTarget.releasePointerCapture(e.pointerId);
    };

    const allConnected = cables.every(c => c.connected);
    useEffect(() => {
        if (allConnected && !isUnlocked) {
            setIsUnlocked(true);
            onConnected && onConnected(); // Immediate feedback for UI update
            // Trigger warp animation
            setTimeout(() => setWarpEffect(true), 1500);
            // Unlock
            setTimeout(() => onUnlock && onUnlock(), 2500);
        }
    }, [allConnected, isUnlocked, onUnlock, onConnected]);

    return (
        <div ref={containerRef} className="relative w-full h-[80vh] bg-zinc-950 overflow-hidden flex items-center justify-center touch-none select-none font-sans border-y border-zinc-800">
            {/* Circuit Background Layer */}
            <CircuitPattern />

            {/* Radial Vignette */}
            <div className={`absolute inset-0 bg-radial-gradient from-transparent to-black opacity-80 pointer-events-none transition-opacity duration-1000 ${warpEffect ? 'opacity-0' : 'opacity-80'}`}></div>

            {/* Central Quantum Core */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] flex items-center justify-center pointer-events-none z-10">

                {/* 1. Outer Stability Ring */}
                <motion.div
                    animate={{ rotate: isUnlocked ? 180 : 0, scale: isUnlocked ? 0.9 : 1 }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                    className={`absolute w-[300px] h-[300px] rounded-full border border-zinc-800 flex items-center justify-center transition-colors duration-500 ${allConnected ? 'border-cyan-500/30' : ''}`}
                >
                    <div className="absolute w-[310px] h-[1px] bg-zinc-900 rotate-0"></div>
                    <div className="absolute w-[310px] h-[1px] bg-zinc-900 rotate-90"></div>
                </motion.div>

                {/* 2. Rotating Gyroscope Rings */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className={`absolute w-[240px] h-[240px] rounded-full border border-zinc-700 border-t-transparent border-b-transparent transition-all duration-500 ${allConnected ? 'border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.1)]' : ''}`}
                />
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className={`absolute w-[200px] h-[200px] rounded-full border-2 border-zinc-600 border-l-transparent border-r-transparent transition-all duration-500 ${allConnected ? 'border-cyan-300' : ''}`}
                />

                {/* 3. The Reactor / Text */}
                <motion.div
                    animate={{ scale: isUnlocked ? [1, 1.1, 1] : 1 }}
                    transition={{ duration: 1, repeat: isUnlocked ? 2 : 0 }}
                    className="relative w-32 h-32 flex flex-col items-center justify-center z-20"
                >
                    {/* Glass Effect Core */}
                    <div className={`absolute inset-0 rounded-full bg-zinc-900/50 backdrop-blur-md border border-zinc-700 transition-colors duration-500 ${allConnected ? 'border-cyan-500/50 bg-cyan-950/30' : ''}`}></div>

                    <AnimatePresence mode="wait">
                        {!allConnected ? (
                            <motion.div
                                key="locked"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                className="flex flex-col items-center gap-1 z-30"
                            >
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_red]"></div>
                                <span className="text-[10px] tracking-[0.2em] text-zinc-500 uppercase font-medium">Locked</span>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="unlocked"
                                initial={{ opacity: 0, scale: 1.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center gap-1 z-30"
                            >
                                <div className="w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_20px_cyan]"></div>
                                <span className="text-[10px] tracking-[0.2em] text-cyan-200 uppercase font-medium glow-text">Active</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* Ports on Core - Minimalist */}
            {['N', 'S', 'W', 'E'].map(dir => {
                const pos = getPortPos(dir);
                return (
                    <div
                        key={dir}
                        className="absolute w-4 h-4 -ml-2 -mt-2 rounded-full border border-zinc-600 bg-black z-0 flex items-center justify-center"
                        style={{ left: pos.x, top: pos.y }}
                    >
                        <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${cables.find(c => c.dir === dir).connected ? 'bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]' : 'bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]'}`}></div>
                    </div>
                );
            })}

            {/* Cables & Handles */}
            {cables.map(c => {
                const start = getSourcePos(c.dir, size.w, size.h);
                const target = getPortPos(c.dir);
                // Determine end point
                let end = { x: start.x, y: start.y };
                if (c.connected) end = target;
                else if (dragState.id === c.id) end = dragState.pos;

                return (
                    <React.Fragment key={c.id}>
                        <Cable start={start} end={end} isDragging={dragState.id === c.id} isConnected={c.connected} />

                        {/* Premium Drag Handle */}
                        <motion.div
                            onPointerDown={(e) => handlePointerDown(c.id, e)}
                            onPointerMove={handlePointerMove}
                            onPointerUp={handlePointerUp}
                            className={`absolute -ml-3 -mt-3 w-6 h-6 rounded-full z-30 flex items-center justify-center transition-all ${c.connected ? 'pointer-events-none' : 'cursor-grab hover:scale-125'}`}
                            style={{ left: end.x, top: end.y }}
                            animate={{
                                scale: 1, // Keep handle visible
                                opacity: isUnlocked ? 0 : 1
                            }}
                        >
                            <div className={`absolute inset-0 rounded-full border ${c.connected ? 'border-transparent' : 'border-zinc-400'} bg-black`}></div>
                            <div className={`w-2 h-2 rounded-full ${c.connected ? 'bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]' : 'bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]'}`}></div>
                            {/* Magnetic Guide Interaction Ring */}
                            {!c.connected && dragState.id === c.id && (
                                <motion.div
                                    className="absolute inset-0 rounded-full border border-white opacity-50"
                                    animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                />
                            )}
                        </motion.div>
                    </React.Fragment>
                );
            })}

            {/* Cinematic Full-Screen Warp Transition */}
            <AnimatePresence>
                {warpEffect && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 z-[100] bg-white mix-blend-exclusion pointer-events-none"
                    >
                        <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 0.8, ease: "circIn" }}
                            className="absolute inset-0 bg-white origin-left"
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Instruction Cue Removed based on user request */}
        </div>
    );
};

export default ElectronicsHub;
