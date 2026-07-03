# PlaylistForge 🎵

> Full-stack MERN Music Playlist Creator with Spotify API Integration & Redis Caching.

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Frontend-black?style=for-the-badge&logo=vercel)](https://vercel.com)
[![Render Deployment](https://img.shields.io/badge/Render-Backend-blue?style=for-the-badge&logo=render)](https://render.com)
[![Spotify Web API](https://img.shields.io/badge/Spotify-API-1DB954?style=for-the-badge&logo=spotify)](https://developer.spotify.com)

## 🚀 Features

- **Spotify OAuth 2.0 PKCE Integration**: Secure login and track searching via Spotify API with fallback mock data handler.
- **Multi-layer Redis Caching**: Search results cached for 5 minutes (`search:${query}`), playlists cached for 30s.
- **Drag-and-Drop Playlist Reordering**: Intuitive track sequence management using `@hello-pangea/dnd`.
- **AI Smart Playlist Generator**: Build custom mixes based on Spotify Audio Features (Energy, Danceability, Valence, Tempo).
- **Spotify Playlist URL Importer**: Paste any Spotify playlist URL to clone tracks instantly.
- **Real-Time Collaboration**: Socket.io live updates when multiple users edit playlists simultaneously.
- **Instructor Admin Dashboard**: Master password protected panel with system analytics, cache stats, manual overrides, and CSV export.
- **PWA Ready**: Offline capabilities with service worker and manifest.json.

## 🛠 Quick Start

```bash
# Install dependencies for both client and server
npm run install

# Start development mode (runs backend on :5000 and frontend on :5173 concurrently)
npm run dev

# Seed database with starter featured tracks
npm run seed
```

## 📖 API Documentation
Swagger UI documentation is available at `http://localhost:5000/api/docs`.
