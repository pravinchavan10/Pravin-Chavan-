/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArcReactor } from './components/ArcReactor';
import { HologramPanel, SystemStatus, SmartHomeControl, TaskManager, NetworkMap, MediaRelay, NeuralTelemetry, OperationRuntime } from './components/HologramPanel';
import { ChatOverlay } from './components/ChatOverlay';
import { Battery, Wifi, Navigation, Settings, Search, Bell, ListTodo, Activity, Music, Brain, Clock } from 'lucide-react';
import { JarvisProvider, useJarvis } from './context/JarvisContext';


export default function App() {
  return (
    <JarvisProvider>
      <AppContent />
    </JarvisProvider>
  );
}

function AppContent() {
  const { state } = useJarvis();
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`relative w-screen h-screen overflow-hidden bg-[var(--color-jarvis-dark)] flex flex-col border-8 border-jarvis-border select-none transition-colors duration-500 ${
      state.isThinking || state.isSpeaking ? 'shadow-[inset_0_0_100px_rgba(0,242,255,0.05)]' : ''
    }`}>
      {/* Background Ambience */}
      <div className={`absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,242,255,0.05)_0%,transparent_70%)] pointer-events-none transition-opacity duration-700 ${
        state.isThinking || state.isSpeaking ? 'opacity-100' : 'opacity-40'
      }`} />
      
      {(state.isThinking || state.isSpeaking) && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-cyan-400 pointer-events-none mix-blend-overlay"
        />
      )}
      <div className={`scanline transition-opacity duration-500 ${state.isThinking || state.isSpeaking ? 'opacity-80' : 'opacity-40'}`} 
           style={{ animationDuration: state.isThinking || state.isSpeaking ? '3s' : '8s' }} />
      
      {/* Header UI */}
      <header className="h-16 flex items-center justify-between px-8 border-b border-cyan-900/30 bg-jarvis-accent-bg/80 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <motion.div 
            className={`w-3 h-3 rounded-full ${state.isThinking || state.isSpeaking ? 'bg-cyan-400 shadow-[0_0_10px_rgba(0,247,255,0.8)]' : 'bg-cyan-900 border border-cyan-800'}`}
            animate={state.isThinking || state.isSpeaking ? { opacity: [1, 0.4, 1] } : {}}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <span className={`text-xs font-bold tracking-[0.3em] uppercase transition-opacity duration-500 ${state.isThinking || state.isSpeaking ? 'opacity-100' : 'opacity-70'}`}>
            JARVIS Protocol 3.1
          </span>
        </div>

        <div className="flex items-center gap-8">
          <div className="text-right">
            <div className="text-[10px] opacity-50 uppercase tracking-widest">Security Status</div>
            <div className="text-sm font-medium text-cyan-400">ENCRYPTED / LEVEL 9</div>
          </div>
          <div className="h-8 w-[1px] bg-cyan-900/40" />
          <div className="text-2xl font-light tracking-tighter tabular-nums">
            {time.split(' ')[0]}<span className="text-xs opacity-50 ml-1">{time.split(' ')[1]}</span>
          </div>
        </div>
      </header>

      {/* Main Content - Three Column Layout */}
      <main className="flex-1 flex p-6 gap-6 relative z-10 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-64 flex flex-col gap-4 overflow-y-auto scrollbar-hide py-1">
          <HologramPanel title="System Diagnostics" icon={<Activity size={14} />}>
            <SystemStatus />
          </HologramPanel>

          <HologramPanel title="Neural Telemetry" icon={<Brain size={14} />}>
            <NeuralTelemetry />
          </HologramPanel>
          
          <HologramPanel title="Active Directives" icon={<ListTodo size={14} />}>
            <TaskManager />
          </HologramPanel>
        </div>

        {/* Center - Reactor & Response */}
        <div className="flex-1 flex flex-col gap-6 items-center justify-center relative">
          <div className="relative group">
            <ArcReactor isActive={state.isThinking || state.isSpeaking} />
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-full text-center">
              <div className={`text-[10px] uppercase tracking-[0.4em] transition-all duration-500 ${
                state.isThinking || state.isSpeaking ? 'text-cyan-400 opacity-100' : 'text-cyan-900 opacity-30'
              }`}>
                {state.isSpeaking ? 'TRANSITIONING_AUDIO' : state.isThinking ? 'NEURAL_LINKS_ACTIVE' : 'CORE_SYNC_STANDBY'}
              </div>
            </div>
            
            {state.isThinking && (
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 -m-8 border-t border-b border-cyan-400/20 rounded-full"
              />
            )}
          </div>
        </div>


        {/* Right Sidebar */}
        <div className="w-72 flex flex-col gap-4 overflow-y-auto scrollbar-hide py-1">
          <HologramPanel title="Spatial Network Map" icon={<Activity size={14} />}>
            <NetworkMap />
          </HologramPanel>

          <HologramPanel title="Infrastructure" icon={<Settings size={14} />}>
            <SmartHomeControl />
          </HologramPanel>

          <HologramPanel title="Operation Clock" icon={<Clock size={14} />}>
            <OperationRuntime />
          </HologramPanel>

          <HologramPanel title="Media Relay" icon={<Music size={14} />}>
             <MediaRelay />
          </HologramPanel>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-10 bg-cyan-950/10 border-t border-cyan-900/20 flex items-center justify-between px-8 text-[9px] uppercase tracking-[0.3em] opacity-40 z-20">
        <div className="flex space-x-6">
          <span>CPU_TEMP: 42°C</span>
          <span>GPU_LOAD: 8%</span>
          <span>FAN_SPEED: 1200RPM</span>
        </div>
        <div className="flex gap-4">
          <Wifi size={10} />
          <Battery size={10} />
          <span>EST_LATENCY: 14MS</span>
        </div>
      </footer>

      {/* Chat Overlay - Fixed Layer */}
      <ChatOverlay />
    </div>
  );
}



