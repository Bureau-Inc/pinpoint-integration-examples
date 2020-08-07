import { appConfig } from "./appConfig";
const Redis = require("ioredis");

const REDIS_URL = appConfig.REDIS_CLUSTER_URL;
const cache = new Redis(REDIS_URL);
const MAX_CACHE_RETRY_ATTEMPTS = 20;
let cacheConnectionAttempts = 0;

/**
 * Cache connection established event
 * 
 */
cache.on("connect", () => {
  console.log(`Cache connected`);
  cacheConnectionAttempts = 0;
});

/**
 * Cache error event
 * 
 */
cache.on("error", (cacheError) => {
  if (cacheConnectionAttempts >= MAX_CACHE_RETRY_ATTEMPTS) {
    console.error(`Could not connect to cache after ${cacheConnectionAttempts} attempts. Killing process.`);
    process.exit(1);
  }
  console.log(`Error while connecting to cache: ${cacheError.message} ${REDIS_URL}`);
  cacheConnectionAttempts++;
});

export default cache
