import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const Hero = () => {
    const containerRef = useRef(null);
    const titleRef    = useRef(null);
    const subRef      = useRef(null);
    const canvasRef   = useRef(null);
    const cursorRef   = useRef(null);
    const cursorDotRef = useRef(null);
    const orb1Ref     = useRef(null);
    const orb2Ref     = useRef(null);
    const orb3Ref     = useRef(null);
    const orb4Ref     = useRef(null);

    useEffect(() => {
        // ─── TEXT ENTRANCE ───────────────────────────────────────────────────────
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ delay: 2.2 });
            tl.fromTo('.hero-line',
                { y: 150, rotate: 5, opacity: 0 },
                { y: 0, rotate: 0, opacity: 1, duration: 1.8, stagger: 0.15, ease: 'power4.out' }
            ).fromTo(subRef.current,
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 1.2, ease: 'power2.out' },
                '-=1'
            );
        }, containerRef);

        if (window.innerWidth < 768) return () => ctx.revert();

        // ─── SHARED MOUSE STATE ──────────────────────────────────────────────────
        const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        const lerp  = (a, b, t) => a + (b - a) * t;

        // ─── CANVAS DOT GRID ─────────────────────────────────────────────────────
        const canvas  = canvasRef.current;
        const gl      = canvas.getContext('2d');
        const SPACING = 48;
        const REPEL_R = 150;
        const REPEL_S = 90;
        const SPRING  = 0.055;
        const DAMP    = 0.72;
        let dots      = [];

        const buildGrid = () => {
            dots = [];
            const cols = Math.ceil(canvas.width  / SPACING) + 2;
            const rows = Math.ceil(canvas.height / SPACING) + 2;
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    dots.push({
                        ox: c * SPACING, oy: r * SPACING,
                        x:  c * SPACING, y:  r * SPACING,
                        vx: 0, vy: 0,
                        phase: Math.random() * Math.PI * 2, // for idle wave
                    });
                }
            }
        };

        const resize = () => {
            canvas.width  = window.innerWidth;
            canvas.height = window.innerHeight;
            buildGrid();
        };
        resize();
        window.addEventListener('resize', resize);

        let startTime = performance.now();
        let canvasRaf;

        const drawCanvas = (now) => {
            const t = (now - startTime) / 1000;
            gl.clearRect(0, 0, canvas.width, canvas.height);

            for (const dot of dots) {
                // Idle breathing wave (gentle, slow)
                const idleX = Math.cos(dot.phase + t * 0.7) * 1.2;
                const idleY = Math.sin(dot.phase + t * 0.5) * 1.2;

                const dx   = dot.x - mouse.x;
                const dy   = dot.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                // Spring back to origin + idle offset
                dot.vx += (dot.ox + idleX - dot.x) * SPRING;
                dot.vy += (dot.oy + idleY - dot.y) * SPRING;

                // Magnetic repulsion
                if (dist < REPEL_R && dist > 0) {
                    const force = (1 - dist / REPEL_R) * REPEL_S;
                    dot.vx += (dx / dist) * force * 0.08;
                    dot.vy += (dy / dist) * force * 0.08;
                }

                dot.vx *= DAMP;
                dot.vy *= DAMP;
                dot.x  += dot.vx;
                dot.y  += dot.vy;

                const prox   = Math.max(0, 1 - dist / REPEL_R);
                const radius = 1.3 + prox * 3.5;
                const alpha  = 0.12 + prox * 0.7;

                if (prox > 0.05) {
                    // Colour shifts from cyan → hot-pink based on proximity angle
                    const angle = Math.atan2(dy, dx);
                    const hue   = (180 + (angle / Math.PI) * 60 + 360) % 360; // ~180–240 cyan/blue range
                    gl.shadowColor = `hsla(${hue}, 100%, 70%, ${prox * 0.9})`;
                    gl.shadowBlur  = 10;
                    gl.fillStyle   = `hsla(${hue}, 100%, 75%, ${alpha})`;
                } else {
                    gl.shadowBlur = 0;
                    gl.fillStyle  = `rgba(255,255,255,${alpha})`;
                }

                gl.beginPath();
                gl.arc(dot.x, dot.y, radius, 0, Math.PI * 2);
                gl.fill();
            }

            canvasRaf = requestAnimationFrame(drawCanvas);
        };
        canvasRaf = requestAnimationFrame(drawCanvas);

        // ─── AURORA ORBS (4-layer parallax) ──────────────────────────────────────
        const pos = [1,2,3,4].map(() => ({ x: mouse.x, y: mouse.y }));
        const SPEEDS = [0.13, 0.07, 0.035, 0.018];
        const ORB_REFS = [orb1Ref, orb2Ref, orb3Ref, orb4Ref];
        const ORB_SIZES = [600, 600, 750, 900];
        let orbRaf;

        const tickOrbs = () => {
            for (let i = 0; i < 4; i++) {
                pos[i].x = lerp(pos[i].x, mouse.x, SPEEDS[i]);
                pos[i].y = lerp(pos[i].y, mouse.y, SPEEDS[i]);
                if (ORB_REFS[i].current) {
                    const half = ORB_SIZES[i] / 2;
                    ORB_REFS[i].current.style.transform = `translate(${pos[i].x - half}px, ${pos[i].y - half}px)`;
                }
            }
            orbRaf = requestAnimationFrame(tickOrbs);
        };
        orbRaf = requestAnimationFrame(tickOrbs);

        // ─── CUSTOM CURSOR ────────────────────────────────────────────────────────
        let cursorRaf;
        const cursorPos = { x: mouse.x, y: mouse.y };

        const tickCursor = () => {
            cursorPos.x = lerp(cursorPos.x, mouse.x, 0.18);
            cursorPos.y = lerp(cursorPos.y, mouse.y, 0.18);
            if (cursorRef.current) {
                cursorRef.current.style.transform = `translate(${mouse.x - 6}px, ${mouse.y - 6}px)`;
            }
            if (cursorDotRef.current) {
                cursorDotRef.current.style.transform = `translate(${cursorPos.x - 24}px, ${cursorPos.y - 24}px)`;
            }
            cursorRaf = requestAnimationFrame(tickCursor);
        };
        cursorRaf = requestAnimationFrame(tickCursor);

        // ─── MOUSE LISTENER ───────────────────────────────────────────────────────
        const onMouseMove = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; };
        window.addEventListener('mousemove', onMouseMove);

        // ─── CURSOR HOVER SCALE ON INTERACTIVE ELEMENTS ──────────────────────────
        const grown = () => {
            gsap.to([cursorRef.current, cursorDotRef.current], { scale: 2.2, duration: 0.3 });
        };
        const shrunk = () => {
            gsap.to([cursorRef.current, cursorDotRef.current], { scale: 1, duration: 0.3 });
        };
        document.querySelectorAll('a, button, [role=button]').forEach(el => {
            el.addEventListener('mouseenter', grown);
            el.addEventListener('mouseleave', shrunk);
        });

        return () => {
            ctx.revert();
            cancelAnimationFrame(canvasRaf);
            cancelAnimationFrame(orbRaf);
            cancelAnimationFrame(cursorRaf);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return (
        <section
            ref={containerRef}
            className="min-h-screen flex flex-col justify-center px-4 md:px-8 lg:px-16 pt-24 pb-12 overflow-hidden relative z-10 cursor-none"
        >
            {/* ── Canvas dot grid (desktop) ─────────────────────────────────── */}
            <canvas
                ref={canvasRef}
                className="hidden md:block fixed inset-0 pointer-events-none"
                style={{ zIndex: 0, width: '100vw', height: '100vh' }}
            />

            {/* ── Custom cursor (desktop) ───────────────────────────────────── */}
            <div className="hidden md:block">
                {/* Inner dot — fast */}
                <div
                    ref={cursorRef}
                    className="fixed top-0 left-0 pointer-events-none"
                    style={{ zIndex: 9999, willChange: 'transform' }}
                >
                    <div
                        className="w-3 h-3 rounded-full"
                        style={{
                            background: '#00d9ff',
                            boxShadow: '0 0 12px 4px rgba(0,217,255,0.9)',
                        }}
                    />
                </div>
                {/* Outer ring — slower, lerped */}
                <div
                    ref={cursorDotRef}
                    className="fixed top-0 left-0 pointer-events-none"
                    style={{ zIndex: 9998, willChange: 'transform' }}
                >
                    <div
                        className="w-12 h-12 rounded-full border"
                        style={{
                            borderColor: 'rgba(0,217,255,0.5)',
                            boxShadow: '0 0 20px 2px rgba(0,217,255,0.25), inset 0 0 20px 2px rgba(0,217,255,0.1)',
                        }}
                    />
                </div>
            </div>

            {/* ── Aurora orbs (desktop) ─────────────────────────────────────── */}
            <div className="hidden md:block">
                {/* 1 — Electric cyan, fastest */}
                <div
                    ref={orb1Ref}
                    className="fixed top-0 left-0 w-[600px] h-[600px] rounded-full pointer-events-none"
                    style={{
                        background: 'radial-gradient(circle, rgba(0,217,255,0.28) 0%, rgba(56,189,248,0.14) 40%, transparent 70%)',
                        zIndex: 1, willChange: 'transform',
                        filter: 'blur(4px)',
                    }}
                />
                {/* 2 — Hot pink */}
                <div
                    ref={orb2Ref}
                    className="fixed top-0 left-0 w-[600px] h-[600px] rounded-full pointer-events-none"
                    style={{
                        background: 'radial-gradient(circle, rgba(255,0,110,0.22) 0%, rgba(236,72,153,0.10) 50%, transparent 70%)',
                        zIndex: 1, willChange: 'transform',
                        filter: 'blur(4px)',
                    }}
                />
                {/* 3 — Violet */}
                <div
                    ref={orb3Ref}
                    className="fixed top-0 left-0 w-[750px] h-[750px] rounded-full pointer-events-none"
                    style={{
                        background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, rgba(99,102,241,0.08) 55%, transparent 70%)',
                        zIndex: 1, willChange: 'transform',
                        filter: 'blur(6px)',
                    }}
                />
                {/* 4 — Emerald, slow */}
                <div
                    ref={orb4Ref}
                    className="fixed top-0 left-0 w-[900px] h-[900px] rounded-full pointer-events-none"
                    style={{
                        background: 'radial-gradient(circle, rgba(0,255,136,0.10) 0%, transparent 60%)',
                        zIndex: 1, willChange: 'transform',
                        filter: 'blur(8px)',
                    }}
                />
            </div>

            {/* ── Hero heading ──────────────────────────────────────────────── */}
            <h1
                ref={titleRef}
                className="font-display font-bold text-[18vw] sm:text-7xl md:text-[13.5vw] leading-[0.82] tracking-tighter uppercase text-white z-10 flex flex-col relative"
            >
                <div className="overflow-hidden flex">
                    <div className="hero-line origin-top-left">UI/UX</div>
                </div>
                <div className="overflow-hidden flex">
                    <div
                        className="hero-line origin-top-left"
                        style={{
                            backgroundImage: 'linear-gradient(90deg, #ffffff 0%, #a5f3fc 40%, #e879f9 70%, #ffffff 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundSize: '200% auto',
                            animation: 'shimmer 6s linear infinite',
                        }}
                    >
                        Designer
                    </div>
                </div>
                <div className="overflow-hidden flex items-baseline gap-2">
                    <div className="hero-line origin-top-left text-zinc-600">&</div>
                    <div className="hero-line origin-top-left">Game</div>
                </div>
                <div className="overflow-hidden flex">
                    <div
                        className="hero-line origin-top-left"
                        style={{
                            backgroundImage: 'linear-gradient(90deg, #ffffff 0%, #818cf8 40%, #34d399 70%, #ffffff 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundSize: '200% auto',
                            animation: 'shimmer 8s linear infinite reverse',
                        }}
                    >
                        Developer
                    </div>
                </div>
            </h1>

            {/* ── Sub-row ───────────────────────────────────────────────────── */}
            <div
                ref={subRef}
                className="mt-16 md:mt-24 flex flex-col md:flex-row justify-between items-start w-full border-t border-white/10 pt-8 relative z-10"
            >
                <div className="max-w-xl">
                    <p className="text-sm md:text-lg text-zinc-400 font-light leading-relaxed font-sans">
                        Designing intuitive and engaging digital products with a focus on clarity,
                        usability, and delightful interactions.
                    </p>
                </div>

                {/* Desktop floating stats */}
                <div className="hidden md:flex flex-col items-end gap-3 text-right">
                    {[
                        { num: '5+',  label: 'Years Experience' },
                        { num: '30+', label: 'Projects Shipped' },
                        { num: '∞',   label: 'Ideas Remaining' },
                    ].map(({ num, label }) => (
                        <div key={label} className="flex items-baseline gap-2">
                            <span className="font-display font-bold text-2xl text-white/90">{num}</span>
                            <span className="text-[10px] uppercase tracking-widest text-zinc-600">{label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Shimmer keyframe via style tag ───────────────────────────── */}
            <style>{`
                @keyframes shimmer {
                    0%   { background-position: 0%   center; }
                    100% { background-position: 200% center; }
                }
            `}</style>
        </section>
    );
};

export default Hero;
