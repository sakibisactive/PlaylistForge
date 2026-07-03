const axios = require('axios');
const crypto = require('crypto');

let apiStats = {
  callsMade: 0,
  rateLimitHits: 0
};

// Generates PKCE Code Verifier and Code Challenge
function generatePKCE() {
  const verifier = crypto.randomBytes(32).toString('base64url');
  const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');
  return { verifier, challenge };
}

// Exponential backoff runner for Axios Spotify requests
async function executeWithRetry(fn, maxRetries = 3) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      apiStats.callsMade++;
      return await fn();
    } catch (error) {
      if (error.response && error.response.status === 429) {
        apiStats.rateLimitHits++;
        const retryAfter = parseInt(error.response.headers['retry-after'] || '2', 10);
        const backoffMs = (retryAfter * 1000) + (Math.pow(2, attempt) * 200);
        console.warn(`Spotify Rate Limit hit! Waiting ${backoffMs}ms before retry...`);
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
        attempt++;
      } else {
        throw error;
      }
    }
  }
  throw new Error('Spotify API maximum retry attempts exceeded');
}

// Starter sample tracks for fallback mock search
const MOCK_TRACKS = [
  {
    spotifyTrackId: '4cOdK2wGLETKBW3PvgPWqT',
    trackName: 'Blinding Lights',
    artists: ['The Weeknd'],
    albumName: 'After Hours',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b273886370c0474793f3dee88c75',
    durationMs: 200040,
    audioFeatures: { energy: 0.73, danceability: 0.51, valence: 0.33, tempo: 171.0 }
  },
  {
    spotifyTrackId: '3n3Ppam7vgaVa1iaRUc9Lp',
    trackName: 'Mr. Brightside',
    artists: ['The Killers'],
    albumName: 'Hot Fuss',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b273cc0486c4786ed655f0535e69',
    durationMs: 222973,
    audioFeatures: { energy: 0.91, danceability: 0.35, valence: 0.24, tempo: 148.0 }
  },
  {
    spotifyTrackId: '7qiZwU4dYBDpB16irB3W3A',
    trackName: 'Shape of You',
    artists: ['Ed Sheeran'],
    albumName: '÷ (Divide)',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b273ba5db46f4b838ef6027e6f96',
    durationMs: 233712,
    audioFeatures: { energy: 0.65, danceability: 0.82, valence: 0.93, tempo: 96.0 }
  },
  {
    spotifyTrackId: '0VjIjW4GlUZAMYd2vXMi3b',
    trackName: 'Levitating',
    artists: ['Dua Lipa'],
    albumName: 'Future Nostalgia',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b273bd26ded61801a9edbe16d165',
    durationMs: 203807,
    audioFeatures: { energy: 0.84, danceability: 0.69, valence: 0.91, tempo: 103.0 }
  },
  {
    spotifyTrackId: '57q224W02pSjI9n05b4b1e',
    trackName: 'As It Was',
    artists: ['Harry Styles'],
    albumName: "Harry's House",
    albumArt: 'https://i.scdn.co/image/ab67616d0000b2732e8f1b621e25e9858348841a',
    durationMs: 167303,
    audioFeatures: { energy: 0.73, danceability: 0.52, valence: 0.66, tempo: 174.0 }
  },
  {
    spotifyTrackId: '6Uel21tEjj2vTF4h2X2eeM',
    trackName: 'Starboy',
    artists: ['The Weeknd', 'Daft Punk'],
    albumName: 'Starboy',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b2734718e2412451096d0eb21884',
    durationMs: 230453,
    audioFeatures: { energy: 0.59, danceability: 0.68, valence: 0.49, tempo: 186.0 }
  },
  {
    spotifyTrackId: '1BxfiyV225E92YsOTqkiAB',
    trackName: 'Bohemian Rhapsody',
    artists: ['Queen'],
    albumName: 'A Night at the Opera',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b273e319baafd16e84f0408af2a0',
    durationMs: 354947,
    audioFeatures: { energy: 0.40, danceability: 0.41, valence: 0.22, tempo: 71.0 }
  },
  {
    spotifyTrackId: '5V07G0e5M6g7f5r3t0798z',
    trackName: 'Stay',
    artists: ['The Kid LAROI', 'Justin Bieber'],
    albumName: 'F*CK LOVE 3: OVER YOU',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b273a5a782f9ef023d5162a046c8',
    durationMs: 141800,
    audioFeatures: { energy: 0.76, danceability: 0.59, valence: 0.48, tempo: 170.0 }
  }
];

