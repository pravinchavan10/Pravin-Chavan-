import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // Spotify Config
  const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
  const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
  const REDIRECT_URI = `${process.env.APP_URL || 'http://localhost:3000'}/auth/spotify/callback`;

  // --- Spotify Auth Routes ---

  app.get('/api/auth/spotify/url', (req, res) => {
    if (!SPOTIFY_CLIENT_ID) {
      return res.status(500).json({ error: 'Spotify Client ID not configured' });
    }

    const scope = 'user-read-playback-state user-modify-playback-state user-read-currently-playing';
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: SPOTIFY_CLIENT_ID,
      scope: scope,
      redirect_uri: REDIRECT_URI,
    });

    res.json({ url: `https://accounts.spotify.com/authorize?${params.toString()}` });
  });

  app.get(['/auth/spotify/callback', '/auth/spotify/callback/'], async (req, res) => {
    const code = req.query.code as string;

    if (!code) {
      return res.send('No code provided');
    }

    try {
      const response = await axios.post('https://accounts.spotify.com/api/token', 
        new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: REDIRECT_URI,
          client_id: SPOTIFY_CLIENT_ID!,
          client_secret: SPOTIFY_CLIENT_SECRET!,
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      const { access_token, refresh_token, expires_in } = response.data;

      // Set cookies for the tokens - Required for cross-origin iframe
      res.cookie('spotify_access_token', access_token, { 
        maxAge: expires_in * 1000, 
        httpOnly: true, 
        secure: true, 
        sameSite: 'none' 
      });
      res.cookie('spotify_refresh_token', refresh_token, { 
        maxAge: 30 * 24 * 60 * 60 * 1000, 
        httpOnly: true, 
        secure: true, 
        sameSite: 'none' 
      });

      res.send(`
        <html>
          <body style="background: #000; color: #00f2ff; font-family: monospace; display: flex; align-items: center; justify-content: center; height: 100vh;">
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'SPOTIFY_AUTH_SUCCESS' }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <div style="text-align: center;">
              <h2>IDENTITY SYNC COMPLETE</h2>
              <p>Spotify protocols integrated. Closing link...</p>
            </div>
          </body>
        </html>
      `);
    } catch (error) {
      console.error('Spotify token exchange failed:', error);
      res.status(500).send('Authentication failed');
    }
  });

  app.get('/api/spotify/status', (req, res) => {
    const connected = !!req.cookies.spotify_access_token;
    res.json({ connected });
  });

  app.post('/api/spotify/logout', (req, res) => {
    res.clearCookie('spotify_access_token', { secure: true, sameSite: 'none' });
    res.clearCookie('spotify_refresh_token', { secure: true, sameSite: 'none' });
    res.json({ success: true });
  });

  // --- ElevenLabs TTS Proxy ---
  app.post('/api/tts', async (req, res) => {
    const { text } = req.body;
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'ElevenLabs API key not configured' });
    }

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    try {
      // Bunty Persona Voice IDs (Standard Pre-made voices)
      const buntyVoices = [
        '7qBNUtXRGP0jPi0H4r8k', // User Priority
        'pNInz6S7xBr0m9fV2Dbo', // Adam
        'erXwDqyqgg4baic98z6k', // Antoni
        'TxGEqnSAn9drLp4H6G3j', // Josh
        'EXAVITQu4vr4xnSDxMaL'  // Bella
      ];

      const callTTS = async (voiceId: string) => {
        return axios({
          method: 'POST',
          url: `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
          data: {
            text,
            model_id: 'eleven_multilingual_v2', 
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.8,
              style: 0.0,
              use_speaker_boost: true
            }
          },
          headers: {
            'xi-api-key': apiKey,
            'Content-Type': 'application/json',
            'accept': 'audio/mpeg'
          },
          responseType: 'stream'
        });
      };

      let response;
      let usedVoiceId = '';
      
      for (const voiceId of buntyVoices) {
        try {
          response = await callTTS(voiceId);
          usedVoiceId = voiceId;
          break; // Success
        } catch (err: any) {
          const errorDetail = err.response?.data?.detail?.message || err.message;
          console.warn(`Bunty voice link [${voiceId}] failed: ${errorDetail}. Attempting next frequency...`);
          continue;
        }
      }

      if (!response) {
        throw new Error('All Bunty voice links failed to initialize.');
      }

      console.log(`Bunty voice active [${usedVoiceId}]`);

      res.setHeader('Content-Type', 'audio/mpeg');
      response.data.pipe(res);
    } catch (error: any) {
      const status = error.response?.status || 500;
      const data = error.response?.data;
      
      // Prevent log clutter in production-like environment
      if (status !== 404 && status !== 401) {
        console.error(`ElevenLabs System Error [${status}]`);
      }
      
      res.status(status).json({ 
        error: 'TTS generation failed'
      });
    }
  });
  // --- End ElevenLabs TTS Proxy ---

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`JARVIS Server online at http://0.0.0.0:${PORT}`);
  });
}

startServer();
