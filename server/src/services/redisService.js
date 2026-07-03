const Redis = require('ioredis');

class InMemoryCache {
  constructor() {
    this.cache = new Map();
  }
  async get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    if (item.expires && Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }
  async setex(key, ttlSeconds, value) {
    const expires = Date.now() + (ttlSeconds * 1000);
    this.cache.set(key, { value, expires });
    return 'OK';
  }
  async del(key) {
    this.cache.delete(key);
    return 1;
  }
  async keys(pattern) {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    const matching = [];
    for (const key of this.cache.keys()) {
      if (regex.test(key)) matching.push(key);
    }
    return matching;
  }
}

let redisClient = null;
let isRedisConnected = false;
const inMemoryCache = new InMemoryCache();

let stats = {
  hits: 0,
  misses: 0
};

try {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  redisClient = new Redis(redisUrl, {
    maxRetriesPerRequest: 1,
    connectTimeout: 2000,
    retryStrategy() {
      return null; // Don't block if Redis isn't running
    }
  });

  redisClient.on('connect', () => {
    isRedisConnected = true;
    console.log('⚡ Connected to Redis successfully');
  });

  redisClient.on('error', (err) => {
    isRedisConnected = false;
    // Silent failover to in-memory cache
  });
} catch (err) {
  isRedisConnected = false;
}

const getCache = async (key) => {
  try {
    let val = null;
    if (isRedisConnected && redisClient) {
      val = await redisClient.get(key);
    } else {
      val = await inMemoryCache.get(key);
    }
    if (val) {
      stats.hits++;
      return JSON.parse(val);
    }
    stats.misses++;
    return null;
  } catch (e) {
    stats.misses++;
    return null;
  }
};

const setCache = async (key, ttlSeconds, data) => {
  try {
    const str = JSON.stringify(data);
    if (isRedisConnected && redisClient) {
      await redisClient.setex(key, ttlSeconds, str);
    } else {
      await inMemoryCache.setex(key, ttlSeconds, str);
    }
  } catch (e) {
    console.error('Cache set error:', e.message);
  }
};

const deleteCache = async (key) => {
  try {
    if (isRedisConnected && redisClient) {
      await redisClient.del(key);
    } else {
      await inMemoryCache.del(key);
    }
  } catch (e) {}
};

const invalidateSearchCache = async () => {
  try {
    let keys = [];
    if (isRedisConnected && redisClient) {
      keys = await redisClient.keys('search:*');
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
    } else {
      keys = await inMemoryCache.keys('search:*');
      for (const k of keys) {
        await inMemoryCache.del(k);
      }
    }
  } catch (e) {}
};

const invalidatePlaylistCache = async (playlistId) => {
  try {
    await deleteCache(`playlist:${playlistId}`);
    await invalidateSearchCache();
  } catch (e) {}
};

const getCacheStats = () => {
  const total = stats.hits + stats.misses;
  const hitRate = total > 0 ? ((stats.hits / total) * 100).toFixed(2) + '%' : '0%';
  return {
    hits: stats.hits,
    misses: stats.misses,
    totalRequests: total,
    hitRate,
    usingRedis: isRedisConnected
  };
};

module.exports = {
  getCache,
  setCache,
  deleteCache,
  invalidateSearchCache,
  invalidatePlaylistCache,
  getCacheStats
};
