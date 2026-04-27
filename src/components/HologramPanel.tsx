import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Cpu, Database, Zap, CheckCircle2, Circle, ListTodo, Plus, Trash2, AlertTriangle, AlertCircle, Info, Network, Share2, Play, Pause, SkipForward, Music, Search, X, Brain, Clock, ZapOff } from 'lucide-react';
import { useJarvis, Task } from '../context/JarvisContext';
import { jarvisVoice } from '../lib/speech';

interface HologramPanelProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export const HologramPanel: React.FC<HologramPanelProps> = ({ title, icon, children, className = "", delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20, filter: 'brightness(2)' }}
      animate={{ opacity: 1, scale: 1, y: 0, filter: 'brightness(1)' }}
      whileHover={{ 
        scale: 1.02, 
        y: -2,
        backgroundColor: 'rgba(0, 242, 255, 0.03)',
        boxShadow: '0 0 40px rgba(0, 242, 255, 0.1)',
      }}
      transition={{ 
        duration: 0.5,
        ease: [0.23, 1, 0.32, 1],
        delay 
      }}
      className={`glass-panel p-5 flex flex-col gap-4 shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all duration-300 ${className}`}
    >
      <div className="flex items-center justify-between border-b border-cyan-900/30 pb-3">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-cyan-500 font-bold">{title}</h3>
        </div>
        <div className="flex gap-1">
          <div className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse" />
        </div>
      </div>
      <div className="text-[#e0faff] font-sans text-xs flex-1">
        {children}
      </div>
    </motion.div>
  );
};



