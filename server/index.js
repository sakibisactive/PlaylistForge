const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = require('./src/app');
const { initSocket } = require('./src/services/socketService');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Connect to MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.set('strictQuery', false);

async function startServer() {
  if (MONGODB_URI && !MONGODB_URI.includes('<db_password>')) {
    try {
      await mongoose.connect(MONGODB_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000
      });
      logger.info('📦 MongoDB Atlas connected successfully');
    } catch (err) {
      logger.error('❌ MongoDB Atlas connection error:', err.message);
      console.log('⚠️ Running server with fallback mock/memory storage until MongoDB credentials are confirmed.');
    }
  } else {
    console.log('⚠️ MONGODB_URI contains placeholder or is empty. Server will run with in-memory fallbacks until populated.');
  }

  server.listen(PORT, () => {
    logger.info(`🚀 PlaylistForge Server running on port ${PORT}`);
    logger.info(`📖 Swagger API Docs available at http://localhost:${PORT}/api/docs`);
  });
}

startServer();
