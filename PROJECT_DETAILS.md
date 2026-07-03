# PlaylistForge - Project Details & Setup Summary

## 📌 Executive Summary
**PlaylistForge** is a production-ready, full-stack MERN (MongoDB Atlas, Express.js, React.js, Node.js) music playlist creator. It integrates with Spotify Web API for music searching, audio features analysis, and Web Playback SDK streaming, with multi-layered Redis caching for ultra-fast performance and protection against API rate limits.

---

## 🔑 Login & Authentication Details

### First-Page Access:
The application defaults to a **Login & Registration** view upon initial visit to support high user concurrency and account persistence.

### 1-Click Demo & Instructor Login:
- **Username**: `sakib_creator`
- **Password**: `password123`

### Instructor Admin Dashboard Credentials:
- **Admin Password**: `forgeadmin123`
- Access via the **Admin** button in the top navigation bar.

---

## 🍃 MongoDB Atlas Connection Details

- **Cluster URI Format**: `mongodb+srv://shahriarsakib1205_db_user:0AWLYB0Cb2V6N4Z7@cluster0.4bvn9ac.mongodb.net/playlistforge?retryWrites=true&w=majority`
- **Database Username**: `Shahriarsakib1205_db_user`
- **Database Password**: `0AWLYB0Cb2V6N4Z7`

### Database Seeder Command:
Once MongoDB Atlas database link is created manually, populate the starter tracks and demo accounts by running:
```bash
npm run seed --prefix server
```
Or trigger database seeding via REST API call:
`POST http://localhost:5000/api/seed`

---

## ⚡ Redis Caching Architecture

1. **Search Query Cache**: `search:${query}` (TTL: 300 seconds / 5 minutes).
2. **Track Cache**: `track:${spotifyTrackId}` (TTL: 3600 seconds / 1 hour).
3. **Playlist Cache**: `playlist:${playlistId}` (TTL: 30 seconds).
4. **Cache Invalidation**: Automatically purges search and playlist caches when tracks are added or deleted.
5. **Fallback System**: If Redis is offline or disconnected, the app seamlessly switches to an in-memory Map cache so execution never fails.

---

## 🛠 Tech Stack Overview

- **Frontend**: React 18, Vite, Redux Toolkit, Redux Persist, Tailwind CSS, `@hello-pangea/dnd` (Drag and Drop), Socket.io-client, Lucide Icons, PWA Service Worker.
- **Backend**: Node.js, Express.js, Mongoose, ioredis, Winston Logger, Swagger UI (`/api/docs`), Socket.io, Spotify REST API & PKCE Auth flow.
- **Deployment**: Vercel ready (Frontend with SPA rewrite routing), Render/Railway ready (Backend API Web Service).

---

## 🔗 GitHub Repository
- **URL**: `https://github.com/sakibisactive/PlaylistForge.git`
