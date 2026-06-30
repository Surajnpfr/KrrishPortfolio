import React, { useEffect, useRef, useState } from 'react';
import { Instagram, Facebook, Linkedin, Github, X, Mail, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ContactSnake = () => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const mouseRef = useRef({ x: 0, y: 0 });
    const [showEmail, setShowEmail] = React.useState(false);
    const [copied, setCopied] = React.useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const pointer = { clientX: 0, clientY: 0 };

        const resize = () => {
            if (containerRef.current) {
                canvas.width = containerRef.current.clientWidth;
                canvas.height = containerRef.current.clientHeight;
            } else {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            }

            if (mouseRef.current.x === 0) {
                const rect = canvas.getBoundingClientRect();
                pointer.clientX = rect.left + canvas.width / 2;
                pointer.clientY = rect.top + canvas.height / 2;
                mouseRef.current.x = canvas.width / 2;
                mouseRef.current.y = canvas.height / 2;
            }
        };
        window.addEventListener('resize', resize);
        resize();

        const onMouseMove = (e) => {
            pointer.clientX = e.clientX;
            pointer.clientY = e.clientY;
        };
        window.addEventListener('mousemove', onMouseMove, { passive: true });

        // Snake Configuration
        const segments = 40; // Fewer segments for tighter control
        const width = 25; // Sleek
        // const speed = 0.1; // Lerp factor for head

        // Trace points for the snake body
        const points = Array.from({ length: segments }, (_, i) => ({
            x: canvas.width / 2,
            y: canvas.height / 2
        }));

        const animate = () => {
            // ponytail: one layout read per frame — accurate after scroll/transform, not per mousemove
            const rect = canvas.getBoundingClientRect();
            mouseRef.current.x = pointer.clientX - rect.left;
            mouseRef.current.y = pointer.clientY - rect.top;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Move Head towards Mouse (Lerp)
            const targetX = mouseRef.current.x;
            const targetY = mouseRef.current.y;

            // Ease the head towards the mouse
            points[0].x += (targetX - points[0].x) * 0.1;
            points[0].y += (targetY - points[0].y) * 0.1;

            // Body follows (IK-like or standard follow)
            for (let i = 1; i < segments; i++) {
                const leader = points[i - 1];
                const follower = points[i];

                const dx = leader.x - follower.x;
                const dy = leader.y - follower.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                // Spring/Relaxation to maintain distance
                const segLen = 15; // Distance between segments
                if (dist > segLen) {
                    const angle = Math.atan2(dy, dx);
                    follower.x = leader.x - Math.cos(angle) * segLen;
                    follower.y = leader.y - Math.sin(angle) * segLen;
                } else {
                    // Adding a little optional 'wobble' or just simple follow
                    // To make it smoother when stationary
                    follower.x += dx * 0.5;
                    follower.y += dy * 0.5;
                }
            }

            // Draw Snake
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.lineWidth = width;
            ctx.strokeStyle = '#FFFFFF';
            // ctx.shadowBlur = 15;
            // ctx.shadowColor = 'rgba(255,255,255,0.3)';

            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);

            // Smooth curve
            for (let i = 1; i < segments - 1; i++) {
                const xc = (points[i].x + points[i + 1].x) / 2;
                const yc = (points[i].y + points[i + 1].y) / 2;
                ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
            }
            // Tail
            if (segments > 1) {
                const last = points[segments - 1];
                ctx.lineTo(last.x, last.y);
            }

            ctx.stroke();

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', onMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <footer ref={containerRef} id="contact" className="relative w-full pt-12 md:pt-20 pb-1 bg-black overflow-hidden flex flex-col items-center justify-center">
            {/* The Snake Canvas - Behind Text */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 z-10 pointer-events-none hidden md:block" // Hidden on mobile, block on desktop 
            // Actually, if we want the snake to follow cursor GLOBALLY, we need window listener (which we have).
            // If we want it to hide when not hovering footer, that's different. Assuming global or active when footer visible.
            // Keeping it active always for now since it's a footer 'hero' element.
            />

            {/* Content - On Top with Mix Blend Mode */}
            <div className="relative z-20 flex flex-col items-center justify-center text-center mix-blend-difference px-6">
                <h2 className="font-display text-5xl md:text-6xl lg:text-8xl font-bold uppercase tracking-tight mb-8 text-white leading-[0.9]">
                    Let's Work<br />Together
                </h2>

                <div className="mb-8 relative flex items-center justify-center min-h-[60px]">
                    <AnimatePresence mode="wait">
                        {!showEmail ? (
                            <motion.button
                                key="contact-btn"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                onClick={() => setShowEmail(true)}
                                aria-label="Get in touch"
                                className="px-8 py-4 border border-white rounded-full hover:bg-white hover:text-black transition-all duration-300 uppercase text-sm tracking-widest text-white bg-transparent pointer-events-auto"
                            >
                                Get in Touch
                            </motion.button>
                        ) : (
                            <motion.div
                                key="mail-card"
                                initial={{ opacity: 0, scale: 0.5, rotateX: -90 }}
                                animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                                exit={{ opacity: 0, scale: 0.5, rotateX: 90 }}
                                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                                className="relative bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-6 max-w-md w-[90vw] md:w-auto pointer-events-auto"
                            >
                                {/* Close Button */}
                                <button
                                    onClick={() => setShowEmail(false)}
                                    aria-label="Close contact form"
                                    className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors min-w-11 min-h-11 flex items-center justify-center"
                                >
                                    <X size={20} aria-hidden="true" />
                                </button>

                                {/* Envelope Icon Animation */}
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-2"
                                >
                                    <Mail size={32} className="text-white" />
                                </motion.div>

                                <div className="text-center">
                                    <h3 className="text-white font-display text-xl uppercase tracking-widest mb-2">Send Coordinates</h3>
                                    <p className="text-zinc-500 text-sm font-mono">Click below to copy secure channel address.</p>
                                </div>

                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText("nyoupanekrrish@gmail.com");
                                        setCopied(true);
                                        setTimeout(() => setCopied(false), 2000);
                                    }}
                                    aria-label={copied ? 'Email copied' : 'Copy email address'}
                                    className="group relative w-full px-6 py-4 bg-black border border-zinc-700 rounded-lg text-white hover:border-white transition-colors flex items-center justify-between gap-4"
                                >
                                    <span className="font-mono text-sm tracking-widest truncate">
                                        nyoupanekrrish@gmail.com
                                    </span>
                                    <div className="flex items-center justify-center w-8 h-8 rounded bg-zinc-800 group-hover:bg-white group-hover:text-black transition-colors">
                                        {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                    </div>

                                    {copied && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute -top-10 left-1/2 -translate-x-1/2 bg-green-500 text-black text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest whitespace-nowrap"
                                        >
                                            Copied!
                                        </motion.div>
                                    )}
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex gap-8 mb-8 text-white pointer-events-auto">
                    <a href="https://github.com/nyoupanekrrish" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="hover:scale-110 transition-transform duration-300 min-w-11 min-h-11 flex items-center justify-center"><Github size={24} aria-hidden="true" /></a>
                    <a href="https://www.instagram.com/nyoupane_jii" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:scale-110 transition-transform duration-300 min-w-11 min-h-11 flex items-center justify-center"><Instagram size={24} aria-hidden="true" /></a>
                    <a href="https://www.facebook.com/krrish.nyoupane" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:scale-110 transition-transform duration-300 min-w-11 min-h-11 flex items-center justify-center"><Facebook size={24} aria-hidden="true" /></a>
                    <a href="https://www.linkedin.com/in/krrish-nyoupane/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:scale-110 transition-transform duration-300 min-w-11 min-h-11 flex items-center justify-center"><Linkedin size={24} aria-hidden="true" /></a>
                </div>

                <p className="text-xs text-white/70 uppercase tracking-widest mt-2 mb-0">
                    © {new Date().getFullYear()} Krrish Nyoupane. All rights reserved.
                </p>
            </div>
        </footer>
    );
};

export default ContactSnake;
