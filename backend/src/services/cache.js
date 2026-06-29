const Redis = require('ioredis');
const config = require('../config');

let redis = null;

const initCache = () => {
  if (!config.redis.url) return null;
  try {
    redis = new Redis(config.redis.url, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 3) return null;
        return Math.min(times * 200, 2000);
      },
    });

    redis.on('error', (err) => {
      console.warn('[Cache] Redis error:', err.message);
    });

    redis.on('connect', () => {
      console.log('[Cache] Redis connected');
    });

    return redis;
  } catch (err) {
    console.warn('[Cache] Failed to connect to Redis:', err.message);
    return null;
  }
};

const get = async (key) => {
  if (!redis) return null;
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

const set = async (key, value, ttlSeconds = 300) => {
  if (!redis) return;
  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(value));
  } catch {}
};

const del = async (key) => {
  if (!redis) return;
  try {
    await redis.del(key);
  } catch {}
};

const keys = async (pattern) => {
  if (!redis) return [];
  try {
    return await redis.keys(pattern);
  } catch {
    return [];
  }
};

const hget = async (key, field) => {
  if (!redis) return null;
  try {
    const data = await redis.hget(key, field);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

const hset = async (key, field, value, ttlSeconds = 300) => {
  if (!redis) return;
  try {
    await redis.hset(key, field, JSON.stringify(value));
    if (ttlSeconds) await redis.expire(key, ttlSeconds);
  } catch {}
};

module.exports = { initCache, get, set, del, keys, hget, hset };
