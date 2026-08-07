import type { CacheProvider } from "./provider";

/**
 * Stub for Upstash Redis / Vercel KV. Wire @upstash/redis when REDIS_URL is set.
 */
export function redisCache(_url: string): CacheProvider {
	throw new Error(
		"Redis cache is not configured. Install @upstash/redis and implement redisCache(), or remove REDIS_URL.",
	);
}