class SpotifyService {
  isMockMode() {
    return (!process.env.SPOTIFY_CLIENT_ID || process.env.SPOTIFY_CLIENT_ID.includes('mock'));
  }

  // Search tracks with Spotify API or Mock fallback
  async searchTracks(query, accessToken = null) {
    if (this.isMockMode() || !accessToken) {
      const q = query.toLowerCase();
      const filtered = MOCK_TRACKS.filter(t => 
        t.trackName.toLowerCase().includes(q) || 
        t.artists.some(a => a.toLowerCase().includes(q)) ||
        t.albumName.toLowerCase().includes(q)
      );
      return filtered.length > 0 ? filtered : MOCK_TRACKS;
    }

    return executeWithRetry(async () => {
      const response = await axios.get('https://api.spotify.com/v1/search', {
        params: { q: query, type: 'track', limit: 20 },
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      return response.data.tracks.items.map(t => ({
        spotifyTrackId: t.id,
        trackName: t.name,
        artists: t.artists.map(a => a.name),
        albumName: t.album.name,
        albumArt: t.album.images[0]?.url || '',
        durationMs: t.duration_ms
      }));
    });
  }

  // Refresh Spotify access token using refresh token
  async refreshToken(refreshToken) {
    if (this.isMockMode()) {
      return { accessToken: 'mock_access_token_' + Date.now(), expiresIn: 3600 };
    }
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: process.env.SPOTIFY_CLIENT_ID
    });
    if (process.env.SPOTIFY_CLIENT_SECRET) {
      params.append('client_secret', process.env.SPOTIFY_CLIENT_SECRET);
    }
    const res = await axios.post('https://accounts.spotify.com/api/token', params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    return {
      accessToken: res.data.access_token,
      expiresIn: res.data.expires_in
    };
  }

  // Import playlist from Spotify URL/ID
  async getSpotifyPlaylistTracks(spotifyPlaylistId, accessToken = null) {
    if (this.isMockMode() || !accessToken) {
      return MOCK_TRACKS.slice(0, 5);
    }
    return executeWithRetry(async () => {
      const res = await axios.get(`https://api.spotify.com/v1/playlists/${spotifyPlaylistId}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      return {
        name: res.data.name,
        description: res.data.description,
        tracks: res.data.tracks.items.map(item => ({
          spotifyTrackId: item.track.id,
          trackName: item.track.name,
          artists: item.track.artists.map(a => a.name),
          albumName: item.track.album.name,
          albumArt: item.track.album.images[0]?.url || '',
          durationMs: item.track.duration_ms
        }))
      };
    });
  }

  // Generate Smart Playlist based on audio feature targets
  async generateSmartPlaylist(criteria, accessToken = null) {
    const { energy = 0.5, danceability = 0.5, valence = 0.5, limit = 5 } = criteria;
    const all = MOCK_TRACKS;
    
    // Sort by closeness to target criteria
    const scored = all.map(t => {
      const score = Math.abs(t.audioFeatures.energy - energy) + 
                    Math.abs(t.audioFeatures.danceability - danceability) + 
                    Math.abs(t.audioFeatures.valence - valence);
      return { track: t, score };
    }).sort((a, b) => a.score - b.score);

    return scored.slice(0, limit).map(s => s.track);
  }

  getApiStats() {
    return { ...apiStats, isMockMode: this.isMockMode() };
  }
}

module.exports = new SpotifyService();
module.exports.generatePKCE = generatePKCE;
module.exports.MOCK_TRACKS = MOCK_TRACKS;
