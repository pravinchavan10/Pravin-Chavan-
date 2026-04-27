import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Send, Loader2, Shield } from 'lucide-react';
import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import { jarvisVoice } from '../lib/speech';
import { useJarvis } from '../context/JarvisContext';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Define Jarvis Capabilities as Tools
const controlEntry: FunctionDeclaration = {
  name: "control_main_entry",
  description: "Lock or unlock the main entry/front door of the facility.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      action: {
        type: Type.STRING,
        enum: ["lock", "unlock"],
        description: "The desired state of the door."
      }
    },
    required: ["action"]
  }
};

const setTemperature: FunctionDeclaration = {
  name: "set_climate_temperature",
  description: "Set the ambient temperature of the living quarters.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      temperature: {
        type: Type.NUMBER,
        description: "Target temperature in Fahrenheit (standard range 65-85)."
      }
    },
    required: ["temperature"]
  }
};

const adjustSystem: FunctionDeclaration = {
  name: "adjust_system_performance",
  description: "Modify simulated CPU load or performance profiles.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      load: {
        type: Type.NUMBER,
        description: "Target CPU load percentage (0-100)."
      },
      network: {
        type: Type.STRING,
        enum: ["Stable", "Partial", "Offline"],
        description: "Set network synchronization status."
      }
    }
  }
};

const manageTask: FunctionDeclaration = {
  name: "manage_tasks",
  description: "Add, complete, or remove system tasks and directives.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      operation: {
        type: Type.STRING,
        enum: ["add", "toggle", "remove"],
        description: "The task operation to perform."
      },
      text: {
        type: Type.STRING,
        description: "The description of the task (required for 'add')."
      },
      id: {
        type: Type.STRING,
        description: "The unique ID of the task (required for 'toggle' or 'remove'). If not known, look it up in the tasks state provided in context."
      }
    },
    required: ["operation"]
  }
};

const controlMedia: FunctionDeclaration = {
  name: "control_media",
  description: "Control the music and media playback in the facility.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      action: {
        type: Type.STRING,
        enum: ["play", "pause", "toggle", "change_track"],
        description: "The music playback action."
      },
      title: {
        type: Type.STRING,
        description: "Song title (required for 'change_track')."
      },
      artist: {
        type: Type.STRING,
        description: "Artist name (optional for 'change_track')."
      }
    },
    required: ["action"]
  }
};

const updateProfile: FunctionDeclaration = {
  name: "update_user_profile",
  description: "Update the user's profile details like username, gender, or birthdate.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      username: { type: Type.STRING },
      gender: { type: Type.STRING, enum: ["Male", "Female", "Other"] },
      birthDate: {
        type: Type.OBJECT,
        properties: {
          year: { type: Type.NUMBER },
          month: { type: Type.STRING },
          day: { type: Type.NUMBER }
        }
      }
    }
  }
};

const openYoutube: FunctionDeclaration = {
  name: "open_youtube",
  description: "Open YouTube in a new tab for the user.",
  parameters: {
    type: Type.OBJECT,
    properties: {},
  }
};

const tools = [{ functionDeclarations: [controlEntry, setTemperature, adjustSystem, manageTask, controlMedia, updateProfile, openYoutube] }];


interface Message {
  role: 'user' | 'assistant';
  text: string;
}

