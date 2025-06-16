const { createClient } = require('redis');
const os = require('os');

// Cache expiration policies by data type (in seconds)
const CACHE_TTL = {
  apartments: 300,       // 5 minutes for apartments data
  users: 600,            // 10 minutes for user data
  tenants: 600,          // 10 minutes for tenant data
  metrics: 60,           // 1 minute for metrics/stats
  static: 86400,         // 24 hours for static data
  default: 300           // 5 minutes default
};

// Cache hit/miss tracking
const cacheStats = {
  hits: 0,
  misses: 0,
  ratio: () => {
    const total = cacheStats.hits + cacheStats.misses;
    return total ? Math.round((cacheStats.hits / total) * 100) : 0;
  },
  resetStats: () => {
    cacheStats.hits = 0;
    cacheStats.misses = 0;
  },
  logStats: () => {
    console.log(`Cache hit ratio: ${cacheStats.ratio()}% (${cacheStats.hits} hits, ${cacheStats.misses} misses)`);
  }
};

// Update the Redis client configuration
const client = createClient({
  // For Docker-to-Docker communication, use container name
  url: 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => {
      console.log(`Redis reconnection attempt ${retries}`);
      if (retries > 10) {
        console.error('Max Redis retries reached, giving up');
        return false; // Stop retrying
      }
      return Math.min(retries * 100, 3000);
    },
    connectTimeout: 5000 // 5 second timeout
  }
});

// Add connection event handlers
client.on('error', (err) => console.error('Redis error:', err));
client.on('connect', () => console.log('Redis connected'));

// Connect before exporting the enhancedRedis object
(async () => {
  try {
    await client.connect();
    console.log('Redis client successfully connected');
  } catch (err) {
    console.error('Failed to connect to Redis:', err);
  }
})();

// Enhanced Redis wrapper with additional features
const enhancedRedis = {
  // Original Redis client for direct operations
  client: client,
  
  // Add ping method to check connection
  async ping() {
    try {
      return await client.ping();
    } catch (err) {
      console.error('Redis ping error:', err);
      throw err;
    }
  },
  
  // Get cache key with tenant isolation
  getKey: (dataType, path, tenantId = null) => {
    const key = tenantId ? `tenant:${tenantId}:${dataType}:${path}` : `${dataType}:${path}`;
    console.log(`Generated key: ${key} (dataType=${dataType}, path=${path}, tenantId=${tenantId})`);
    return key;
  },
  
  // Get with TTL based on data type
  async get(key) {
    try {
      const value = await client.get(key);
      if (value) {
        cacheStats.hits++;
        return JSON.parse(value);
      }
      cacheStats.misses++;
      return null;
    } catch (err) {
      console.error('Redis get error:', err);
      return null;
    }
  },
  
  // Set with TTL based on data type
  async set(key, value, dataType = 'default', customTTL = null) {
    try {
      const ttl = customTTL || CACHE_TTL[dataType] || CACHE_TTL.default;
      return await client.setEx(key, ttl, JSON.stringify(value));
    } catch (err) {
      console.error('Redis set error:', err);
      return false;
    }
  },
  
  // Delete cache entry
  async del(key) {
    try {
      return await client.del(key);
    } catch (err) {
      console.error('Redis delete error:', err);
      return 0;
    }
  },
  
  // Invalidate all tenant-specific cache
  async invalidateTenant(tenantId) {
    try {
      const keys = await client.keys(`tenant:${tenantId}:*`);
      if (keys.length > 0) {
        return await client.del(...keys);
      }
      return 0;
    } catch (err) {
      console.error('Redis invalidate tenant error:', err);
      return 0;
    }
  },
  
  // Get cache stats
  getStats() {
    return {
      hits: cacheStats.hits,
      misses: cacheStats.misses,
      ratio: cacheStats.ratio()
    };
  },
  
  // Reset cache stats
  resetStats() {
    cacheStats.resetStats();
  }
};

module.exports = enhancedRedis;

// MongoDB connection string (for reference, not used in this file)
// mongodb://mongo:27017/kidega-apartments