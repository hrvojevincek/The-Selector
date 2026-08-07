const windows = new Map<string, number[]>();

/**
 * In-memory sliding-window rate limiter (resets on cold start; not distributed).
 * @returns `retryAfterMs` when the limit is exceeded.
 */
export function checkRateLimit(
	key: string,
	limit: number,
	windowMs: number,
): { allowed: boolean; retryAfterMs?: number } {
	const now = Date.now();
	const windowStart = now - windowMs;
	const timestamps = (windows.get(key) ?? []).filter((t) => t > windowStart);

	if (timestamps.length >= limit) {
		const retryAfterMs = timestamps[0] + windowMs - now;
		return { allowed: false, retryAfterMs };
	}

	timestamps.push(now);
	windows.set(key, timestamps);
	return { allowed: true };
}
