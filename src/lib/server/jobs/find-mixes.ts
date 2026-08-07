import type { FindMixesInput, FindMixesOutput } from "$lib/types/jobs";
import type { MixSearchResult } from "$lib/types/mixcloud";
import { getCache } from "../cache";
import { findMixesForArtist, normalizeArtistName } from "../mixcloud/client";
import { searchDjMixes } from "../youtube/client";

const CACHE_TTL_SECONDS = 60 * 60 * 24;
const DEFAULT_MAX_RESULTS = 5;
/** Max parallel artist lookups per request. */
const CONCURRENCY = 3;

/** Run async work over items with a fixed worker pool. */
async function mapWithConcurrency<T, R>(
	items: T[],
	concurrency: number,
	fn: (item: T) => Promise<R>,
): Promise<R[]> {
	const results: R[] = new Array(items.length);
	let index = 0;

	async function worker() {
		while (index < items.length) {
			const current = index++;
			results[current] = await fn(items[current]);
		}
	}

	await Promise.all(
		Array.from({ length: Math.min(concurrency, items.length) }, () => worker()),
	);
	return results;
}

/**
 * Finds DJ mixes for each artist via Mixcloud (and YouTube when wired).
 * Results are keyed by Spotify artist ID and cached for 24h per normalized name.
 *
 * @see {@link findMixesForArtist} for ranking logic
 * @see {@link searchDjMixes} for optional YouTube results
 */
export async function findMixesJob(
	input: FindMixesInput,
): Promise<FindMixesOutput> {
	const start = Date.now();
	const cache = getCache();
	const maxResults = input.options?.maxResultsPerArtist ?? DEFAULT_MAX_RESULTS;
	const results: Record<string, MixSearchResult[]> = {};
	let cached = 0;
	let fetched = 0;

	await mapWithConcurrency(input.artists, CONCURRENCY, async (artist) => {
		const cacheKey = `mixcloud:artist:${normalizeArtistName(artist.name)}`;
		const cachedResult = await cache.get<MixSearchResult[]>(cacheKey);

		if (cachedResult) {
			results[artist.spotifyId] = cachedResult;
			cached++;
			return;
		}

		const mixcloudResults = await findMixesForArtist(artist.name, maxResults);
		const youtubeResults = await searchDjMixes(artist.name);
		const combined = [...mixcloudResults, ...youtubeResults];

		await cache.set(cacheKey, combined, CACHE_TTL_SECONDS);
		results[artist.spotifyId] = combined;
		fetched++;
	});

	return {
		results,
		meta: {
			cached,
			fetched,
			durationMs: Date.now() - start,
		},
	};
}
