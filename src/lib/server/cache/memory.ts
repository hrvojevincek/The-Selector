import type { CacheProvider } from "./provider";

type Entry = {
	value: unknown;
	expiresAt: number;
};

export function memoryCache(): CacheProvider {
	const store = new Map<string, Entry>();

	return {
		async get<T>(key: string): Promise<T | null> {
			const entry = store.get(key);
			if (!entry) return null;
			if (Date.now() > entry.expiresAt) {
				store.delete(key);
				return null;
			}
			return entry.value as T;
		},
		async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
			store.set(key, {
				value,
				expiresAt: Date.now() + ttlSeconds * 1000,
			});
		},
	};
}
