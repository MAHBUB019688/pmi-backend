const { Redis } = require("@upstash/redis");
const env = require("./env");

let client = null;

if (env.redisConfigured) {
  client = new Redis({
    url: env.upstashRedisRestUrl,
    token: env.upstashRedisRestToken,
  });
} else if (env.redisEnabled) {
  console.warn(
    "Redis is enabled but UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are missing",
  );
}

function isRedisReady() {
  return Boolean(client);
}

function getRedis() {
  return client;
}

module.exports = {
  redis: client,
  getRedis,
  isRedisReady,
};
