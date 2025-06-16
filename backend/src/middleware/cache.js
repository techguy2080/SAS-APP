const redis = require('../config/redis');

const cache = (dataType, ttl = null) => async (req, res, next) => {
  if (req.method !== 'GET') return next();

  // Extract tenant ID from userId if role is tenant
  const tenantId = req.user?.role === 'tenant' ? req.user.userId : null;
  console.log(`Cache middleware: User ID=${req.user?.userId}, Role=${req.user?.role}, TenantID=${tenantId}`);
  
  const key = redis.getKey(dataType, req.originalUrl, tenantId);
  console.log(`Generated cache key: ${key}`);

  try {
    const cached = await redis.get(key);

    if (cached) {
      res.set('X-Cache', 'HIT');
      // Parse the cached string back to JSON before sending
      return res.json(JSON.parse(cached));
    }

    const originalJson = res.json.bind(res);
    res.json = (body) => {
      console.log(`Setting cache for key: ${key}`);
      redis.set(key, JSON.stringify(body), dataType, ttl); // <-- FIXED
      res.set('X-Cache', 'MISS');
      return originalJson(body);
    };

    next();
  } catch (error) {
    console.error('Cache middleware error:', error);
    next();
  }
};

module.exports = cache;