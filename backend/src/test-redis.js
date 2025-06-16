const redis = require('./config/redis');

// Try to set a value
redis.set('test', 'working')
  .then(() => console.log('Redis connection successful'))
  .catch(err => console.error('Redis connection failed:', err))
  .finally(() => process.exit());