const axios = require('axios');
const redis = require('./config/redis');

// First tenant
const tenant1Token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODQyZDgzZTJiMzE1NDlhYWI4ZmMyMjYiLCJyb2xlIjoidGVuYW50IiwiaWF0IjoxNzQ5MjExOTE4LCJleHAiOjE3NDkyMTM3MTh9.T4tpDDXfwLpll0GrVo6DjU6E_GsFtHtXSgZaOT7X4dg';
const tenant1Id = '6842d83e2b31549aab8fc226';

// Second tenant
const tenant2Token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODQyZDliYTljZmZkYmQzYTRjNTA5NjEiLCJyb2xlIjoidGVuYW50IiwiaWF0IjoxNzQ5MjExODU2LCJleHAiOjE3NDkyMTM2NTZ9.YmIkA7-cZOr28EXMz0uBab7VwCzU5iRu5K83PqSjfig';
const tenant2Id = '6842d9ba9cffdbd3a4c50961';

async function testMultiTenantCache() {
  const key1 = redis.getKey('apartments', '/api/apartments/tenant', tenant1Id);
  const key2 = redis.getKey('apartments', '/api/apartments/tenant', tenant2Id);

  // Clear both caches
  await redis.del(key1);
  await redis.del(key2);

  // Tenant 1: MISS
  const t1First = await axios.get('http://localhost:5001/api/apartments/tenant', {
    headers: { Authorization: `Bearer ${tenant1Token}` }
  });
  console.log('Tenant 1 first X-Cache:', t1First.headers['x-cache']);

  // Tenant 1: HIT
  const t1Second = await axios.get('http://localhost:5001/api/apartments/tenant', {
    headers: { Authorization: `Bearer ${tenant1Token}` }
  });
  console.log('Tenant 1 second X-Cache:', t1Second.headers['x-cache']);

  // Tenant 2: MISS
  const t2First = await axios.get('http://localhost:5001/api/apartments/tenant', {
    headers: { Authorization: `Bearer ${tenant2Token}` }
  });
  console.log('Tenant 2 first X-Cache:', t2First.headers['x-cache']);

  // Tenant 2: HIT
  const t2Second = await axios.get('http://localhost:5001/api/apartments/tenant', {
    headers: { Authorization: `Bearer ${tenant2Token}` }
  });
  console.log('Tenant 2 second X-Cache:', t2Second.headers['x-cache']);
}

testMultiTenantCache().catch(e => {
  console.error('Test failed:', e.message);
  process.exit(1);
});