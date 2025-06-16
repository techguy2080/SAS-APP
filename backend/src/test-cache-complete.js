const axios = require('axios');
const redis = require('./config/redis');

// Updated admin token from your login
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODQyYmYyZjFhNDg2ZWU5MWYxNmJlYTQiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NDkyMTYzODgsImV4cCI6MTc0OTIxODE4OH0.rOTErZjyml93P9HxkjJpaOpMM_OIGR2nBJ1NhtbXBJU';

async function testCaching() {
  // Use the same cache key logic as your middleware
  const cacheKey = redis.getKey('apartments', '/api/apartments');

  // 1. Clear cache before starting
  await redis.del(cacheKey);

  // 2. First request (should be a MISS)
  console.log('Making first request (should be MISS)...');
  const first = await axios.get('http://localhost:5001/api/apartments', {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('First request X-Cache:', first.headers['x-cache']);

  // 3. Second request (should be a HIT)
  console.log('Making second request (should be HIT)...');
  const second = await axios.get('http://localhost:5001/api/apartments', {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('Second request X-Cache:', second.headers['x-cache']);

  // 4. Check cache exists in Redis
  const redisValue = await redis.get(cacheKey);
  console.log('Cache exists in Redis:', !!redisValue);

  // 5. Check TTL (time to live)
  if (redis.client && redis.client.ttl) {
    const ttl = await redis.client.ttl(cacheKey);
    console.log('Cache TTL (seconds):', ttl);
  }

  // 6. Print cache stats if available
  if (redis.getStats) {
    console.log('Cache stats:', redis.getStats());
  }

  // 7. Invalidate cache by creating a new apartment (simulate data change)
  console.log('Creating new apartment to invalidate cache...');
  await axios.post('http://localhost:5001/api/apartments', {
    name: "Test Apt " + Date.now(),
    address: "123 Test St",
    unitNumber: "T1",
    floor: 1,
    numberOfRooms: 2,
    sizeSqFt: 800,
    rent: 1200,
    manager: "6842c79c736ba40f9e95c452" // Updated to your actual manager ID
  }, { headers: { Authorization: `Bearer ${token}` } });

  // 8. Request again (should be MISS after invalidation)
  const afterInvalidate = await axios.get('http://localhost:5001/api/apartments', {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('After invalidation X-Cache:', afterInvalidate.headers['x-cache']);

  process.exit();
}

testCaching().catch(e => {
  console.error('Test failed:', e.message);
  process.exit(1);
});