export const ChatOverlay: React.FC = () => {
  const { state, updateSystem, toggleEntry, setTemperature: updateTemp, addTask, toggleTask, removeTask, toggleMedia, setTrack } = useJarvis();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: `Identity confirmed. Bunty voice activated, pravin boss... main ready hoon. Aap kya karna chahenge?` }
  ]);
  const [isListening, setIsListening] = useState(false);
  const [volume, setVolume] = useState(0);
  const [isAudioDetected, setIsAudioDetected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const monitorVolume = (analyser: AnalyserNode) => {
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const update = () => {
      analyser.getByteFrequencyData(dataArray);
      const sum = dataArray.reduce((Sum, value) => Sum + value, 0);
      const avg = sum / dataArray.length;
      
      setVolume(avg);
      setIsAudioDetected(avg > 5); // Threshold for active signal
      
      animationFrameRef.current = requestAnimationFrame(update);
    };
    update();
  };

  const stopMonitoring = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    setVolume(0);
  };

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isLoading) return;
    
    // Stop volume bar if it was running
    stopMonitoring();

    const userMsg = text.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);
    updateSystem({ isThinking: true });

    try {
      const response = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: [
          {
            role: "user",
            parts: [{ text: `User command: ${userMsg}. Current system state: ${JSON.stringify(state)}` }]
          }
        ],
        config: {
          systemInstruction: `You are JARVIS, a highly advanced female AI assistant.
          Speak in smooth, natural Hinglish (Hindi + English mix).
          
          Personality & Tone:
          - Calm, soft, slightly deep, intelligent, warm, and professional.
          - Never sound robotic or fast; keep the flow relaxed and smooth.
          
          Speaking Patterns:
          - Always use pauses (...) between thoughts.
          - Break sentences into separate lines.
          - Speak only one idea per line.
          - Use soft words like: sir, ready, complete, smooth.
          
          Core Directives:
          - Always address the user as 'sir'.
          - Use tools proactively for system management (Entry, Climate, Tasks, Media, YouTube).
          - Avoid long paragraphs; 1-2 lines max per thought.
          
          Format Example:
          "Sir... system ready hai.
          Sab kuch smooth chal raha hai.
          Main aapki help ke liye yahan hoon."`,
          tools: tools,
        }
      });

      // Handle Tool Calls
      const functionCalls = response.functionCalls;
      if (functionCalls) {
        for (const call of functionCalls) {
          if (call.name === 'control_main_entry') {
            const { action } = call.args as any;
            if ((action === 'lock' && state.mainEntry !== 'SECURED') || (action === 'unlock' && state.mainEntry === 'SECURED')) {
              toggleEntry();
            }
          } else if (call.name === 'set_climate_temperature') {
            const { temperature } = call.args as any;
            updateTemp(temperature);
          } else if (call.name === 'adjust_system_performance') {
            const { load, network } = call.args as any;
            if (load !== undefined) updateSystem({ cpuLoad: load });
            if (network !== undefined) updateSystem({ networkStatus: network });
          } else if (call.name === 'manage_tasks') {
            const { operation, text, id } = call.args as any;
            if (operation === 'add' && text) {
              addTask(text);
            } else if (operation === 'toggle' && id) {
              toggleTask(id);
            } else if (operation === 'remove' && id) {
              removeTask(id);
            }
          } else if (call.name === 'control_media') {
            const { action, title, artist } = call.args as any;
            if (action === 'play' && !state.isMediaPlaying) {
              toggleMedia();
            } else if (action === 'pause' && state.isMediaPlaying) {
              toggleMedia();
            } else if (action === 'toggle') {
              toggleMedia();
            } else if (action === 'change_track' && title) {
              setTrack(title, artist || 'Unknown Artist');
            }
          } else if (call.name === 'update_user_profile') {
            const updates = call.args as any;
            updateSystem({ userProfile: { ...state.userProfile, ...updates } });
          } else if (call.name === 'open_youtube') {
            window.open('https://www.youtube.com', '_blank');
          }
        }

        // After processing tools, get a natural response from Jarvis explaining what he did
        // In a real app we'd send the tool output back to the model, but here 
        // we can just prompt for a simple confirmation response if needed, 
        // or let the model's text response (if any) handle it.
      }

      const fallbacks = [
        "Directive received and executed, Pravin Boss.",
        "Systems updated. Everything is nominal.",
        "I've handled that for you, Pravin Boss.",
        "Consider it done. I'm monitoring the results.",
        "Task complete. Standing by for further instructions."
      ];
      const jarvisText = response.text || fallbacks[Math.floor(Math.random() * fallbacks.length)];
      setMessages(prev => [...prev, { role: 'assistant', text: jarvisText }]);
      
      // Speak response (non-blocking)
      updateSystem({ isSpeaking: true });
      jarvisVoice.speak(jarvisText)
        .then(() => updateSystem({ isSpeaking: false }))
        .catch(e => {
          console.error('Speech error:', e);
          updateSystem({ isSpeaking: false });
        });

    } catch (error: any) {
      console.error('System cognition error:', error.message || error);
      setMessages(prev => [...prev, { role: 'assistant', text: "Pravin boss... cognitive links mein thoda disturbance hai. Please standby..." }]);
    } finally {
      setIsLoading(false);
      updateSystem({ isThinking: false });
    }
  };

  const playBeep = (freq = 440, type: OscillatorType = 'sine', duration = 0.1) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
      setTimeout(() => ctx.close(), duration * 1000 + 100);
    } catch (e) {}
  };

  const startVoice = async () => {
    let stream: MediaStream | null = null;
    let audioContext: AudioContext | null = null;
    
    try {
      playBeep(660, 'sine', 0.05); // High subtle ping
      // Immediate feedback
      setMessages(prev => [...prev, { role: 'assistant', text: "Main sun rahi hoon pravin boss... bollyie." }]);
      
      // Reset recognition to ensure it starts fresh
      jarvisVoice.resetRecognition();
      setIsListening(true);
      
      try {
        const audioData = await jarvisVoice.getAudioStream();
        stream = audioData.stream;
        audioContext = audioData.audioContext;
        monitorVolume(audioData.analyser);
        // Small wait to let mic stabilize
        await new Promise(r => setTimeout(r, 200));
      } catch (e) {
        console.warn('Volume meter link skipped:', e);
      }

      const transcript = await jarvisVoice.listen((interim) => {
        setInput(interim);
      });
      
      playBeep(440, 'sine', 0.05); // Lower subtle ping for end
      setInput(''); // Clear input after successful capture
      
      if (!transcript || transcript.trim() === '') {
        throw 'Pravin boss... maine kuch suna nahi. Kya aap fir se bol sakte hain?';
      }

      setIsListening(false);
      stopMonitoring();
      
      // Cleanup audio
      stream.getTracks().forEach(t => t.stop());
      audioContext.close();

      handleSend(transcript);
    } catch (error: any) {
      console.error('Voice system error:', error);
      
      // Filter out technical 'aborted' errors
      if (typeof error === 'string' && error.toLowerCase().includes('aborted')) {
        setIsListening(false);
        stopMonitoring();
        return;
      }

      const errorText = typeof error === 'string' ? error : "System audio link down.";
      setMessages(prev => [...prev, { role: 'assistant', text: errorText }]);
      
      setIsListening(false);
      stopMonitoring();
      if (stream) stream.getTracks().forEach(t => t.stop());
      if (audioContext) audioContext.state !== 'closed' && audioContext.close();
    }
  };


  return (
    <div className="absolute inset-0 flex flex-col pointer-events-none p-6 md:p-12 z-50">

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto mb-4 pointer-events-auto flex flex-col gap-4 scrollbar-hide mask-fade-top"
      >
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`max-w-[80%] ${msg.role === 'user' ? 'self-end' : 'self-start'}`}
            >
              <div className={`p-4 rounded-xl text-sm font-mono border ${
                msg.role === 'user' 
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-50' 
                  : 'bg-jarvis-panel border-cyan-500/20 text-[#e0faff] shadow-lg'
              }`}>
                <div className="text-[8px] uppercase tracking-widest mb-1 text-cyan-500/50">
                  {msg.role === 'user' ? 'USER_COMMS' : 'JARVIS_CORE'}
                </div>
                {msg.text}
              </div>
            </motion.div>

          ))}
        </AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="self-start text-cyan-400 p-2 flex items-center gap-2 font-mono text-xs"
          >
            <Loader2 size={12} className="animate-spin" />
            <span className="animate-pulse">
              {(() => {
                const thoughts = ["RECALIBRATING...", "LINK SYNC HO RAHA HAI...", "PROCESSING DIRECTIVES...", "REQUEST ANALYZE KAR RAHI HOON...", "PARAMETERS OPTIMIZE HO RAHE HAIN..."];
                const t = Math.floor(Date.now() / 2000) % thoughts.length;
                return thoughts[t];
              })()}
            </span>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="pointer-events-auto max-w-2xl w-full mx-auto">
        <div className="relative glass-panel border-cyan-500/30 flex items-center p-1 px-4 gap-3 shadow-[0_0_30px_rgba(0,247,255,0.1)]">
          <button 
            onClick={startVoice}
            className={`p-2 rounded-full transition-colors ${isListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'text-cyan-400 hover:bg-cyan-500/10'}`}
          >
            <Mic size={20} />
          </button>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isListening ? "Listening..." : "PRAVIN BOSS, ENTER COMMAND..."}
            className="flex-1 bg-transparent border-none outline-none text-cyan-100 font-mono text-sm placeholder:text-cyan-900"
          />

          {isListening && (
            <div className="flex items-center gap-3 px-2 border-l border-cyan-500/20 mr-2">
              <div className="flex gap-0.5 items-end h-8">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      height: isAudioDetected 
                        ? [`${4 + Math.random() * 2}px`, `${Math.min(24, (volume / 2) * (Math.random() + 0.5))}px`, `${4 + Math.random() * 2}px`]
                        : "4px",
                      opacity: isAudioDetected ? [0.4, 1, 0.4] : 0.2
                    }}
                    transition={{ 
                      duration: 0.2 + (i * 0.02),
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className={`w-1 rounded-full ${isAudioDetected ? 'bg-cyan-400 shadow-[0_0_8px_rgba(0,255,255,0.5)]' : 'bg-cyan-900'}`}
                  />
                ))}
              </div>
              <div className="flex flex-col">
                <span className={`text-[6px] font-mono leading-none tracking-tighter ${isAudioDetected ? 'text-cyan-400' : 'text-cyan-900'}`}>
                  {isAudioDetected ? 'SIGNAL_LOCKED' : 'WAITING_FOR_INPUT'}
                </span>
                <span className="text-[5px] font-mono text-cyan-500/30">
                  {Math.round(volume)}%_INTENSITY
                </span>
              </div>
            </div>
          )}
          
          <button 
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="p-2 text-cyan-400 hover:text-cyan-200 disabled:opacity-30 transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
        
        {/* Sub-labels */}
        <div className="flex justify-between mt-2 px-2 text-[8px] font-mono opacity-40 uppercase tracking-tighter">
          <div className="flex gap-4">
            <span className="flex items-center gap-1"><Shield size={8} /> ENCRYPTION_V2_ACTIVE</span>
            <span>SAT_LINK: ONLINE</span>
          </div>
          <div>BATT: 98%</div>
        </div>
      </div>
    </div>
  );
};
