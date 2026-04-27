import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useJarvis } from '../context/JarvisContext';

export const ArcReactor: React.FC<{ isActive?: boolean }> = ({ isActive }) => {
  const { state } = useJarvis();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);

  // Blinking logic
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      if (Math.random() > 0.8) {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 150);
      }
    }, 3000);
    return () => clearInterval(blinkInterval);
  }, []);

  // Subtle head/eye tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 10;
      const y = (e.clientY / innerHeight - 0.5) * 10;
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center min-h-[500px]">
      {/* Background Deep Space Glow */}
      <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,242,255,0.05)_0%,transparent_70%)] opacity-50`} />
      
      {/* Interstitial Elements (Surrounding Space) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Floating Technical Nodes */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`node-${i}`}
            className="absolute flex items-center gap-2"
            initial={{ 
              x: (Math.random() * 80 + 10) + "%", 
              y: (Math.random() * 80 + 10) + "%",
              opacity: 0 
            }}
            animate={{ 
              x: [(Math.random() * 80 + 10) + "%", (Math.random() * 80 + 10) + "%"],
              y: [(Math.random() * 80 + 10) + "%", (Math.random() * 80 + 10) + "%"],
              opacity: isActive ? 0.2 : 0 
            }}
            transition={{ duration: 30 + i * 10, repeat: Infinity, ease: "linear" }}
          >
            <div className="w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_8px_cyan]" />
            <div className="text-[5px] font-mono text-cyan-500/30 uppercase tracking-widest whitespace-nowrap leading-none">
              DATA_STREAM_{1024 + i}<br/>
              NODE_V_{i}.x
            </div>
          </motion.div>
        ))}

        {/* Technical Grid/Compass in peripheral space */}
        <div className="absolute bottom-12 left-12 w-32 h-32 border border-cyan-500/5 rounded-full">
           <motion.div 
             animate={{ rotate: 360 }}
             transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
             className="w-full h-full border border-t-cyan-400/10 rounded-full" 
           />
           <div className="absolute inset-0 flex items-center justify-center text-[7px] font-mono text-cyan-500/10 uppercase tracking-tighter">
             SCTR_4 / NAV
           </div>
        </div>
      </div>

      <div className="relative w-80 h-80 flex items-center justify-center">
        {/* Background Glow */}
        <div className={`absolute inset-0 bg-cyan-500/10 rounded-full blur-3xl transition-opacity duration-1000 ${isActive ? 'opacity-100' : 'opacity-20'}`} />
      
      {/* Container for Holographic Effects */}
      <motion.div 
        className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-full border border-cyan-500/20 shadow-[0_0_50px_rgba(0,242,255,0.2)]"
        animate={{ 
          scale: state.isSpeaking ? [1, 1.05, 1] : isActive ? [1, 1.02, 1] : 1,
          rotateX: -mousePos.y,
          rotateY: mousePos.x
        }}
        transition={{ 
          scale: state.isSpeaking ? { duration: 0.2, repeat: Infinity } : { duration: 4, repeat: Infinity },
          type: "spring",
          stiffness: 50
        }}
      >
        {/* The Digital Interface Identity (Jarvis-Style Neural Core) */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1633519114674-68bb5a49806a?q=80&w=1000&auto=format&fit=crop"
            alt="Jarvis Neural Essence"
            referrerPolicy="no-referrer"
            className={`w-full h-full object-cover transition-all duration-1000 scale-110 ${
              isActive 
                ? 'opacity-60 saturate-[1.2] brightness-[1.1] contrast-[1.1]' 
                : 'opacity-20 grayscale brightness-50'
            }`}
          />
          
          {/* Holographic Texture/Noise Overlay */}
          <div className={`absolute inset-0 transition-opacity duration-1000 ${isActive ? 'opacity-[0.05]' : 'opacity-0'} bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay pointer-events-none`} />

          {/* Central Energy Core Glow */}
          <div className={`absolute inset-0 bg-radial-[circle] from-cyan-500/20 via-transparent to-transparent transition-opacity duration-1000 ${isActive ? 'opacity-100' : 'opacity-0'}`} />
          
          {/* Dynamic Light Pulses Expanding Outward */}
          {state.isSpeaking && [...Array(3)].map((_, i) => (
            <motion.div
              key={`pulse-${i}`}
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.5, ease: "easeOut" }}
              className="absolute inset-0 border border-cyan-400/30 rounded-full"
            />
          ))}

          {/* Floating Sci-Fi UI Elements */}
          <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] h-[95%] border border-cyan-500/10 rounded-full border-dashed"
            />
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[85%] border-2 border-cyan-500/5 rounded-full border-t-cyan-500/20"
            />
            
            {/* HUD Data Bits */}
            <div className="absolute top-10 right-10 text-[6px] font-mono text-cyan-400/40 space-y-1">
              <div>SYST_LOAD: {state.cpuLoad}%</div>
              <div>MEM_ALLOC: {state.memoryUsage}</div>
              <div>AUTH_LVL: 7</div>
            </div>
          </div>

          {/* Neural Lines Flowing (Persistent Background) */}
          <div className="absolute inset-0 opacity-10 mix-blend-screen" style={{ backgroundImage: 'linear-gradient(rgba(0,242,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,242,255,0.05) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        </div>

        {/* SVG Neural Layer Overlay (Realistic Facial Geometry & Voice Intensity) */}
        <svg viewBox="0 0 200 200" className="relative z-20 w-full h-full drop-shadow-[0_0_20px_rgba(0,242,255,0.4)]">
          {/* Subtle Facial Volume Mesh Contour */}
          <motion.path
            d="M60,100 C60,65 140,65 140,100 T100,165 Q60,140 60,100"
            fill="none"
            stroke="rgba(0, 242, 255, 0.08)"
            strokeWidth="0.5"
          />

          {/* Neural Network Lines (Flowing over Face) */}
          <motion.path
            d="M30,100 Q60,80 100,100 T170,100"
            fill="none"
            stroke="rgba(0, 242, 255, 0.2)"
            strokeWidth="0.5"
            animate={{ 
              d: [
                "M30,100 Q60,80 100,100 T170,100",
                "M30,100 Q60,120 100,100 T170,100",
                "M30,100 Q60,80 100,100 T170,100"
              ]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Sophisticated Facial Features */}
          <g className={state.isSpeaking ? 'text-cyan-200' : isActive ? 'text-cyan-400' : 'text-cyan-900'}>
            {/* Eyebrows (Sophisticated Arching) */}
            <motion.path
              d="M75,82 Q82,78 90,82"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              animate={{ 
                d: state.isThinking ? "M75,81 Q82,74 90,81" : "M75,82 Q82,78 90,82",
                rotate: state.isThinking ? -5 : 0
              }}
              transition={{ type: "spring", stiffness: 120 }}
            />
            <motion.path
              d="M110,82 Q118,78 125,82"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              animate={{ 
                d: state.isThinking ? "M110,81 Q118,74 125,81" : "M110,82 Q118,78 125,82",
                rotate: state.isThinking ? 5 : 0
              }}
              transition={{ type: "spring", stiffness: 120 }}
            />

            {/* Glowing Eyes Intensity & Focus Mapping */}
            <g transform={`translate(${mousePos.x * 0.1}, ${mousePos.y * 0.1})`}>
              {/* Left Eye */}
              <motion.ellipse
                cx="82" cy="92" rx="3.2" ry={isBlinking ? 0.1 : state.isThinking ? 1.4 : 2.5}
                fill="currentColor"
                className="opacity-40 blur-[0.5px]"
                animate={{ 
                    filter: state.isSpeaking ? "brightness(2.2) contrast(1.3) drop-shadow(0 0 10px cyan)" : state.isThinking ? "brightness(1.5) contrast(1.1)" : "brightness(1) contrast(1)",
                    opacity: (state.isSpeaking || state.isThinking) ? 0.9 : 0.5,
                    ry: isBlinking ? 0.1 : state.isThinking ? 1.4 : 2.5
                }}
              />
              {!isBlinking && (
                <motion.circle
                  cx="82" cy="92" r="1.4"
                  fill="#fff"
                  animate={state.isSpeaking ? { 
                    scale: [1, 2.2, 1],
                    opacity: [0.6, 1, 0.6]
                  } : state.isThinking ? {
                    scale: [1, 1.4, 1],
                    opacity: [0.4, 0.9, 0.4]
                  } : {}}
                  transition={state.isSpeaking ? { duration: 0.1, repeat: Infinity } : { duration: 2, repeat: Infinity }}
                  className="shadow-[0_0_12px_white]"
                />
              )}
              
              {/* Right Eye */}
              <motion.ellipse
                cx="118" cy="92" rx="3.2" ry={isBlinking ? 0.1 : state.isThinking ? 1.4 : 2.5}
                fill="currentColor"
                className="opacity-40 blur-[0.5px]"
                animate={{ 
                    filter: state.isSpeaking ? "brightness(2.2) contrast(1.3) drop-shadow(0 0 10px cyan)" : state.isThinking ? "brightness(1.5) contrast(1.1)" : "brightness(1) contrast(1)",
                    opacity: (state.isSpeaking || state.isThinking) ? 0.9 : 0.5,
                    ry: isBlinking ? 0.1 : state.isThinking ? 1.4 : 2.5
                }}
              />
              {!isBlinking && (
                <motion.circle
                  cx="118" cy="92" r="1.2"
                  fill="#fff"
                  animate={state.isSpeaking ? { 
                    scale: [1, 2, 1],
                    opacity: [0.5, 1, 0.5]
                  } : state.isThinking ? {
                    scale: [1, 1.3, 1],
                    opacity: [0.3, 0.7, 0.3]
                  } : {}}
                  transition={state.isSpeaking ? { duration: 0.1, repeat: Infinity } : { duration: 2, repeat: Infinity }}
                  className="shadow-[0_0_8px_white]"
                />
              )}
            </g>
            {/* Sophisticated Cheek Details (Realistic Depth) */}
            <motion.path
                d="M65,115 Q75,123 85,115"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className="opacity-10"
              />
              <motion.path
                d="M115,115 Q125,123 135,115"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className="opacity-10"
              />
          </g>

          {/* Minimalist Smile/Mouth (Refined Sophistication) */}
          <motion.path
            d="M88,135 Q100,138 112,135"
            fill="none"
            stroke="#00f2ff"
            strokeWidth="1.2"
            strokeLinecap="round"
            className="opacity-40"
            animate={{ 
                d: state.isSpeaking ? "M88,133 Q100,144 112,133" : "M88,135 Q100,138 112,135",
                opacity: state.isSpeaking ? 1 : 0.5,
                strokeWidth: state.isSpeaking ? 2 : 1.2
            }}
            transition={{ type: "spring", stiffness: 80 }}
          />

          {/* Neural Sync Lines (Background Detail) */}
          <motion.path
            d="M100,60 L100,165 M50,110 L150,110"
            fill="none"
            stroke="rgba(0, 242, 255, 0.1)"
            strokeWidth="0.5"
            strokeDasharray="4 4"
          />
        </svg>

        {/* Tactical Rim Lighting */}
        <div className="absolute inset-0 z-10 border-[10px] border-cyan-500/10 rounded-full" />
        <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.6)_100%)]" />
      </motion.div>

        {/* Outer Orbitals (React to voice) */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`orbital-${i}`}
            className={`absolute border border-cyan-500/${10 - i * 3} rounded-full z-20`}
            style={{ width: `${88 + i * 14}%`, height: `${88 + i * 14}%` }}
            animate={{ 
              rotate: i % 2 === 0 ? 360 : -360,
              scale: state.isSpeaking ? 1.05 + i * 0.01 : 1,
              opacity: isActive ? 0.8 : 0.2
            }}
            transition={{ 
              rotate: { duration: 25 + i * 12, repeat: Infinity, ease: "linear" },
              scale: { duration: 0.12, repeat: Infinity }
            }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-cyan-400/50 shadow-[0_0_20px_rgba(0,242,255,0.6)]" />
          </motion.div>
        ))}

        {/* Neural Particles & Dust */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={`p-${i}`}
            className="absolute w-0.5 h-0.5 bg-cyan-300 rounded-full"
            initial={{ x: 0, y: 0, opacity: 0 }}
            animate={isActive ? { 
              x: (Math.random() - 0.5) * 450, 
              y: (Math.random() - 0.5) * 450, 
              opacity: [0, 0.7, 0],
              scale: [0, 2, 0]
            } : { opacity: 0 }}
            transition={{ duration: Math.random() * 5 + 3, repeat: Infinity, delay: Math.random() * 5 }}
          />
        ))}
      </div>
    </div>
  );
};
