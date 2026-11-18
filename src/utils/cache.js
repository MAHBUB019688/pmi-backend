const crypto = require("crypto");
const env = require("../config/env");
const { getRedis, isRedisReady } = require("../config/redis");

const PRODUCTS_LIST_VERSION_KEY = "cache:products:version";
const PRODUCTS_LIST_PREFIX = "cache:products:list";

function stableStringify(value) {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value ?? null);
  }

  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }

  const keys = Object.keys(value).sort();
  return `{${keys
    .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
    .join(",")}}`;
}

function hashPayload(payload) {
  return crypto.createHash("sha1").update(stableStringify(payload)).digest("hex");
}

async function cacheGet(key) {
  if (!isRedisReady()) return null;

  try {
    return await getRedis().get(key);
  } catch (err) {
    console.error("Redis GET failed:", err.message);
    return null;
  }
}

async function cacheSet(key, value, ttlSeconds = env.redisCacheTtlSeconds) {
  if (!isRedisReady()) return false;

  try {
    await getRedis().set(key, value, { ex: ttlSeconds });
    return true;
  } catch (err) {
    console.error("Redis SET failed:", err.message);
    return false;
  }
}

async function cacheIncr(key) {
  if (!isRedisReady()) return null;

  try {
    return await getRedis().incr(key);
  } catch (err) {
    console.error("Redis INCR failed:", err.message);
    return null;
  }
}

async function getProductsListVersion() {
  const version = await cacheGet(PRODUCTS_LIST_VERSION_KEY);
  if (version == null || version === "") return 0;

  const parsed = Number(version);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

async function productsListCacheKey(query = {}) {
  const version = await getProductsListVersion();
  const digest = hashPayload({
    page: query.page,
    per_page: query.per_page,
    category_id: query.category_id,
    search: query.search,
    min_price: query.min_price,
    max_price: query.max_price,
    availability: query.availability,
    sort_by: query.sort_by,
    sort_dir: query.sort_dir,
  });

  return `${PRODUCTS_LIST_PREFIX}:v${version}:${digest}`;
}

async function invalidateProductsListCache() {
  return cacheIncr(PRODUCTS_LIST_VERSION_KEY);
}

module.exports = {
  PRODUCTS_LIST_VERSION_KEY,
  PRODUCTS_LIST_PREFIX,
  stableStringify,
  cacheGet,
  cacheSet,
  cacheIncr,
  productsListCacheKey,
  invalidateProductsListCache,
  isRedisReady,
};
