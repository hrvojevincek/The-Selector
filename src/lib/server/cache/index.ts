import { getRedisUrl } from "../env";
import { memoryCache } from "./memory";
import type { CacheProvider } from "./provider";
import { redisCache } from "./redis";

let cacheInstance: CacheProvider | null = null;

/** Returns in-memory cache, or Redis when `REDIS_URL` is set and wired. */
export function getCache(): CacheProvider {
	if (!cacheInstance) {
		const redisUrl = getRedisUrl();
		cacheInstance = redisUrl ? redisCache(redisUrl) : memoryCache();
	}
	return cacheInstance;
}
