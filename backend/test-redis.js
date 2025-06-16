const { createClient } = require('redis');

async function testRedis() {
  // Create a direct Redis client
  const client = createClient({
    url: 'redis://127.0.0.1:6379'
  });
  
  client.on('error', err => console.error('Redis error:', err));
  client.on('connect', () => console.log('Redis connected'));
  
  try {
    console.log('Connecting to Redis...');
    await client.connect();
    
    console.log('Ping result:', await client.ping());
    
    // Set and get a test value
    await client.set('test', 'Hello Redis');
    const value = await client.get('test');
    console.log('Test value:', value);
    
    await client.quit();
    console.log('Redis test completed successfully');
  } catch (err) {
    console.error('Redis test failed:', err);
  }
}

testRedis();