/**
 * Jarvis Speech Service
 * Handles Speech-to-Text and Text-to-Speech using Web APIs.
 */

class SpeechService {
  private synthesis: SpeechSynthesis;
  private voice: SpeechSynthesisVoice | null = null;
  private recognition: any = null;

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.initVoice();
    this.initRecognition();
  }

  private initVoice() {
    // Try to find a female voice (FRIDAY/JOCASTA style)
    const setVoice = () => {
      const voices = this.synthesis.getVoices();
      // Look for female voices: Google US English Female, Google UK English Female, or generic female
      this.voice = voices.find(v => 
        v.name.includes('Female') || 
        v.name.includes('Google US English') ||
        v.name.includes('Samantha') || 
        v.name.includes('Victoria')
      ) || voices[0];
    };

    if (this.synthesis.onvoiceschanged !== undefined) {
      this.synthesis.onvoiceschanged = setVoice;
    }
    setVoice();
  }

  private initRecognition() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true; // Stay active to prevent quiet-cuts
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;
      this.recognition.lang = 'en-IN';
    }
  }

  public resetRecognition() {
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch (e) {}
      this.initRecognition();
    }
  }

  public async speak(text: string): Promise<void> {
    // 1. Try ElevenLabs with a strict timeout
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500); // 3.5s limit

      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('ElevenLabs failed, falling back to local synthesis');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      return new Promise((resolve) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          resolve();
        };
        audio.onerror = (e) => {
          console.error('Audio playback error:', e);
          // Fallback to local synthesis if playback fails
          this.speakLocal(text).then(resolve);
        };
        audio.play().catch(err => {
          console.error('Play blocked or failed:', err);
          this.speakLocal(text).then(resolve);
        });
      });
    } catch (error) {
      console.warn('ElevenLabs unavailable:', error);
      return this.speakLocal(text);
    }
  }

  private speakLocal(text: string): Promise<void> {
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      if (this.voice) {
        utterance.voice = this.voice;
      }
      utterance.pitch = 1.1; 
      utterance.rate = 1.1;  
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve(); 
      this.synthesis.speak(utterance);
    });
  }


  public async getAudioStream(): Promise<{ stream: MediaStream, analyser: AnalyserNode, audioContext: AudioContext }> {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    return { stream, analyser, audioContext };
  }

  public async requestPermission(): Promise<boolean> {
    try {
      // Simplier request for broader compatibility, then refine if possible
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); 
      return true;
    } catch (e) {
      console.error('Permission request failed:', e);
      return false;
    }
  }

  public listen(onInterim?: (text: string) => void): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject('Pravin boss, aapka browser voice command support nahi karta. Please Chrome use kariye.');
        return;
      }

      let isResolved = false;
      let isStarted = false;
      let timeoutHandle: any = null;

      const setDynamicTimeout = (ms: number) => {
        if (timeoutHandle) clearTimeout(timeoutHandle);
        timeoutHandle = setTimeout(() => {
          if (!isResolved) {
            isResolved = true;
            this.stopRecognition();
            reject('Pravin boss, mic active hai lekin voice detect nahi ho rahi. Kya aap mic ke thoda kareeb se bol sakte hain?');
          }
        }, ms);
      };

      // Initial 20s timeout for first detection
      setDynamicTimeout(20000);

      const finishSource = (text: string) => {
        if (!isResolved) {
          isResolved = true;
          if (timeoutHandle) clearTimeout(timeoutHandle);
          this.stopRecognition();
          resolve(text);
        }
      };

      this.recognition.onstart = () => {
        console.log('JARVIS: Voice capture link active.');
        isStarted = true;
        // If it starts, give it a fresh 10s even if no sound is heard immediately
        if (!isResolved) setDynamicTimeout(15000);
      };

      this.recognition.onaudiostart = () => {
        console.log('JARVIS: Hardware audio stream inbound.');
      };

      // Reset timeout if any sound or speech starts
      this.recognition.onsoundstart = () => {
        if (!isResolved) setDynamicTimeout(10000); // 10s more if we hear anything
      };

      this.recognition.onspeechstart = () => {
        if (!isResolved) setDynamicTimeout(10000); // 10s more if we hear actual speech
      };

      this.recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';
        
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          if (result.isFinal) {
            final += result[0].transcript;
          } else {
            interim += result[0].transcript;
          }
        }

        console.log('JARVIS STT:', { final, interim });

        if (onInterim && (interim || final)) {
          onInterim(final + interim);
        }

        if (final.trim()) {
          // In dynamic/continuous mode, we wait a tiny bit after a final result 
          // to see if the user has more to say, OR we resolve if it's a clear command.
          // For JARVIS, we resolve immediately on the first clear final utterance.
          finishSource(final.trim());
        } else {
          // Sound detected, reset timeout
          if (!isResolved) setDynamicTimeout(8000);
        }
      };

      this.recognition.onerror = (event: any) => {
        if (isResolved) return;
        
        // Ignore 'aborted' if it happens during our own cleanup or silent retries
        if (event.error === 'aborted') {
          console.warn('System: Recognition reset (aborted).');
          return;
        }

        if (event.error === 'no-speech') {
          if (isStarted) {
            try { 
              this.recognition.stop();
              setTimeout(() => { if (!isResolved) this.recognition.start(); }, 200);
            } catch (e) {}
          }
          return;
        }
        
        console.error('Recognition Critical Error:', event.error);
        isResolved = true;
        if (timeoutHandle) clearTimeout(timeoutHandle);
        this.stopRecognition();
        
        let msg = 'Voice sync failed.';
        if (event.error === 'not-allowed') msg = 'Pravin boss, mic permission denied hai.';
        reject(msg);
      };

      // Reset and Start with a slight delay to allow hardware cleanup
      try {
        this.recognition.abort();
        setTimeout(() => {
          if (!isResolved) {
            try { this.recognition.start(); } catch(e) { reject('System mic load nahi kar paya.'); }
          }
        }, 400); 
      } catch (e) {
        if (timeoutHandle) clearTimeout(timeoutHandle);
        reject('Speech engine crash.');
      }
    });
  }

  private stopRecognition() {
    if (this.recognition) {
      try { this.recognition.stop(); } catch(e) {
        try { this.recognition.abort(); } catch(e2) {}
      }
    }
  }


}

export const jarvisVoice = new SpeechService();
