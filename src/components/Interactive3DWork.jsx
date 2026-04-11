import React, { useState, useRef, Suspense, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Image, useCursor, Html, RoundedBox, MeshTransmissionMaterial, Environment, useTexture } from '@react-three/drei';
import { projects } from '../data/projects';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { X, ArrowLeft } from 'lucide-react';

const projectYears = ["2024", "2024", "2023", "2022", "2022", "2021"];

// Safely handle Canvas errors
class SafeCanvasErrorBoundary extends React.Component {
    constructor(props) { super(props); this.state = { hasError: false, error: null }; }
    static getDerivedStateFromError(error) { return { hasError: true, error }; }
    componentDidCatch(error) { console.error('Canvas Error:', error); }
    render() {
        if (this.state.hasError) {
            return (
                <div className="absolute inset-0 bg-[#09090b] flex flex-col items-center justify-center text-zinc-500 z-50">
                    <span className="text-xl mb-4 font-display text-red-500">WebGL Error Caught: {this.state.error?.message}</span>
                    <button onClick={() => window.location.reload()} className="px-6 py-2 border border-zinc-700 hover:text-white rounded">Retry Component</button>
                </div>
            );
        }
        return this.props.children;
    }
}

// ─── BACKGROUND HTML MARQUEE ───
class ImageErrorBoundary extends React.Component {
    constructor(props) { super(props); this.state = { hasError: false }; }
    static getDerivedStateFromError() { return { hasError: true }; }
    componentDidCatch(error) { console.warn('Texture load failed (likely Unsplash CORS/Rate Limit). Displaying fallback geometry.'); }
    render() {
        if (this.state.hasError) {
            return (
                <RoundedBox args={[3.18, 2.11, 0.01]} radius={0.11} {...this.props.meshProps}>
                    <meshBasicMaterial color="#27272a" />
                </RoundedBox>
            );
        }
        return this.props.children;
    }
}

const BackgroundMarquee = () => {
    const strip = [...projects, ...projects, ...projects];
    return (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex items-center justify-center bg-black">
            <div className="absolute inset-0 bg-[#09090b]/80 z-10 backdrop-blur-[4px]"></div>
            <motion.div 
                className="flex gap-4 w-max opacity-20 sepia-[0.3]"
                animate={{ x: ["0%", "-33.3333%"] }}
                transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
            >
                {strip.map((p, i) => (
                    <div key={i} className="w-[30vw] md:w-[15vw] h-[20vh] rounded-xl overflow-hidden shrink-0">
                        <img src={p.image} alt="" className="w-full h-full object-cover grayscale blur-[2px]" />
                    </div>
                ))}
            </motion.div>
        </div>
    );
};

// ─── UNIFIED CAMERA MANAGER ───
const SceneManager = ({ stage }) => {
    const { camera, size } = useThree();
    const isMobile = size.width < 768;

    useFrame((state) => {
        const targetX = stage === 1 ? 0 : (isMobile ? 0 : -2.0);
        const targetY = stage === 1 ? 0 : (isMobile ? -1.5 : 0);
        const targetZ = stage === 1 ? 9 : 7.5; 

        camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.04);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.04);
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.04);
        
        if (stage === 2) {
            camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, -(state.pointer.x * 0.05), 0.05);
            camera.rotation.x = THREE.MathUtils.lerp(camera.rotation.x, (state.pointer.y * 0.05), 0.05);
        } else {
            camera.rotation.set(0, 0, 0);
        }
    });

    return null;
};

