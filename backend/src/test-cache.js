const axios = require('axios');
const redis = require('./config/redis');

// Update with your fresh token
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODQxM2RkMTk2MmE0YTI1OTNlMjMwMjYiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NDkxNTc4NjIsImV4cCI6MTc0OTE1OTY2Mn0.oYvLVNDhgcbyY085Kzs60-1wp1UkXHrlH_thZbk_T0k';

async function testCache() {
  try {
    // Check if a cache entry exists already
    const cacheKey = 'apartments:/api/apartments';
    const cachedValue = await redis.get(cacheKey);
    
    if (cachedValue) {
      console.log('Cache already exists, clearing it first...');
      await redis.del(cacheKey);
    }
    
    console.log('Making first request (should be a MISS)...');
    const firstResponse = await axios.get('http://localhost:5001/api/apartments', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('First request cache status:', firstResponse.headers['x-cache']);
    console.log('Data items returned:', firstResponse.data.length || 'Object');
    
    console.log('\nMaking second request (should be a HIT)...');
    const secondResponse = await axios.get('http://localhost:5001/api/apartments', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('Second request cache status:', secondResponse.headers['x-cache']);
    console.log('Data items returned:', secondResponse.data.length || 'Object');
    
    // Verify data is the same
    console.log('\nData is identical:', 
      JSON.stringify(firstResponse.data) === JSON.stringify(secondResponse.data));
      
    // Check Redis directly
    const redisValue = await redis.get(cacheKey);
    console.log('Cache exists in Redis:', !!redisValue);
    
    if (redisValue) {
      console.log('Redis caching is working correctly!');
    }
  } catch (error) {
    console.error('Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
  process.exit();
}

testCache();