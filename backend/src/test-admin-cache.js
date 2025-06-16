const axios = require('axios');
const redis = require('./config/redis');

// Admin token - replace with your token
const adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODQxM2RkMTk2MmE0YTI1OTNlMjMwMjYiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NDkxOTQ5NDQsImV4cCI6MTc0OTE5Njc0NH0.ddsdpZJJZgyvo5VgdlahEXXDby-O-5sykum7RlZMv5k';

async function ensureRedisConnection() {
  try {
    // Try to ping Redis to ensure connection is healthy
    await redis.ping();
    console.log('Redis connection confirmed');
    return true;
  } catch (error) {
    console.error('Redis connection failed:', error.message);
    return false;
  }
}

async function testAdminCache() {
  // Ensure Redis connection
  const isConnected = await ensureRedisConnection();
  if (!isConnected) {
    console.error('Cannot proceed with test - Redis connection required');
    process.exit(1);
  }

  try {
    // Get the cache key (no tenant ID for admin)
    const key = redis.getKey('apartments', '/api/apartments');
    console.log(`Cache key: ${key}`);

    // Clear cache
    await redis.del(key);
    console.log('Cleared cache');

    // First request: MISS
    console.log('Making first request (should MISS)...');
    const first = await axios.get('http://localhost:5001/api/apartments', {
      headers: { Authorization: `Bearer ${adminToken}` },
      timeout: 5000 // 5 second timeout
    });
    console.log('Admin first X-Cache:', first.headers['x-cache']);

    // After first request
    console.log('After first request, checking cache:');
    const cachedValue = await redis.get(key);
    console.log('Cache has data:', !!cachedValue);
    if (cachedValue) {
      console.log('Cache data length:', JSON.stringify(cachedValue).length);
    }

    // Second request: HIT
    console.log('Making second request (should HIT)...');
    const second = await axios.get('http://localhost:5001/api/apartments', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('Admin second X-Cache:', second.headers['x-cache']);
  } catch (error) {
    console.error('Test operation failed:', error.message);
    process.exit(1);
  }
}

testAdminCache().catch(e => {
  console.error('Test failed:', e.message);
  process.exit(1);
});