const Stage1Folder = ({ stage, onOpened }) => {
    const group = useRef();
    const frontCover = useRef();
    const [hovered, setHovered] = useState(false);
    
    useCursor(stage === 1 && hovered);

    useFrame((state) => {
        if (!group.current || !frontCover.current) return;

        if (stage === 1) {
            frontCover.current.rotation.x = THREE.MathUtils.lerp(frontCover.current.rotation.x, hovered ? Math.PI / 7 : 0, 0.12);
            
            group.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1 - 0.5;
            group.current.position.z = THREE.MathUtils.lerp(group.current.position.z, hovered ? 1 : 0, 0.1);
            group.current.rotation.x = 0;
            group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, hovered ? 0.05 : 0, 0.1);
        } else {
            frontCover.current.rotation.x = THREE.MathUtils.lerp(frontCover.current.rotation.x, Math.PI / 1.5, 0.05);
            group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, -10, 0.02);
            group.current.position.z = THREE.MathUtils.lerp(group.current.position.z, 5, 0.02);
            group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, Math.PI / 4, 0.05);
        }
    });

    // futuristic iOS 26 Spatial Glass
    const glassConfig = {
        samples: 6,
        resolution: 512,
        transmission: 1.0,
        roughness: 0.1,
        thickness: 0.3,
        ior: 1.45,
        chromaticAberration: 0.0,
        anisotropy: 0.0,
        distortion: 0.0,
        distortionScale: 0.0,
        temporalDistortion: 0.0,
        clearcoat: 1,
        attenuationDistance: 0.5,
        attenuationColor: '#ffffff',
        color: '#ffffff',
    };

    return (
        <group 
            ref={group} 
            onPointerOver={() => setHovered(true)} 
            onPointerOut={() => setHovered(false)}
            onClick={() => { if (stage === 1) onOpened(); }}
            scale={0.55}
        >
            <pointLight position={[0, 2, 4]} intensity={hovered ? 5 : 2} color={hovered ? "#ffffff" : "#7dd3fc"} distance={12} />
            
            {/* macOS Back Panel + Top Tab */}
            <group position={[0, 0, -0.15]}>
                <RoundedBox args={[4.2, 2.8, 0.04]} radius={0.12} smoothness={4}>
                    <meshPhysicalMaterial color="#38bdf8" transparent opacity={0.6} roughness={0.05} metalness={0.8} />
                </RoundedBox>
                <RoundedBox args={[1.4, 0.4, 0.04]} radius={0.12} smoothness={4} position={[-1.2, 1.45, 0]}>
                   <meshPhysicalMaterial color="#38bdf8" transparent opacity={0.6} roughness={0.05} metalness={0.8} />
                </RoundedBox>
            </group>

            {/* Simulated inner files */}
            <group position={[0, 0.5, -0.05]}>
                {['#ffffff', '#bae6fd', '#e0f2fe'].map((col, i) => (
                    <mesh key={i} position={[(i - 1) * 0.4, (i === 1 ? 0.3 : 0.1), (i * 0.02)]} rotation={[0, 0, (i - 1) * -0.05]}>
                       <planeGeometry args={[2.8, 2.0]} />
                       <meshBasicMaterial color={col} />
                    </mesh>
                ))}
            </group>

            {/* macOS Front Panel - SPATIAL GLASS */}
            <group position={[0, -1.4, 0]} ref={frontCover}>
                <group position={[0, 1.4, 0]}>
                    <RoundedBox args={[4.2, 2.8, 0.06]} radius={0.12} smoothness={4}>
                        <MeshTransmissionMaterial {...glassConfig} color="#38bdf8" />
                    </RoundedBox>
                    
                    {/* Centered Typography */}
                    <Html position={[0, 0, 0.06]} center transform>
                        <div className={`transition-all duration-700 ease-out font-display text-white tracking-[0.3em] pointer-events-none drop-shadow-2xl ${hovered && stage === 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`} style={{ fontSize: '48px', fontWeight: '800', textShadow: '0 10px 30px rgba(0,0,0,0.8)' }}>
                            WORKS
                        </div>
                    </Html>
                </group>
            </group>
        </group>
    );
};

// ─── 3D MULTI-CARD STACK (Stage 2) ───
const CardStack = ({ stage, activeIndex }) => {
    const groupRef = useRef();
    const { size } = useThree();
    const isMobile = size.width < 768;

    useFrame(() => {
        if (!groupRef.current) return;
        const entranceZ = stage === 2 ? 0 : -30;
        const entranceY = stage === 2 ? 0 : -10;
        groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, entranceZ, 0.04);
        groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, entranceY, 0.04);

        if (stage === 2) {
             const scrollOffset = window.scrollY * 0.001; 
             groupRef.current.rotation.z = Math.sin(scrollOffset) * 0.05;
        }
    });

    return (
        <group ref={groupRef}>
            {projects.map((project, index) => (
                <ProjectCard key={project.id} project={project} index={index} activeIndex={activeIndex} isMobile={isMobile} />
            ))}
        </group>
    );
};

