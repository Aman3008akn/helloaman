const { createClient } = require('redis');

/**
 * Redis Client Connection
 * Used for caching, rate limiting, and session management
 */
let redisClient = null;

const connectRedis = async () => {
  try {
    const redisURL = process.env.REDIS_URL;
    
    if (!redisURL) {
      console.warn('⚠️ REDIS_URL not defined. Running without Redis cache.');
      return null;
    }

    redisClient = createClient({
      url: redisURL,
    });

    redisClient.on('error', (err) => {
      console.error('❌ Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis Connected');
    });

    await redisClient.connect();
    
    return redisClient;
  } catch (error) {
    console.error('❌ Failed to connect to Redis:', error.message);
    console.warn('⚠️ Continuing without Redis. Rate limiting will be disabled.');
    return null;
  }
};

const getRedisClient = () => {
  return redisClient;
};

/**
 * Rate limiting helper using Redis
 */
const checkRateLimit = async (userId, limit = 10, windowSeconds = 60) => {
  if (!redisClient) {
    return { allowed: true }; // Skip rate limiting if Redis is not available
  }

  try {
    const key = `ratelimit:${userId}`;
    const current = await redisClient.incr(key);
    
    if (current === 1) {
      await redisClient.expire(key, windowSeconds);
    }

    const ttl = await redisClient.ttl(key);
    
    if (current > limit) {
      return {
        allowed: false,
        remaining: 0,
        retryAfter: ttl,
      };
    }

    return {
      allowed: true,
      remaining: limit - current,
      retryAfter: 0,
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    return { allowed: true }; // Fail open
  }
};

module.exports = {
  connectRedis,
  getRedisClient,
  checkRateLimit,
};
