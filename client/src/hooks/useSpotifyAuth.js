import { useState } from 'react';
import axiosClient from '../api/axiosClient';

export function useSpotifyAuth() {
  const [connecting, setConnecting] = useState(false);

  const connectSpotify = async () => {
    try {
      setConnecting(true);
      const res = await axiosClient.post('/auth/spotify');
      if (res.data.authUrl) {
        window.location.href = res.data.authUrl;
      }
    } catch (err) {
      console.error('Spotify connect error:', err);
    } finally {
      setConnecting(false);
    }
  };

  return { connectSpotify, connecting };
}