// Render safe single image card
const ProjectCard = ({ project, index, activeIndex, isMobile }) => {
    const root = useRef();
    const dimmingBox = useRef();
    const neonPlate = useRef();
    const frameLightRef = useRef();

    useFrame((state) => {
        if (!root.current || !dimmingBox.current) return;

        const isActive = index === activeIndex;
        const distance = index - activeIndex;

        // Magnetic Forward Pull
        const targetZ = isActive ? 2.5 : -Math.abs(distance) * (isMobile ? 1.0 : 2.2) - 1; 
        const targetX = isActive ? 0 : distance * (isMobile ? 0.6 : 1.25);
        const targetY = isActive ? 0 : -Math.abs(distance) * 0.15;
        
        // Advanced Depth Rotation & Parallax
        const targetRotationY = isActive ? (state.pointer.x * -0.15) : -Math.sign(distance) * 0.15;
        const targetRotationX = isActive ? (state.pointer.y * 0.15) : 0;
        const targetRotationZ = isActive ? 0 : distance * 0.05;
        const targetScale = isActive ? 1.0 : 0.85; // Cards made larger and more dominant

        // Animate Container Transform
        root.current.position.x = THREE.MathUtils.lerp(root.current.position.x, targetX, 0.08);
        root.current.position.y = THREE.MathUtils.lerp(root.current.position.y, targetY, 0.08);
        root.current.position.z = THREE.MathUtils.lerp(root.current.position.z, targetZ, 0.08);
        root.current.scale.setScalar(THREE.MathUtils.lerp(root.current.scale.x, targetScale, 0.1));
        
        root.current.rotation.x = THREE.MathUtils.lerp(root.current.rotation.x, targetRotationX, 0.08);
        root.current.rotation.y = THREE.MathUtils.lerp(root.current.rotation.y, targetRotationY, 0.08);
        root.current.rotation.z = THREE.MathUtils.lerp(root.current.rotation.z, targetRotationZ, 0.08);

        // Simulated Depth of Field (Dimming & Blur Plane)
        const targetDim = isActive ? 0 : 0.7;
        dimmingBox.current.opacity = THREE.MathUtils.lerp(dimmingBox.current.opacity, targetDim, 0.1);

        // Dynamic Specular Catch
        if (frameLightRef.current) {
            frameLightRef.current.intensity = THREE.MathUtils.lerp(frameLightRef.current.intensity, isActive ? 1.5 : 0, 0.1);
            frameLightRef.current.position.x = state.pointer.x * 2;
            frameLightRef.current.position.y = state.pointer.y * 2;
        }
    });

    const cardGlassConfig = {
        samples: 6,
        resolution: 256,
        transmission: 1.0,
        roughness: 0.0, // Absolute clarity
        thickness: 0.1,
        ior: 1.2, // Subtle refraction
        chromaticAberration: 0.0,
        anisotropy: 0.0,
        clearcoat: 1,
        attenuationDistance: 1,
        attenuationColor: '#ffffff',
        color: '#ffffff',
    };

    return (
        <group ref={root}>
            {/* Minimal White Specular Reflection */}
            <pointLight ref={frameLightRef} position={[0, 0, 2]} distance={5} color="#ffffff" intensity={0} />

            {/* STEP 1: SPATIAL GLASS Body (The Foundation) */}
            <RoundedBox args={[3.8, 2.53, 0.06]} radius={0.15} smoothness={6} position={[0, 0, 0]}>
                <MeshTransmissionMaterial {...cardGlassConfig} />
            </RoundedBox>

            {/* STEP 2: PERFECTLY ROUNDED IMAGE PLATE (Pinned to the surface) */}
            <ImageErrorBoundary meshProps={{ position: [0, 0, 0.035] }}>
                <ProjectImage project={project} />
            </ImageErrorBoundary>

            {/* Micro-Edge highlight (Ultra subtle white) */}
            <mesh position={[0, 1.25, 0.05]}>
                <planeGeometry args={[3.8, 0.005]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
            </mesh>

            {/* Soft Focus Dimmer - Moved forward to prevent flickering */}
            <mesh position={[0, 0, 0.06]} scale={[3.8, 2.55, 1]}>
                <planeGeometry />
                <meshBasicMaterial ref={dimmingBox} color="#000000" transparent opacity={0} />
            </mesh>
        </group>
    );
};


// HIGHEST QUALITY: Custom Shader for Anti-Aliased Rounded Corners
// This eliminates 100% of Z-fighting, Bleeding, and Ghost Edges
const ProjectImage = ({ project }) => {
    const texture = useTexture(project.image);
    const { gl } = useThree();
    const materialRef = useRef();
    
    useEffect(() => {
        if (texture) {
            texture.anisotropy = gl.capabilities.getMaxAnisotropy();
            texture.minFilter = THREE.LinearMipmapLinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
            texture.needsUpdate = true;
        }
    }, [texture, gl]);

    // Update uOpacity uniform over time if needed
    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uOpacity.value = 1.0;
        }
    });

    const shaderArgs = {
        uniforms: {
            uTexture: { value: texture },
            uSize: { value: new THREE.Vector2(3.8, 2.53) },
            uRadius: { value: 0.15 },
            uOpacity: { value: 1.0 }
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform sampler2D uTexture;
            uniform vec2 uSize;
            uniform float uRadius;
            uniform float uOpacity;
            varying vec2 vUv;

            float roundedBoxSDF(vec2 p, vec2 b, float r) {
                vec2 d = abs(p) - b + vec2(r);
                return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)) - r;
            }

            void main() {
                // Transform UVs to centered coordinates in world units
                vec2 p = (vUv - 0.5) * uSize;
                
                // Calculate distance to the rounded boundary
                // smoothstep at the end provides perfect anti-aliasing
                float dist = roundedBoxSDF(p, uSize * 0.5, uRadius);
                float smoothing = 0.01; // Tiny feathering for smooth pixels
                float mask = 1.0 - smoothstep(-smoothing, smoothing, dist);
                
                if (mask <= 0.0) discard;
                
                vec4 texColor = texture2D(uTexture, vUv);
                gl_FragColor = vec4(texColor.rgb, texColor.a * uOpacity * mask);
            }
        `
    };

    return (
        <mesh 
            position={[0, 0, 0.041]} 
            onClick={() => window.open(project.link, '_blank')}
        >
            <planeGeometry args={[3.8, 2.53]} />
            <shaderMaterial 
                ref={materialRef}
                {...shaderArgs} 
                transparent={true}
            />
        </mesh>
    );
};

// ─── MAIN DOM OVERLAYS & EXPORT ───
const Interactive3DWork = () => {
    const [stage, setStage] = useState(1); 
    const [activeIndex, setActiveIndex] = useState(0);

    return (
        <div className="w-full h-screen min-h-[700px] relative bg-[#09090b] text-white z-20 overflow-hidden rounded-[40px] mt-20 md:mt-0">
            
            <div className="absolute inset-0 pointer-events-none opacity-20 z-10 mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

            {/* Glassmorphism Back Button */}
            <AnimatePresence>
                {stage === 2 && (
                    <motion.button
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        onClick={() => setStage(1)}
                        className="absolute top-8 right-8 z-[60] flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
                    >
                        <X className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
                        <span className="text-xs font-display font-bold tracking-[0.2em] text-zinc-400 group-hover:text-white uppercase transition-colors">Close</span>
                    </motion.button>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {stage === 1 && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.4 } }}
                        className="absolute inset-0 z-10 pointer-events-none"
                    >
                        <BackgroundMarquee />
                    </motion.div>
                )}
            </AnimatePresence>

            <div className={`absolute inset-0 transition-opacity duration-1000 z-20 ${stage === 2 ? 'pointer-events-none md:pointer-events-auto' : ''}`}>
               <div className="absolute top-1/2 right-[5%] -translate-y-1/2 w-[400px] h-[400px] bg-[#8b5cf6]/15 rounded-full blur-[100px] pointer-events-none transition-all duration-1000 ease-out" style={{ opacity: stage === 2 ? 1 : 0 }}></div>

                <SafeCanvasErrorBoundary>
                    <Canvas 
                        camera={{ position: [0, 0, 10], fov: 38, near: 0.1, far: 50 }} 
                        dpr={[1, 2]}
                        gl={{ 
                            antialias: true, 
                            powerPreference: "high-performance",
                            preserveDrawingBuffer: true
                        }}
                    >
                        <Suspense fallback={
                            <Html center>
                                <div className="text-white font-display text-sm tracking-widest uppercase animate-pulse border border-white/20 px-8 py-3 rounded-full w-max backdrop-blur-xl bg-white/5">
                                    Spatial Engine Initializing...
                                </div>
                            </Html>
                        }>
                            <Environment preset="city" />
                            <ambientLight intensity={0.5} />
                            
                            {/* Key Highlights */}
                            <spotLight position={[10, 20, 10]} angle={0.12} penumbra={1} intensity={2} color="#ffffff" castShadow />
                            <directionalLight position={[-5, 5, 5]} intensity={1} color="#ffffff" />
                            
                            <SceneManager stage={stage} />
                            <Stage1Folder stage={stage} onOpened={() => setStage(2)} />
                            <CardStack stage={stage} activeIndex={activeIndex} />
                        </Suspense>
                    </Canvas>
                </SafeCanvasErrorBoundary>

                <AnimatePresence>
                {stage === 2 && (
                    <motion.div 
                        className="absolute top-0 bottom-0 left-0 w-full md:w-[42%] z-30 flex flex-col justify-center px-6 md:px-12"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                    >
                        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#09090b] to-transparent pointer-events-none"></div>
                        
                        <div className="overflow-hidden h-full flex flex-col justify-center gap-4 md:gap-6 py-12">
                            {projects.map((project, index) => {
                                const isActive = activeIndex === index;
                                return (
                                    <div 
                                        key={project.id}
                                        className="group cursor-pointer flex flex-col relative py-2"
                                        onMouseEnter={() => setActiveIndex(index)}
                                    >
                                        <div className="flex items-start md:items-baseline gap-4 relative">
                                            <div className={`absolute -left-4 md:-left-6 top-1 bottom-1 w-[2px] rounded-full transition-all duration-500 ease-out ${isActive ? 'bg-[#3b82f6] shadow-[0_0_12px_#3b82f6] scale-y-100' : 'bg-transparent scale-y-0'}`}></div>

                                            <span className={`font-mono text-xs md:text-sm mt-3 md:mt-0 transition-colors duration-300 ${isActive ? 'text-[#3b82f6]' : 'text-zinc-600 group-hover:text-zinc-400'}`}>
                                                {projectYears[index]}
                                            </span>

                                            <h4 className={`text-xl md:text-2xl lg:text-3xl font-display font-medium tracking-tight transition-all duration-500 uppercase ${isActive ? 'text-white translate-x-2 drop-shadow-lg' : 'text-zinc-700 translate-x-0 group-hover:text-zinc-500'}`}>
                                                {project.title}
                                            </h4>
                                        </div>
                                        
                                        <AnimatePresence>
                                            {isActive && (
                                                <motion.div 
                                                    initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.4, ease: "easeOut" }}
                                                    className="overflow-hidden pl-16 md:pl-20"
                                                >
                                                    <div className="mt-3 flex flex-col gap-2">
                                                        <div className="flex w-max">
                                                            <span className="text-[9px] md:text-[10px] uppercase tracking-widest text-[#3b82f6] border-b border-[#3b82f6]/30 pb-1">
                                                                {project.category}
                                                            </span>
                                                        </div>
                                                        <p className="text-[11px] md:text-xs text-zinc-400 max-w-sm font-light leading-relaxed">
                                                            {project.description}
                                                        </p>
                                                        {project.link && (
                                                            <a href={project.link} target="_blank" rel="noreferrer" className="mt-2 w-max text-xs uppercase tracking-widest text-white flex items-center gap-2 group/btn">
                                                                Explore Context
                                                                <span className="group-hover/btn:translate-x-2 transition-transform duration-300">→</span>
                                                            </a>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )
                            })}
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#09090b] to-transparent pointer-events-none"></div>
                    </motion.div>
                )}
            </AnimatePresence>
            </div>
        </div>
    );
};

export default Interactive3DWork;
