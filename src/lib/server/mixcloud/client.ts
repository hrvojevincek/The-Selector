import type { MixSearchResult } from "$lib/types/mix";
import type {
	MixcloudCloudcast,
	MixcloudSearchResponse,
	MixcloudUser,
} from "$lib/types/mixcloud";
import { normalizeArtistName, rankAndLimit } from "../mixes/rank";

const BASE_URL = "https://api.mixcloud.com";

async function mixcloudFetch<T>(path: string): Promise<T> {
	const url = path.startsWith("https://") ? path : `${BASE_URL}${path}`;
	const response = await fetch(url, {
		headers: { Accept: "application/json" },
	});

	if (!response.ok) {
		throw new Error(`Mixcloud API error ${response.status} for ${url}`);
	}

	return response.json() as Promise<T>;
}

export { normalizeArtistName } from "../mixes/rank";

export function toEmbedUrl(mixUrl: string): string {
	return `https://www.mixcloud.com/widget/iframe/?hide_cover=1&light=1&feed=${encodeURIComponent(mixUrl)}`;
}

export function mapCloudcastToResult(
	cloudcast: MixcloudCloudcast,
	source: "search" | "user",
): MixSearchResult {
	return {
		title: cloudcast.name,
		url: cloudcast.url,
		key: `mixcloud:${cloudcast.key}`,
		platform: "mixcloud",
		duration: cloudcast.audio_length ?? 0,
		playCount: cloudcast.play_count ?? 0,
		thumbnail:
			cloudcast.pictures?.large ??
			cloudcast.pictures?.medium ??
			cloudcast.pictures?.small ??
			null,
		embedUrl: toEmbedUrl(cloudcast.url),
		source,
	};
}

export { rankAndLimit };

export async function searchCloudcasts(
	query: string,
	limit = 20,
): Promise<MixcloudCloudcast[]> {
	const params = new URLSearchParams({
		q: query,
		type: "cloudcast",
		limit: String(limit),
	});
	const response = await mixcloudFetch<MixcloudSearchResponse>(
		`/search/?${params.toString()}`,
	);
	return (response.data ?? []) as MixcloudCloudcast[];
}

export async function searchUsers(
	query: string,
	limit = 5,
): Promise<MixcloudUser[]> {
	const params = new URLSearchParams({
		q: query,
		type: "user",
		limit: String(limit),
	});
	const response = await mixcloudFetch<MixcloudSearchResponse>(
		`/search/?${params.toString()}`,
	);
	return (response.data ?? []) as MixcloudUser[];
}

/** Pick the best Mixcloud user match; requires score ≥ 30 (partial username match). */
export function pickBestUserMatch(
	artistName: string,
	users: MixcloudUser[],
): MixcloudUser | null {
	if (!users.length) return null;
	const normalized = normalizeArtistName(artistName);

	let best: MixcloudUser | null = null;
	let bestScore = -1;

	for (const user of users) {
		const candidate = normalizeArtistName(user.name);
		const username = normalizeArtistName(user.username);
		let score = 0;
		if (candidate === normalized || username === normalized) score = 100;
		else if (candidate.includes(normalized) || normalized.includes(candidate))
			score = 50;
		else if (username.includes(normalized.replace(/\s+/g, ""))) score = 30;

		if (score > bestScore) {
			bestScore = score;
			best = user;
		}
	}

	return bestScore >= 30 ? best : null;
}

export async function getUserCloudcasts(
	username: string,
	limit = 20,
): Promise<MixcloudCloudcast[]> {
	const response = await mixcloudFetch<{ data?: MixcloudCloudcast[] }>(
		`/${encodeURIComponent(username)}/cloudcasts/?limit=${limit}`,
	);
	return response.data ?? [];
}

/**
 * Search Mixcloud for cloudcasts and a matched user profile, merge, rank, and limit.
 * Used by {@link findMixesJob} — not cached at this layer.
 */
export async function findMixesForArtist(
	artistName: string,
	maxResults = 5,
): Promise<MixSearchResult[]> {
	const [searchResults, users] = await Promise.all([
		searchCloudcasts(artistName),
		searchUsers(artistName),
	]);

	const mixes: MixSearchResult[] = searchResults.map((c) =>
		mapCloudcastToResult(c, "search"),
	);

	const matchedUser = pickBestUserMatch(artistName, users);
	if (matchedUser) {
		const userMixes = await getUserCloudcasts(matchedUser.username);
		for (const cloudcast of userMixes) {
			mixes.push(mapCloudcastToResult(cloudcast, "user"));
		}
	}

	return rankAndLimit(artistName, mixes, maxResults);
}