export const SystemStatus: React.FC = () => {
  const { state } = useJarvis();
  
  const handleCalibrate = async () => {
    const success = await jarvisVoice.requestPermission();
    if (success) {
      jarvisVoice.speak("Microphone systems calibrate ho gaye hain, pravin boss... main smoothly listen kar pa rahi hoon.");
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between text-[10px] opacity-70 uppercase font-mono">
          <span>Mic Status</span>
          <button 
            onClick={handleCalibrate}
            className="text-cyan-400 hover:text-cyan-200 underline cursor-pointer"
          >
            CALIBRATE
          </button>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-[10px] opacity-70 uppercase">
          <span>CPU Core</span>
          <span>{state.cpuLoad}%</span>
        </div>
        <div className="h-1 bg-cyan-950 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-cyan-400"
            animate={{ width: `${state.cpuLoad}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-[10px] opacity-70 uppercase">
          <span>Memory Allocation</span>
          <span>{state.memoryUsage}</span>
        </div>
        <div className="h-1 bg-cyan-950 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-cyan-400"
            initial={{ width: '32%' }}
          />
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-[10px] opacity-70 uppercase">
          <span>Network Sync</span>
          <span className={state.networkStatus === 'Offline' ? 'text-red-500' : ''}>{state.networkStatus}</span>
        </div>
        <div className="flex space-x-1">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i} 
              className={`h-4 w-1 transition-colors ${
                state.networkStatus === 'Offline' ? 'bg-red-900/30' :
                i < 4 ? 'bg-cyan-400' : 'bg-cyan-400/30'
              }`} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};


export const TaskManager: React.FC = () => {
  const { state, addTask, toggleTask, removeTask } = useJarvis();
  const [newTaskText, setNewTaskText] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('medium');

  const handleAdd = () => {
    if (newTaskText.trim()) {
      addTask(newTaskText.trim(), priority);
      setNewTaskText('');
      setPriority('medium'); // reset to default
    }
  };

  const priorityConfig = {
    high: { color: 'text-red-400', bg: 'bg-red-400/20', border: 'border-red-900/40', icon: <AlertTriangle size={12} className="text-red-400" /> },
    medium: { color: 'text-yellow-400', bg: 'bg-yellow-400/20', border: 'border-yellow-900/40', icon: <AlertCircle size={12} className="text-yellow-400" /> },
    low: { color: 'text-cyan-400', bg: 'bg-cyan-400/20', border: 'border-cyan-900/40', icon: <Info size={12} className="text-cyan-400" /> }
  };

  return (
    <div className="space-y-4">
      {/* Quick Add with Priority Selection */}
      <div className="space-y-2 p-2 bg-cyan-950/20 border border-cyan-900/40 rounded">
        <div className="flex gap-2">
          <input 
            type="text" 
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="ADD NEW DIRECTIVE..."
            className="flex-1 bg-transparent border-none outline-none text-[10px] font-mono text-cyan-100 placeholder:text-cyan-900"
          />
          <button onClick={handleAdd} className="text-cyan-400 hover:text-cyan-200">
            <Plus size={14} />
          </button>
        </div>
        
        {/* Priority Selector */}
        <div className="flex gap-2 border-t border-cyan-900/20 pt-2">
          {(['low', 'medium', 'high'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPriority(p)}
              className={`flex-1 text-[8px] font-mono py-1 rounded transition-all uppercase tracking-tighter ${
                priority === p 
                  ? `${priorityConfig[p].bg} ${priorityConfig[p].color} border border-cyan-700/50` 
                  : 'bg-transparent text-cyan-900 border border-transparent'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-hide">
        {state.tasks.map((task) => (
          <div 
            key={task.id}
            className={`group p-2 flex items-center gap-3 border rounded transition-all ${
              task.completed 
                ? 'opacity-30 grayscale' 
                : `${priorityConfig[task.priority].bg} ${priorityConfig[task.priority].border}`
            }`}
          >
            <button 
              onClick={() => toggleTask(task.id)}
              className={task.completed ? 'text-gray-500' : priorityConfig[task.priority].color}
            >
              {task.completed ? <CheckCircle2 size={14} /> : <Circle size={14} />}
            </button>
            <div className="flex-1 min-w-0">
              <div className={`text-[10px] font-mono truncate ${task.completed ? 'line-through' : ''}`}>
                {task.text}
              </div>
              {!task.completed && (
                <div className="flex items-center gap-1 mt-1">
                  {priorityConfig[task.priority].icon}
                  <span className={`text-[8px] uppercase tracking-tighter ${priorityConfig[task.priority].color}`}>
                    {task.priority} PRIORITY
                  </span>
                </div>
              )}
            </div>
            <button 
              onClick={() => removeTask(task.id)}
              className="opacity-0 group-hover:opacity-100 text-cyan-900 hover:text-red-400 transition-opacity"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
        {state.tasks.length === 0 && (
          <div className="text-center py-4 text-[10px] opacity-30 font-mono italic">
            NO ACTIVE TASKS_
          </div>
        )}
      </div>
    </div>
  );
};


export const NetworkMap: React.FC = () => {
  const nodes = [
    { id: 'core', label: 'FACILITY_CORE', x: '50%', y: '50%', type: 'main', status: 'online', activity: 'transmitting' },
    { id: 'entry', label: 'ENTRY_GRID', x: '15%', y: '25%', type: 'sub', status: 'online', activity: 'idle' },
    { id: 'climate', label: 'CLIMATE_CTRL', x: '85%', y: '25%', type: 'sub', status: 'online', activity: 'transmitting' },
    { id: 'power', label: 'POWER_CELL', x: '15%', y: '75%', type: 'sub', status: 'online', activity: 'idle' },
    { id: 'security', label: 'SEC_ULTRON', x: '85%', y: '75%', type: 'sub', status: 'alert', activity: 'transmitting' },
  ];

  return (
    <div className="relative h-48 w-full bg-black/40 rounded border border-cyan-900/30 overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #00f2ff 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
      
      {/* Connections (Lines) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {nodes.filter(n => n.id !== 'core').map(node => (
          <React.Fragment key={`conn-${node.id}`}>
            <line 
              x1="50%" y1="50%" x2={node.x} y2={node.y} 
              stroke={node.status === 'offline' ? "rgba(255, 0, 0, 0.1)" : "rgba(0, 242, 255, 0.2)"} 
              strokeWidth="1" 
              strokeDasharray="4 2"
            />
            {node.status !== 'offline' && (
              <motion.circle
                r={node.activity === 'transmitting' ? "3" : "1.5"}
                fill={node.status === 'alert' ? "#ff9000" : "#00f2ff"}
                initial={{ x: "50%", y: "50%", opacity: 0 }}
                animate={{ 
                  x: node.x, 
                  y: node.y,
                  opacity: node.activity === 'transmitting' ? [0, 1, 0] : [0, 0.5, 0]
                }}
                transition={{ 
                  duration: node.activity === 'transmitting' ? 1.2 : 3, 
                  repeat: Infinity, 
                  delay: Math.random() * 2,
                  ease: "linear"
                }}
                className={node.activity === 'transmitting' ? 'drop-shadow-[0_0_5px_#00f2ff]' : ''}
              />
            )}
          </React.Fragment>
        ))}
      </svg>

      {/* Nodes */}
      {nodes.map(node => (
        <motion.div
          key={node.id}
          className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 group"
          style={{ left: node.x, top: node.y }}
          animate={node.activity === 'transmitting' ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="relative">
            <div className={`rounded-full flex items-center justify-center transition-all ${
              node.activity === 'transmitting' 
                ? 'shadow-[0_0_20px_rgba(0,242,255,0.4)] brightness-125' 
                : 'shadow-[0_0_10px_rgba(0,242,255,0.1)] opacity-80'
            } ${
              node.type === 'main' 
                ? 'w-10 h-10 bg-cyan-500/20 border-2 border-cyan-400' 
                : `w-6 h-6 bg-cyan-950/40 border ${node.status === 'alert' ? 'border-orange-500/60' : node.status === 'offline' ? 'border-red-500/40 opacity-40' : 'border-cyan-500/40'}`
            }`}>
              {node.type === 'main' ? <Network size={16} className="text-cyan-400" /> : <Share2 size={10} className={node.status === 'alert' ? 'text-orange-400' : 'text-cyan-600'} />}
            </div>
            
            {/* Status Dot */}
            <div className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border border-black z-10 ${
              node.status === 'online' ? 'bg-green-500' : 
              node.status === 'alert' ? 'bg-orange-500' : 'bg-red-500'
            }`}>
              {node.activity === 'transmitting' && (
                <div className={`absolute inset-0 rounded-full animate-ping opacity-75 ${
                  node.status === 'online' ? 'bg-green-400' : 'bg-orange-400'
                }`} />
              )}
              {node.activity === 'idle' && node.status === 'online' && (
                <div className="absolute inset-0 rounded-full bg-green-500/30" />
              )}
            </div>
          </div>
          <span className={`text-[7px] font-mono tracking-tighter transition-opacity ${
            node.activity === 'transmitting' ? 'opacity-100 font-bold' : 'opacity-60'
          } group-hover:opacity-100 bg-black/60 px-1 rounded ${
            node.status === 'offline' ? 'text-red-400' : node.status === 'alert' ? 'text-orange-400' : 'text-white'
          }`}>
            {node.label}
          </span>
        </motion.div>
      ))}

      {/* Dynamic Status Overlay */}
      <div className="absolute bottom-2 left-2 flex gap-2">
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-ping" />
          <span className="text-[6px] font-mono opacity-50 uppercase leading-none">Uplink Active</span>
        </div>
      </div>
    </div>
  );
};


export const MediaRelay: React.FC = () => {
  const { state, toggleMedia, setTrack, checkSpotifyStatus } = useJarvis();
  const { isMediaPlaying, currentTrack, playlist, isSpotifyConnected } = state;
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SPOTIFY_AUTH_SUCCESS') {
        checkSpotifyStatus();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [checkSpotifyStatus]);

  const handleConnectSpotify = async () => {
    try {
      const res = await fetch('/api/auth/spotify/url');
      const { url } = await res.json();
      window.open(url, 'spotify_popup', 'width=600,height=700');
    } catch (error) {
      console.error('Failed to initiate Spotify sync:', error);
    }
  };

  const handleNext = () => {
    const currentIndex = playlist.findIndex(t => t.title === currentTrack.title);
    const nextIndex = (currentIndex + 1) % playlist.length;
    const nextTrack = playlist[nextIndex];
    setTrack(nextTrack.title, nextTrack.artist);
  };

  const handlePrev = () => {
    const currentIndex = playlist.findIndex(t => t.title === currentTrack.title);
    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    const prevTrack = playlist[prevIndex];
    setTrack(prevTrack.title, prevTrack.artist);
  };

  const filteredPlaylist = playlist.filter(track => 
    track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-black/40 border border-cyan-900/30 rounded flex flex-col overflow-hidden">
      {/* Search Header */}
      <div className="bg-cyan-500/5 px-4 py-2 border-b border-cyan-900/20 flex items-center gap-2">
        <Search size={12} className="text-cyan-500/50" />
        <input 
          type="text" 
          placeholder="SEARCH RELAY..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsSearching(true)}
          className="bg-transparent border-none text-[10px] font-mono placeholder:text-cyan-900 focus:ring-0 w-full text-cyan-100"
        />
        {searchQuery ? (
          <button onClick={() => setSearchQuery('')} className="text-cyan-700 hover:text-cyan-400 cursor-pointer">
            <X size={12} />
          </button>
        ) : (
          <button 
            onClick={handleConnectSpotify}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
              isSpotifyConnected 
                ? 'border-green-500/30 bg-green-500/10 text-green-400' 
                : 'border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 active:scale-95'
            }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_5px_currentColor] ${
              isSpotifyConnected ? 'bg-green-400' : 'bg-rose-400 animate-pulse'
            }`} />
            <span className="text-[7.5px] font-black tracking-[0.15em] uppercase">
              {isSpotifyConnected ? state.spotifyUsername : 'LINK_SPOTIFY'}
            </span>
          </button>
        )}
      </div>

      <div className="p-4 flex flex-col gap-3 relative">
        {/* Search Results Overlay */}
        <AnimatePresence>
          {isSearching && searchQuery && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute inset-x-0 top-0 z-20 bg-[#0a191f] border-b border-cyan-900/40 shadow-2xl max-h-48 overflow-y-auto scrollbar-hide"
            >
              {filteredPlaylist.length > 0 ? (
                filteredPlaylist.map((track, i) => (
                  <button 
                    key={i}
                    onClick={() => {
                      setTrack(track.title, track.artist);
                      setSearchQuery('');
                      setIsSearching(false);
                    }}
                    className="w-full px-4 py-2 hover:bg-cyan-500/10 flex flex-col items-start border-b border-cyan-900/10 last:border-0 transition-colors"
                  >
                    <div className="text-[10px] font-bold text-cyan-100">{track.title}</div>
                    <div className="text-[8px] text-cyan-600 uppercase tracking-tighter">{track.artist}</div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-[10px] font-mono text-cyan-900 text-center">NO MATCHES FOUND</div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div 
          className="flex items-center gap-4 cursor-pointer"
          onClick={() => setIsSearching(false)}
        >
          <motion.div 
            key={currentTrack.title}
            animate={isMediaPlaying ? { 
              rotate: 360,
              scale: [1, 1.1, 1]
            } : { rotate: 0 }}
            transition={{ 
              rotate: { duration: 4, repeat: Infinity, ease: "linear" },
              scale: { duration: 1, repeat: Infinity }
            }}
            className={`w-12 h-12 rounded flex items-center justify-center text-xl shadow-[0_0_15px_rgba(0,242,255,0.2)] transition-colors ${
              isMediaPlaying ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/50' : 'bg-cyan-900/10 text-cyan-800 border border-cyan-900/20'
            }`}
          >
            <Music size={20} />
          </motion.div>
          <div className="flex-1 overflow-hidden">
            <motion.div
              key={currentTrack.title}
              initial={{ y: 5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-xs truncate font-bold tracking-tight text-cyan-100"
            >
              {currentTrack.title}
            </motion.div>
            <div className="text-[10px] opacity-40 uppercase tracking-widest font-mono">{currentTrack.artist}</div>
            <div className="h-1.5 w-full bg-cyan-950/50 mt-3 rounded-full overflow-hidden border border-cyan-900/20">
              <motion.div 
                key={`${currentTrack.title}-progress`}
                initial={{ width: "0%" }}
                animate={isMediaPlaying ? { width: "100%" } : { width: "30%" }}
                transition={isMediaPlaying ? { duration: 180, repeat: Infinity, ease: "linear" } : { duration: 0.5 }}
                className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(0,242,255,0.5)]"
              />
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-6 border-t border-cyan-900/20 pt-2">
          <button 
            onClick={handlePrev}
            className="p-1 text-cyan-800 hover:text-cyan-400 transition-colors cursor-pointer"
            title="Previous Directive"
          >
            <SkipForward size={14} className="rotate-180" />
          </button>
          
          <button 
            onClick={toggleMedia}
            className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-400 transition-all cursor-pointer shadow-[0_0_10px_rgba(0,242,255,0.1)]"
          >
            {isMediaPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} className="ml-0.5" fill="currentColor" />}
          </button>

          <button 
            onClick={handleNext}
            className="p-1 text-cyan-800 hover:text-cyan-400 transition-colors cursor-pointer"
            title="Next Directive"
          >
            <SkipForward size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};


export const SmartHomeControl: React.FC = () => {
  const { state } = useJarvis();

  return (
    <div className="space-y-3">
      <div className="p-3 bg-cyan-950/20 border border-cyan-900/40 rounded flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold">Climate Control</div>
          <div className="text-[10px] opacity-50">Living Room / {state.climateControl.temp.toFixed(1)}°F</div>
        </div>
        <div className="w-8 h-4 bg-cyan-500 rounded-full relative transition-opacity" style={{ opacity: state.climateControl.status === 'Off' ? 0.3 : 1 }}>
          <div className={`absolute top-1 w-2 h-2 bg-white rounded-full transition-all ${state.climateControl.status === 'Off' ? 'left-1' : 'right-1'}`}></div>
        </div>
      </div>
      <div className="p-3 bg-cyan-950/20 border border-cyan-900/40 rounded flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold">Main Entry</div>
          <div className={`text-[10px] font-bold ${state.mainEntry === 'SECURED' ? 'text-green-400' : 'text-red-400'}`}>
            {state.mainEntry}
          </div>
        </div>
        <div className={`text-sm ${state.mainEntry === 'SECURED' ? 'text-green-400' : 'text-red-400 opacity-80 animate-pulse'}`}>
          {state.mainEntry === 'SECURED' ? '🔒' : '🔓'}
        </div>
      </div>
      <div className="p-3 bg-cyan-950/20 border border-cyan-900/40 rounded flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold">Energy Grid</div>
          <div className="text-[10px] opacity-50">Solar Battery / {state.energyGrid}%</div>
        </div>
        <div className="text-xs text-cyan-400">⚡</div>
      </div>
    </div>
  );
};


export const NeuralTelemetry: React.FC = () => {
  const { state } = useJarvis();
  const [brainActivity, setBrainActivity] = useState(88);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setBrainActivity(prev => Math.min(100, Math.max(70, prev + (Math.random() * 6 - 3))));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Brain size={16} />
          </div>
          <div>
            <div className="text-[10px] text-cyan-500 font-bold uppercase tracking-widest leading-none">Pravin_Boss.Neural</div>
            <div className="text-[8px] text-cyan-700 font-mono mt-1 uppercase">Link: Bio-Synchronized</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs font-bold text-cyan-100 tabular-nums">{brainActivity.toFixed(1)}%</div>
          <div className="text-[7px] text-cyan-900 uppercase">Neural Sync</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <span className="text-[8px] text-cyan-800 uppercase tracking-tighter">Alpha Range</span>
          <span className="text-[10px] text-cyan-400 font-mono">14.2 Hz</span>
        </div>
        <div className="h-1 bg-cyan-950 rounded-full overflow-hidden">
          <motion.div 
            animate={{ width: `${brainActivity}%` }}
            className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(0,242,255,0.4)]"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="p-2 border border-cyan-900/20 bg-cyan-500/5 rounded">
          <div className="text-[7px] text-cyan-800 uppercase">Cognition</div>
          <div className="text-[10px] font-bold text-cyan-300">STABLE</div>
        </div>
        <div className="p-2 border border-cyan-900/20 bg-cyan-500/5 rounded">
          <div className="text-[7px] text-cyan-800 uppercase">Cortical</div>
          <div className="text-[10px] font-bold text-green-400 font-mono whitespace-nowrap overflow-hidden">ACT_72.4</div>
        </div>
      </div>

      <div className="flex gap-1 items-center justify-center pt-1">
        {[...Array(24)].map((_, i) => (
          <motion.div 
            key={i}
            animate={{ 
              height: [2, Math.random() * 12 + 4, 2],
              opacity: [0.2, 0.8, 0.2]
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              delay: i * 0.1,
              ease: "easeInOut"
            }}
            className="w-0.5 bg-cyan-400/40 rounded-full"
          />
        ))}
      </div>
    </div>
  );
};

export const OperationRuntime: React.FC = () => {
  const [runtime, setRuntime] = useState(0);

  React.useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      setRuntime(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between p-3 border border-cyan-500/20 bg-cyan-500/5 rounded-lg">
        <div className="flex items-center gap-3">
          <Clock size={16} className="text-cyan-500" />
          <div className="text-sm font-mono tracking-wider tabular-nums font-bold">
            {formatTime(runtime)}
          </div>
        </div>
        <div className="text-[8px] text-cyan-900 uppercase font-bold tracking-widest">Runtime_Tick</div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 text-[9px] font-mono">
        <div className="flex flex-col gap-1 border-l border-cyan-800 pl-2">
          <span className="text-cyan-900">Uptime</span>
          <span className="text-cyan-400">99.98%</span>
        </div>
        <div className="flex flex-col gap-1 border-l border-cyan-800 pl-2">
          <span className="text-cyan-900">Drift</span>
          <span className="text-cyan-400">0.14ms</span>
        </div>
      </div>
    </div>
  );
};


