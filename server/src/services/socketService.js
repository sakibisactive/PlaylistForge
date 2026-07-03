let ioInstance = null;

function initSocket(server) {
  const { Server } = require('socket.io');
  ioInstance = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  ioInstance.on('connection', (socket) => {
    console.log('⚡ Socket connected:', socket.id);

    // Join playlist room for real-time collaborative updates
    socket.on('join_playlist', (playlistId) => {
      socket.join(`playlist_${playlistId}`);
      console.log(`Socket ${socket.id} joined playlist_${playlistId}`);
    });

    socket.on('leave_playlist', (playlistId) => {
      socket.leave(`playlist_${playlistId}`);
    });

    socket.on('disconnect', () => {
      // Clean up socket
    });
  });

  return ioInstance;
}

function notifyPlaylistUpdated(playlistId, actionType, payload) {
  if (ioInstance) {
    ioInstance.to(`playlist_${playlistId}`).emit('playlist_updated', {
      actionType, // 'TRACK_ADDED', 'TRACK_REMOVED', 'TRACKS_REORDERED'
      playlistId,
      payload
    });
  }
}

function broadcastSystemMessage(message) {
  if (ioInstance) {
    ioInstance.emit('system_message', { message, timestamp: new Date() });
  }
}

module.exports = { initSocket, notifyPlaylistUpdated, broadcastSystemMessage };
