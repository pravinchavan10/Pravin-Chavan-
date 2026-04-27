import React, { createContext, useContext, useState, useCallback } from 'react';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
}

interface SystemState {
  cpuLoad: number;
  memoryUsage: string;
  networkStatus: 'Stable' | 'Partial' | 'Offline';
  climateControl: {
    temp: number;
    status: 'Eco' | 'Power' | 'Off';
  };
  mainEntry: 'SECURED' | 'UNLOCKED' | 'BREACHED';
  energyGrid: number;
  isMediaPlaying: boolean;
  currentTrack: {
    title: string;
    artist: string;
  };
  playlist: { title: string; artist: string }[];
  tasks: Task[];
  isThinking: boolean;
  isSpeaking: boolean;
  isSpotifyConnected: boolean;
  spotifyUsername: string | null;
  userProfile: {
    username: string;
    email: string;
    gender: string;
    birthDate: {
      year: number;
      month: string;
      day: number;
    };
  };
}

interface JarvisContextType {
  state: SystemState;
  updateSystem: (updates: Partial<SystemState>) => void;
  toggleEntry: () => void;
  setTemperature: (temp: number) => void;
  toggleMedia: () => void;
  setTrack: (title: string, artist: string) => void;
  addTask: (text: string, priority?: Task['priority']) => void;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void;
  checkSpotifyStatus: () => Promise<void>;
  setSpotifyUsername: (username: string | null) => void;
  updateProfile: (profile: Partial<SystemState['userProfile']>) => void;
}

const defaultState: SystemState = {
  cpuLoad: 24,
  memoryUsage: '4.2 GB',
  networkStatus: 'Stable',
  climateControl: {
    temp: 72.4,
    status: 'Eco',
  },
  mainEntry: 'SECURED',
  energyGrid: 88,
  isMediaPlaying: true,
  currentTrack: {
    title: 'Interstellar Main Theme',
    artist: 'Hans Zimmer',
  },
  playlist: [
    { title: 'Interstellar Main Theme', artist: 'Hans Zimmer' },
    { title: 'Back In Black', artist: 'AC/DC' },
    { title: 'Iron Man', artist: 'Black Sabbath' },
  ],
  tasks: [
    { id: '1', text: 'Calibrate arc reactor field', completed: false, priority: 'high' },
    { id: '2', text: 'Update Mark 85 OS firmware', completed: true, priority: 'medium' }
  ],
  isThinking: false,
  isSpeaking: false,
  isSpotifyConnected: false,
  spotifyUsername: '31g32t7k5tlbhehjhezzoa2gch4m',
  userProfile: {
    username: '31g32t7k5tlbhehjhezzoa2gch4m',
    email: 'pravinchavan1015@gmail.com',
    gender: 'Male',
    birthDate: {
      year: 2005,
      month: 'December',
      day: 15
    }
  }
};


const JarvisContext = createContext<JarvisContextType | undefined>(undefined);

export const JarvisProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<SystemState>(defaultState);

  const updateSystem = useCallback((updates: Partial<SystemState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const toggleEntry = useCallback(() => {
    setState(prev => ({
      ...prev,
      mainEntry: prev.mainEntry === 'SECURED' ? 'UNLOCKED' : 'SECURED'
    }));
  }, []);

  const setTemperature = useCallback((temp: number) => {
    setState(prev => ({
      ...prev,
      climateControl: { ...prev.climateControl, temp }
    }));
  }, []);

  const toggleMedia = useCallback(() => {
    setState(prev => ({ ...prev, isMediaPlaying: !prev.isMediaPlaying }));
  }, []);

  const setTrack = useCallback((title: string, artist: string) => {
    setState(prev => ({
      ...prev,
      currentTrack: { title, artist },
      isMediaPlaying: true
    }));
  }, []);

  const addTask = useCallback((text: string, priority: Task['priority'] = 'medium') => {
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      text,
      completed: false,
      priority
    };
    setState(prev => ({ ...prev, tasks: [...prev.tasks, newTask] }));
  }, []);

  const toggleTask = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    }));
  }, []);

  const removeTask = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== id)
    }));
  }, []);

  const checkSpotifyStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/spotify/status');
      const data = await res.json();
      setState(prev => ({ ...prev, isSpotifyConnected: data.connected }));
    } catch (error) {
      console.error('Failed to check Spotify status:', error);
    }
  }, []);

  const setSpotifyUsername = useCallback((username: string | null) => {
    setState(prev => ({ ...prev, spotifyUsername: username }));
  }, []);

  const updateProfile = useCallback((profile: Partial<SystemState['userProfile']>) => {
    setState(prev => ({ ...prev, userProfile: { ...prev.userProfile, ...profile } }));
  }, []);

  React.useEffect(() => {
    checkSpotifyStatus();
  }, [checkSpotifyStatus]);

  return (
    <JarvisContext.Provider value={{ 
      state, 
      updateSystem, 
      toggleEntry, 
      setTemperature, 
      toggleMedia,
      setTrack,
      addTask,
      toggleTask,
      removeTask,
      checkSpotifyStatus,
      setSpotifyUsername,
      updateProfile
    }}>
      {children}
    </JarvisContext.Provider>
  );
};


export const useJarvis = () => {
  const context = useContext(JarvisContext);
  if (context === undefined) {
    throw new Error('useJarvis must be used within a JarvisProvider');
  }
  return context;
};
